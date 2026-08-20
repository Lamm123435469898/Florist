using Florist.Application.DTOs.Orders;
using Florist.Application.DTOs.Payments;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Repositories;
using Florist.Application.Services;
using Florist.Domain.Entities;
using Florist.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Florist.UnitTests.Services
{
    public class BusinessLogicTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<ICartRepository> _cartRepoMock;
        private readonly Mock<IVoucherRepository> _voucherRepoMock;
        private readonly Mock<IInventoryService> _inventoryServiceMock;
        private readonly Mock<IUnitOfWork> _uowMock;
        private readonly Mock<ICurrentUserService> _currentUserMock;
        private readonly OrderService _orderService;

        private readonly Mock<IConfiguration> _configMock;
        private readonly PaymentService _paymentService;

        public BusinessLogicTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _cartRepoMock = new Mock<ICartRepository>();
            _voucherRepoMock = new Mock<IVoucherRepository>();
            _inventoryServiceMock = new Mock<IInventoryService>();
            _uowMock = new Mock<IUnitOfWork>();
            _currentUserMock = new Mock<ICurrentUserService>();
            _orderService = new OrderService(
                _orderRepoMock.Object, _cartRepoMock.Object, _voucherRepoMock.Object,
                _inventoryServiceMock.Object, _uowMock.Object, _currentUserMock.Object);

            _configMock = new Mock<IConfiguration>();
            _paymentService = new PaymentService(_orderRepoMock.Object, _configMock.Object);
        }

        [Fact]
        public async Task CreateOrderAsync_WithFixedVoucherExceedingSubtotal_ShouldNotHaveNegativeTotal()
        {
            var userId = Guid.NewGuid();
            var cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Items = new List<CartItem>
                {
                    new CartItem { Quantity = 1, ProductVariant = new ProductVariant { Price = 100000 } }
                }
            };

            var voucher = new Voucher
            {
                Id = Guid.NewGuid(),
                Code = "MINUS500K",
                DiscountType = VoucherDiscountType.FIXED_AMOUNT,
                DiscountValue = 500000 // Exceeds 100,000 subtotal
            };

            _cartRepoMock.Setup(x => x.GetCartByUserIdAsync(userId)).ReturnsAsync(cart);
            _voucherRepoMock.Setup(x => x.IsValidForUserAsync(voucher.Code, userId, It.IsAny<decimal>())).ReturnsAsync(true);
            _voucherRepoMock.Setup(x => x.GetByCodeAsync(voucher.Code)).ReturnsAsync(voucher);

            Order createdOrder = null!;
            _orderRepoMock.Setup(x => x.CreateAsync(It.IsAny<Order>())).Callback<Order>(o => createdOrder = o).ReturnsAsync((Order o) => o);

            var request = new CreateOrderRequest { VoucherCode = "MINUS500K" };

            // Act
            await _orderService.CreateOrderAsync(userId, request);

            // Assert
            createdOrder.Should().NotBeNull();
            createdOrder.SubTotal.Should().Be(100000);
            createdOrder.DiscountAmount.Should().Be(100000); // Capped at Subtotal
            createdOrder.ShippingFee.Should().Be(30000); // 100k < 500k, so 30k shipping
            createdOrder.FinalTotal.Should().Be(30000); // 100k - 100k + 30k
            createdOrder.Payment!.Amount.Should().Be(30000);
        }

        [Fact]
        public async Task CreatePaymentAsync_ShouldUseOrderAmountNotRequestAmount()
        {
            var userId = Guid.NewGuid();
            var orderId = Guid.NewGuid();
            var paymentId = Guid.NewGuid();

            var order = new Order
            {
                Id = orderId,
                UserId = userId,
                Payment = new Payment
                {
                    Id = paymentId,
                    Amount = 500000, // Authoritative DB Amount
                    PaymentProvider = "VNPAY",
                    Status = PaymentStatus.PENDING
                }
            };

            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync(order);

            // The client tries to pay with "Amount: 1" but we removed it from the DTO,
            // however, even if it was there, the service shouldn't use it.
            var request = new CreatePaymentRequest
            {
                OrderId = orderId,
                PaymentMethod = "VNPAY"
            };

            // Act
            var result = await _paymentService.CreatePaymentAsync(userId, request);

            // Assert
            // The generated URL must contain the correct amount (500000 * 100 = 50000000)
            result.PaymentUrl.Should().Contain("vnp_Amount=50000000"); 
        }
    }
}
