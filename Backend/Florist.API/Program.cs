using FluentValidation;
using Florist.API.Middlewares;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Repositories;
using Florist.Application.Services;
using Florist.Infrastructure.Auth;
using Florist.Infrastructure.Auth.Settings;
using Florist.Infrastructure.Data;
using Florist.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Serilog;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

// Add services to the container.
builder.Services.AddControllers();

// Fluent Validation
builder.Services.AddValidatorsFromAssembly(typeof(Florist.Application.Validators.Auth.RegisterRequestValidator).Assembly);

// CORS - Hardcode allowed origins for reliability across all hosting platforms
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:3000",
                  "http://localhost:5173",
                  "http://localhost:8080",
                  "https://floristhcm.netlify.app")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks().AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection") ?? "");

// Swagger with JWT Auth
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Florist API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dependency Injection - Auth
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

// Dependency Injection - Products & Categories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// Dependency Injection - Cart
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartService, CartService>();

// Dependency Injection - Orders
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IVoucherRepository, VoucherRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Dependency Injection - Vouchers, Reviews, Users
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDashboardService, Florist.Infrastructure.Services.DashboardService>();

// Dependency Injection - Additional (Inventory, Payment, Wishlist)
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddHostedService<Florist.Infrastructure.BackgroundJobs.OrderCleanupBackgroundService>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IWishlistRepository, WishlistRepository>();
builder.Services.AddScoped<IWishlistService, WishlistService>();

// Dependency Injection - AuthZ and Audit
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, Florist.API.Services.CurrentUserService>();
builder.Services.AddScoped<Florist.Application.Interfaces.Services.IAuditLogService, Florist.Infrastructure.Services.AuditLogService>();
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationPolicyProvider, Florist.API.Authorization.PermissionPolicyProvider>();
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, Florist.API.Authorization.PermissionAuthorizationHandler>();

// Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings?.Issuer,
            ValidAudience = jwtSettings?.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings?.Secret ?? ""))
        };
    });

var app = builder.Build();

// Manual CORS middleware - handles preflight before anything else can interfere
app.Use(async (context, next) =>
{
    var origin = context.Request.Headers["Origin"].ToString();
    var allowedOrigins = new[] {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://floristhcm.netlify.app"
    };

    if (!string.IsNullOrEmpty(origin) && allowedOrigins.Contains(origin))
    {
        context.Response.Headers.Append("Access-Control-Allow-Origin", origin);
        context.Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        context.Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key");
        context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
    }

    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 204;
        return;
    }

    await next();
});

// Seed Data
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try 
    {
        logger.LogInformation("Starting database migration and seeding...");
        await Florist.Infrastructure.Data.DataSeeder.SeedAsync(scope.ServiceProvider);
        logger.LogInformation("Database migration and seeding completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Failed to migrate or seed the database.");
    }
}

// Use Global Exception Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Use Idempotency Middleware
app.UseMiddleware<IdempotencyMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseIpRateLimiting();

// app.UseHttpsRedirection(); // Not needed - Back4app/cloud platforms handle HTTPS at the edge

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");
app.MapGet("/", () => "Florist API is running! (Render Health Check)");

app.Run();


