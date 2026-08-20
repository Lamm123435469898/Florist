using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Florist.API.Middlewares
{
    public class IdempotencyMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<IdempotencyMiddleware> _logger;

        public IdempotencyMiddleware(RequestDelegate next, ILogger<IdempotencyMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue("Idempotency-Key", out var keyValues))
            {
                await _next(context);
                return;
            }

            var idempotencyKey = keyValues.ToString();
            
            // Only apply to POST/PUT/PATCH/DELETE
            if (context.Request.Method == HttpMethods.Get || context.Request.Method == HttpMethods.Head || context.Request.Method == HttpMethods.Options)
            {
                await _next(context);
                return;
            }

            using var scope = context.RequestServices.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var existingRecord = await dbContext.IdempotencyRecords.FirstOrDefaultAsync(r => r.Key == idempotencyKey);

            if (existingRecord != null)
            {
                if (existingRecord.ExpiryDate < DateTime.UtcNow)
                {
                    _logger.LogWarning($"Idempotency key {idempotencyKey} has expired.");
                    // Let it pass or reject it? Usually idempotency keys have an expiry (e.g. 24h).
                    // If expired, maybe we shouldn't allow replay.
                }
                else
                {
                    _logger.LogInformation($"Returning cached response for idempotency key {idempotencyKey}");
                    context.Response.StatusCode = existingRecord.StatusCode;
                    context.Response.ContentType = "application/json";
                    if (!string.IsNullOrEmpty(existingRecord.ResponseBody))
                    {
                        await context.Response.WriteAsync(existingRecord.ResponseBody);
                    }
                    return;
                }
            }

            // Capture the response
            var originalBodyStream = context.Response.Body;
            using var responseBody = new MemoryStream();
            context.Response.Body = responseBody;

            await _next(context);

            context.Response.Body.Seek(0, SeekOrigin.Begin);
            var responseText = await new StreamReader(context.Response.Body).ReadToEndAsync();
            context.Response.Body.Seek(0, SeekOrigin.Begin);

            // Save record only for successful responses
            if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
            {
                var record = new IdempotencyRecord
                {
                    Key = idempotencyKey,
                    Method = context.Request.Method,
                    Path = context.Request.Path,
                    StatusCode = context.Response.StatusCode,
                    ResponseBody = responseText,
                    ExpiryDate = DateTime.UtcNow.AddDays(1) // Keep for 24 hours
                };
                
                dbContext.IdempotencyRecords.Add(record);
                await dbContext.SaveChangesAsync();
            }

            await responseBody.CopyToAsync(originalBodyStream);
        }
    }
}
