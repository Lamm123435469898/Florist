using Florist.Application.DTOs.Orders;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Repositories;
using Florist.Application.Services;
using Florist.Domain.Entities;
using Florist.Domain.Enums;
using Florist.Infrastructure.Data;
using Florist.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Florist.IntegrationTests
{
    public class ConcurrencyTests : IAsyncLifetime
    {
        private string? _dbName;
        private string? _connectionString;
        private ApplicationDbContext? _dbContext;

        public async Task InitializeAsync()
        {
            _dbName = $"FloristTestDb_{Guid.NewGuid()}";
            _connectionString = $"Server=.;Database={_dbName};Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(_connectionString)
                .Options;

            _dbContext = new ApplicationDbContext(options);
            await _dbContext.Database.MigrateAsync();
        }

        public async Task DisposeAsync()
        {
            if (_dbContext != null)
            {
                await _dbContext.Database.EnsureDeletedAsync();
                await _dbContext.DisposeAsync();
            }
        }

        private ApplicationDbContext CreateNewContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer(_connectionString!)
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task ConcurrentCheckout_WithStock1_ShouldAllowExactlyOneSuccess()
        {
            // 1. Arrange: Create initial data
            var category = new Category { Id = Guid.NewGuid(), Name = "Flowers" };
            var product = new Product { Id = Guid.NewGuid(), CategoryId = category.Id, Name = "Rose", IsActive = true };
            var variant = new ProductVariant { Id = Guid.NewGuid(), ProductId = product.Id, Color = "Red", Price = 100000, Stock = 1, IsActive = true };
            
            _dbContext!.Categories.Add(category);
            _dbContext.Products.Add(product);
            _dbContext.ProductVariants.Add(variant);
            await _dbContext.SaveChangesAsync();

            var variantId = variant.Id;

            // 2. Act: Simulate 2 concurrent checkouts
            var task1 = SimulateCheckoutAsync(variantId, 1);
            var task2 = SimulateCheckoutAsync(variantId, 1);

            Exception? exception1 = null;
            Exception? exception2 = null;

            try { await task1; } catch (Exception ex) { exception1 = ex; }
            try { await task2; } catch (Exception ex) { exception2 = ex; }

            // 3. Assert
            var successCount = 0;
            var conflictCount = 0;

            if (exception1 == null) successCount++;
            else if (exception1 is ConcurrencyException || exception1.InnerException is DbUpdateConcurrencyException) conflictCount++;
            else if (exception1 is BadRequestException || exception1 is BusinessRuleException) conflictCount++;

            if (exception2 == null) successCount++;
            else if (exception2 is ConcurrencyException || exception2.InnerException is DbUpdateConcurrencyException) conflictCount++;
            else if (exception2 is BadRequestException || exception2 is BusinessRuleException) conflictCount++;

            successCount.Should().Be(1, $"Expected 1 success. Ex1: {exception1?.InnerException?.Message ?? exception1?.Message}, Ex2: {exception2?.InnerException?.Message ?? exception2?.Message}");
            conflictCount.Should().Be(1, $"Expected 1 conflict. Ex1: {exception1?.InnerException?.Message ?? exception1?.Message}, Ex2: {exception2?.InnerException?.Message ?? exception2?.Message}");

            using var verifyContext = CreateNewContext();
            var finalVariant = await verifyContext.ProductVariants.FindAsync(variantId);
            finalVariant!.Stock.Should().Be(0, "Stock should be 0 after successful checkout.");
            
            var orderCount = await verifyContext.Orders.CountAsync();
            orderCount.Should().Be(1, "Only one order should have been created.");
        }

        [Fact]
        public async Task ConcurrentCheckout_WithStock5_ShouldHandleMultipleSuccess()
        {
            // 1. Arrange
            var category = new Category { Id = Guid.NewGuid(), Name = "Flowers" };
            var product = new Product { Id = Guid.NewGuid(), CategoryId = category.Id, Name = "Rose", IsActive = true };
            var variant = new ProductVariant { Id = Guid.NewGuid(), ProductId = product.Id, Color = "Red", Price = 100000, Stock = 5, IsActive = true };
            
            _dbContext!.Categories.Add(category);
            _dbContext.Products.Add(product);
            _dbContext.ProductVariants.Add(variant);
            await _dbContext.SaveChangesAsync();

            // 2. Act: Simulate 2 concurrent checkouts of quantity 3
            var task1 = SimulateCheckoutAsync(variant.Id, 3);
            var task2 = SimulateCheckoutAsync(variant.Id, 3);

            Exception? exception1 = null;
            Exception? exception2 = null;

            try { await task1; } catch (Exception ex) { exception1 = ex; }
            try { await task2; } catch (Exception ex) { exception2 = ex; }

            // 3. Assert
            var successCount = (exception1 == null ? 1 : 0) + (exception2 == null ? 1 : 0);
            var conflictCount = 2 - successCount;

            successCount.Should().Be(1, $"Expected 1 success. Ex1: {exception1?.InnerException?.Message ?? exception1?.Message}, Ex2: {exception2?.InnerException?.Message ?? exception2?.Message}");
            conflictCount.Should().Be(1, $"Expected 1 conflict. Ex1: {exception1?.InnerException?.Message ?? exception1?.Message}, Ex2: {exception2?.InnerException?.Message ?? exception2?.Message}");

            using var verifyContext = CreateNewContext();
            var finalVariant = await verifyContext.ProductVariants.FindAsync(variant.Id);
            finalVariant!.Stock.Should().BeGreaterThanOrEqualTo(0, "Stock must never be negative.");
            
            var orderCount = await verifyContext.Orders.CountAsync();
            orderCount.Should().Be(1, "Only one order should have been created.");
        }

        private async Task SimulateCheckoutAsync(Guid variantId, int quantity)
        {
            var userId = Guid.NewGuid();
            
            using var context = CreateNewContext();
            
            var user = new User { Id = userId, Email = $"{userId}@test.com", FullName = "Test", PasswordHash = "hash" };
            context.Users.Add(user);

            // Create user's cart in the DB so OrderService can read it
            var cart = new Cart { Id = Guid.NewGuid(), UserId = userId, Items = new List<CartItem>() };
            cart.Items.Add(new CartItem { Id = Guid.NewGuid(), ProductVariantId = variantId, Quantity = quantity });
            context.Carts.Add(cart);
            await context.SaveChangesAsync();

            var uow = new UnitOfWork(context);
            var orderRepo = new OrderRepository(context);
            var cartRepo = new CartRepository(context);
            
            // Note: IInventoryService is usually used in OrderService.
            // But since the actual DB decrement is often done in InventoryService or via direct EF Core update, 
            // I will use the actual InventoryService if we have it, or mock it if it's external.
            // Looking at the Audit Report, the user asked to decrement inventory.
            // If Florist has a real InventoryService, let's instantiate it.
            var inventoryRepoMock = new Mock<IInventoryRepository>();
            // Since we need real DB updates, let's just use the real InventoryRepository if possible,
            // or we mock it in a way that actually decrements the DB context directly.
            // Actually, let's use the real InventoryService!
            var invRepo = new InventoryRepository(context);
            var invService = new InventoryService(invRepo);

            var voucherRepoMock = new Mock<IVoucherRepository>();
            var currentUserMock = new Mock<ICurrentUserService>();
            currentUserMock.Setup(x => x.UserId).Returns(userId);

            var orderService = new OrderService(orderRepo, cartRepo, voucherRepoMock.Object, invService, uow, currentUserMock.Object);

            var checkoutReq = new CreateOrderRequest
            {
                CustomerName = "Test",
                CustomerEmail = "test@test.com",
                CustomerPhone = "123456",
                ShippingAddress = "Test",
                PaymentMethod = "COD"
            };

            await orderService.CreateOrderAsync(userId, checkoutReq);
        }
    }
}
