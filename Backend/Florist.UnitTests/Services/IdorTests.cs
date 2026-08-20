using Florist.Application.DTOs.Cart;
using Florist.Application.DTOs.Payments;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Repositories;
using Florist.Application.Services;
using Florist.Domain.Entities;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Florist.UnitTests.Services
{
    public class IdorTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<ICartRepository> _cartRepoMock;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly Mock<IConfiguration> _configMock;

        public IdorTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _cartRepoMock = new Mock<ICartRepository>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _configMock = new Mock<IConfiguration>();
        }

        [Fact]
        public async Task PaymentService_CreatePaymentAsync_WithOtherUsersOrder_ShouldThrowForbiddenException()
        {
            // Arrange
            var sut = new PaymentService(_orderRepoMock.Object, _configMock.Object);
            var userId = Guid.NewGuid();
            var orderOwnerId = Guid.NewGuid();
            var orderId = Guid.NewGuid();

            var order = new Order
            {
                Id = orderId,
                UserId = orderOwnerId // Belongs to someone else
            };
            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync(order);

            var request = new CreatePaymentRequest { OrderId = orderId, PaymentMethod = "COD" };

            // Act
            Func<Task> act = async () => await sut.CreatePaymentAsync(userId, request);

            // Assert
            await act.Should().ThrowAsync<ForbiddenException>()
                .WithMessage("*Access denied*");
        }

        [Fact]
        public async Task PaymentService_CreatePaymentAsync_WithOwnOrder_ShouldSucceed()
        {
            // Arrange
            var sut = new PaymentService(_orderRepoMock.Object, _configMock.Object);
            var userId = Guid.NewGuid();
            var orderId = Guid.NewGuid();

            var order = new Order
            {
                Id = orderId,
                UserId = userId, // Belongs to current user
                Payment = new Payment { Id = Guid.NewGuid() }
            };
            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync(order);

            var request = new CreatePaymentRequest { OrderId = orderId, PaymentMethod = "COD" };

            // Act
            var result = await sut.CreatePaymentAsync(userId, request);

            // Assert
            result.Should().NotBeNull();
            result.Status.Should().Be("PENDING");
        }

        [Fact]
        public async Task OrderService_CancelOrderAsync_WithOtherUsersOrder_ShouldThrowForbiddenException()
        {
            // Arrange
            var sut = new OrderService(
                _orderRepoMock.Object,
                _cartRepoMock.Object,
                new Mock<IVoucherRepository>().Object,
                new Mock<IInventoryService>().Object,
                new Mock<IUnitOfWork>().Object,
                _currentUserServiceMock.Object);

            var userId = Guid.NewGuid();
            var orderOwnerId = Guid.NewGuid();
            var orderId = Guid.NewGuid();

            var order = new Order
            {
                Id = orderId,
                UserId = orderOwnerId // Belongs to someone else
            };
            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync(order);

            // Act
            Func<Task> act = async () => await sut.CancelOrderAsync(orderId, userId);

            // Assert
            await act.Should().ThrowAsync<ForbiddenException>();
        }

        [Fact]
        public async Task CartService_UpdateItemAsync_WithOtherUsersCartItem_ShouldThrowForbiddenException()
        {
            // Arrange
            var sut = new CartService(_cartRepoMock.Object, new Mock<IProductRepository>().Object);
            var userId = Guid.NewGuid();
            var userCartId = Guid.NewGuid();
            var itemId = Guid.NewGuid();
            var otherCartId = Guid.NewGuid();

            var cart = new Cart { Id = userCartId, UserId = userId };
            _cartRepoMock.Setup(x => x.GetOrCreateCartAsync(userId)).ReturnsAsync(cart);

            var item = new CartItem { Id = itemId, CartId = otherCartId }; // Belongs to other cart
            _cartRepoMock.Setup(x => x.GetCartItemByIdAsync(itemId)).ReturnsAsync(item);

            var request = new UpdateCartItemRequest { Quantity = 2 };

            // Act
            Func<Task> act = async () => await sut.UpdateItemAsync(userId, itemId, request);

            // Assert
            await act.Should().ThrowAsync<ForbiddenException>();
        }
    }
}
