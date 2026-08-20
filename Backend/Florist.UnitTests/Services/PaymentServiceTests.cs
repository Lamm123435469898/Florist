using Florist.Application.DTOs.Payments;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces.Repositories;
using Florist.Application.Services;
using Florist.Domain.Entities;
using Florist.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Florist.UnitTests.Services
{
    public class PaymentServiceTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly PaymentService _sut;
        private const string SecretKey = "test_secret_key";

        public PaymentServiceTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _configMock = new Mock<IConfiguration>();
            _configMock.Setup(x => x["Payment:VNPaySecret"]).Returns(SecretKey);
            _sut = new PaymentService(_orderRepoMock.Object, _configMock.Object);
        }

        private string GenerateSignature(string orderId, decimal amount, string transactionId, string status)
        {
            string rawData = $"{orderId}|{amount}|{transactionId}|{status}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(SecretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }

        [Fact]
        public async Task ProcessCallbackAsync_ValidSignature_ShouldUpdateOrderStatus()
        {
            var orderId = Guid.NewGuid();
            var paymentId = Guid.NewGuid();
            var amount = 100000m;
            var callback = new PaymentCallbackDto
            {
                OrderId = orderId.ToString(),
                Amount = amount,
                TransactionId = "TXN123",
                Status = "SUCCESS"
            };
            callback.Signature = GenerateSignature(callback.OrderId, amount, "TXN123", "SUCCESS");

            var order = new Order
            {
                Id = orderId,
                Status = OrderStatus.PENDING,
                Payment = new Payment { Id = paymentId, Status = PaymentStatus.PENDING, Amount = amount }
            };
            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync(order);
            _orderRepoMock.Setup(x => x.UpdateAsync(It.IsAny<Order>())).ReturnsAsync(order);

            var result = await _sut.ProcessCallbackAsync(callback);

            result.Should().BeTrue();
            order.Status.Should().Be(OrderStatus.CONFIRMED);
            order.Payment.Status.Should().Be(PaymentStatus.PAID);
        }

        [Fact]
        public async Task ProcessCallbackAsync_InvalidSignature_ShouldReject()
        {
            var callback = new PaymentCallbackDto
            {
                OrderId = Guid.NewGuid().ToString(),
                Amount = 100000,
                TransactionId = "TXN123",
                Status = "SUCCESS",
                Signature = "fake_invalid_signature"
            };

            var result = await _sut.ProcessCallbackAsync(callback);

            result.Should().BeFalse();
            _orderRepoMock.Verify(x => x.UpdateAsync(It.IsAny<Order>()), Times.Never);
        }

        [Fact]
        public async Task ProcessCallbackAsync_ValidSignatureButAmountChanged_ShouldReject()
        {
            var orderId = Guid.NewGuid();
            var amount = 100000m;
            var callback = new PaymentCallbackDto
            {
                OrderId = orderId.ToString(),
                Amount = amount,
                TransactionId = "TXN123",
                Status = "SUCCESS"
            };
            callback.Signature = GenerateSignature(callback.OrderId, amount, "TXN123", "SUCCESS");

            var order = new Order
            {
                Id = orderId,
                Payment = new Payment { Amount = 50000m } // Database amount is different!
            };
            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync(order);

            var result = await _sut.ProcessCallbackAsync(callback);

            result.Should().BeFalse();
            _orderRepoMock.Verify(x => x.UpdateAsync(It.IsAny<Order>()), Times.Never);
        }

        [Fact]
        public async Task ProcessCallbackAsync_ValidSignatureButOrderNotFound_ShouldReject()
        {
            var orderId = Guid.NewGuid();
            var amount = 100000m;
            var callback = new PaymentCallbackDto
            {
                OrderId = orderId.ToString(),
                Amount = amount,
                TransactionId = "TXN123",
                Status = "SUCCESS"
            };
            callback.Signature = GenerateSignature(callback.OrderId, amount, "TXN123", "SUCCESS");

            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync((Order)null);

            var result = await _sut.ProcessCallbackAsync(callback);

            result.Should().BeFalse();
        }

        [Fact]
        public async Task ProcessCallbackAsync_Idempotent_ShouldReturnTrueButNotUpdate()
        {
            var orderId = Guid.NewGuid();
            var amount = 100000m;
            var callback = new PaymentCallbackDto
            {
                OrderId = orderId.ToString(),
                Amount = amount,
                TransactionId = "TXN123",
                Status = "SUCCESS"
            };
            callback.Signature = GenerateSignature(callback.OrderId, amount, "TXN123", "SUCCESS");

            var order = new Order
            {
                Id = orderId,
                Payment = new Payment { Amount = amount, Status = PaymentStatus.PAID } // Already paid
            };
            _orderRepoMock.Setup(x => x.GetByIdAsync(orderId)).ReturnsAsync(order);

            var result = await _sut.ProcessCallbackAsync(callback);

            result.Should().BeTrue();
            _orderRepoMock.Verify(x => x.UpdateAsync(It.IsAny<Order>()), Times.Never);
        }
    }
}

