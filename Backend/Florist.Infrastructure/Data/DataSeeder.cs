using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            await context.Database.MigrateAsync();

            // 1. Seed Permissions
            var allPermissions = new List<string>
            {
                "product.read", "product.create", "product.update", "product.delete",
                "category.read", "category.create", "category.update", "category.delete",
                "cart.read", "cart.create", "cart.update", "cart.delete",
                "order.read", "order.create", "order.update", "order.cancel", "order.refund",
                "inventory.read", "inventory.update",
                "voucher.read", "voucher.create", "voucher.update", "voucher.delete",
                "user.read", "user.update", "user.delete",
                "role.read", "role.create", "role.update", "role.delete",
                "permission.read",
                "review.read", "review.create", "review.update", "review.delete",
                "dashboard.read",
                "auditlog.read"
            };

            foreach (var permName in allPermissions)
            {
                if (!await context.Permissions.AnyAsync(p => p.Name == permName))
                {
                    context.Permissions.Add(new Permission { Id = Guid.NewGuid(), Name = permName });
                }
            }
            await context.SaveChangesAsync();

            // 2. Seed Roles
            var roles = new List<string> { "ADMIN", "STAFF", "USER" };
            foreach (var roleName in roles)
            {
                if (!await context.Roles.AnyAsync(r => r.Name == roleName))
                {
                    context.Roles.Add(new Role { Id = Guid.NewGuid(), Name = roleName });
                }
            }
            await context.SaveChangesAsync();

            // 3. Map RolePermissions
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "ADMIN");
            var staffRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "STAFF");
            var userRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "USER");

            var dbPermissions = await context.Permissions.ToListAsync();

            if (adminRole != null && !await context.RolePermissions.AnyAsync(rp => rp.RoleId == adminRole.Id))
            {
                foreach (var p in dbPermissions)
                {
                    context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = adminRole.Id, PermissionId = p.Id });
                }
            }

            if (staffRole != null && !await context.RolePermissions.AnyAsync(rp => rp.RoleId == staffRole.Id))
            {
                var staffPerms = new[] {
                    "product.read", "product.create", "product.update",
                    "category.read",
                    "cart.read", "cart.create", "cart.update", "cart.delete",
                    "order.read", "order.create", "order.cancel", "order.update",
                    "inventory.read", "inventory.update",
                    "voucher.read",
                    "review.read", "review.create", "review.update",
                    "dashboard.read"
                };
                foreach (var pName in staffPerms)
                {
                    var p = dbPermissions.FirstOrDefault(x => x.Name == pName);
                    if (p != null) context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = staffRole.Id, PermissionId = p.Id });
                }
            }

            if (userRole != null && !await context.RolePermissions.AnyAsync(rp => rp.RoleId == userRole.Id))
            {
                var userPerms = new[] {
                    "product.read", "category.read",
                    "cart.read", "cart.create", "cart.update", "cart.delete",
                    "order.read", "order.create", "order.cancel",
                    "review.read", "review.create", "review.update"
                };
                foreach (var pName in userPerms)
                {
                    var p = dbPermissions.FirstOrDefault(x => x.Name == pName);
                    if (p != null) context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = userRole.Id, PermissionId = p.Id });
                }
            }
            await context.SaveChangesAsync();

            // 4. Seed Admin & Staff Users
            if (!await context.Users.AnyAsync(u => u.Email == "admin@florist.com"))
            {
                var admin = new User { Id = Guid.NewGuid(), Email = "admin@florist.com", FullName = "System Admin", PhoneNumber = "0900000000", PasswordHash = "$2a$11$N94M1/3aZg3O./qT9/p.Fef7zK2qH3jV3p3bW8x1tM3eD.T/f1w.e" };
                context.Users.Add(admin);
                if (adminRole != null) context.UserRoles.Add(new UserRole { UserId = admin.Id, RoleId = adminRole.Id });
            }
            
            if (!await context.Users.AnyAsync(u => u.Email == "staff@florist.com"))
            {
                var staff = new User { Id = Guid.NewGuid(), Email = "staff@florist.com", FullName = "Staff User", PhoneNumber = "0900000001", PasswordHash = "$2a$11$N94M1/3aZg3O./qT9/p.Fef7zK2qH3jV3p3bW8x1tM3eD.T/f1w.e" };
                context.Users.Add(staff);
                if (staffRole != null) context.UserRoles.Add(new UserRole { UserId = staff.Id, RoleId = staffRole.Id });
            }
            await context.SaveChangesAsync();

            // 5. Seed sample product
            if (!await context.Categories.AnyAsync())
            {
                var cat1 = new Category { Id = Guid.NewGuid(), Name = "Hoa Khô (Dry Flowers)", Slug = "hoa-kho", IsActive = true };
                context.Categories.Add(cat1);
                var p1 = new Product { Id = Guid.NewGuid(), Name = "Bó Hoa Baby Khô", Slug = "bo-hoa-baby-kho", Description = "Bó hoa baby khô phong cách Vintage", CategoryId = cat1.Id, IsActive = true };
                context.Products.Add(p1);
                context.ProductVariants.Add(new ProductVariant { Id = Guid.NewGuid(), ProductId = p1.Id, SKU = "BABY-M", Price = 250000, Stock = 100, IsActive = true });
                await context.SaveChangesAsync();
            }
        }
    }
}
