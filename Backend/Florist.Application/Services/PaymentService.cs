using Florist.Application.DTOs.Payments;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Enums;
using System;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace Florist.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IConfiguration _config;

        public PaymentService(IOrderRepository orderRepo, IConfiguration config)
        {
            _orderRepo = orderRepo;
            _config = config;
        }

        public async Task<PaymentResultDto> CreatePaymentAsync(Guid userId, CreatePaymentRequest request)
        {
            var order = await _orderRepo.GetByIdAsync(request.OrderId)
                ?? throw new NotFoundException($"Order {request.OrderId} not found.");

            if (order.UserId != userId)
                throw new ForbiddenException("Access denied. You do not own this order.");

            if (order.Payment == null)
                throw new BusinessRuleException("No payment record found for this order.");

            return request.PaymentMethod.ToUpper() switch
            {
                "COD" => new PaymentResultDto
                {
                    PaymentId = order.Payment.Id,
                    Status = "PENDING",
                    Message = "COD payment created. Pay on delivery."
                },
                "VNPAY" => new PaymentResultDto
                {
                    PaymentId = order.Payment.Id,
                    Status = "PENDING",
                    PaymentUrl = BuildVNPayUrl(order.Payment.Id, order.Payment.Amount, request.ReturnUrl ?? ""),
                    Message = "Redirect user to VNPay."
                },
                "MOMO" => new PaymentResultDto
                {
                    PaymentId = order.Payment.Id,
                    Status = "PENDING",
                    PaymentUrl = BuildMoMoUrl(order.Payment.Id, order.Payment.Amount),
                    Message = "Redirect user to MoMo."
                },
                _ => throw new BadRequestException($"Unsupported payment method: {request.PaymentMethod}")
            };
        }

        public async Task<bool> ProcessCallbackAsync(PaymentCallbackDto callback)
        {
            // Signature verification must happen here before trusting the callback
            if (!VerifySignature(callback))
            {
                return false; // Invalid signature
            }

            if (!Guid.TryParse(callback.OrderId, out var orderId)) return false;
            var order = await _orderRepo.GetByIdAsync(orderId);
            
            // 4. OrderId không tồn tại -> REJECT
            if (order?.Payment == null) return false;

            // 5 & 6. TransactionId đã được xử lý hoặc webhook gửi 2 lần -> Idempotent
            if (order.Payment.Status == PaymentStatus.PAID)
            {
                // Already paid, return true so webhook provider knows it's received
                return true;
            }

            // 3 & 7. Amount bị thay đổi hoặc không khớp -> REJECT
            if (callback.Amount != order.Payment.Amount)
            {
                return false; 
            }

            if (callback.Status == "SUCCESS" || callback.Status == "00")
            {
                order.Payment.Status = PaymentStatus.PAID;
                order.Payment.TransactionId = callback.TransactionId;
                order.Status = OrderStatus.CONFIRMED;
            }
            else
            {
                order.Payment.Status = PaymentStatus.FAILED;
            }

            await _orderRepo.UpdateAsync(order);
            return true;
        }

        public async Task<AdminPaymentDto?> GetPaymentByOrderIdAsync(Guid orderId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId);
            if (order?.Payment == null) return null;
            return new AdminPaymentDto
            {
                Id = order.Payment.Id,
                OrderId = orderId,
                PaymentProvider = order.Payment.PaymentProvider,
                Amount = order.Payment.Amount,
                Status = order.Payment.Status.ToString(),
                TransactionId = order.Payment.TransactionId,
                CreatedAt = order.Payment.CreatedAt
            };
        }

        private bool VerifySignature(PaymentCallbackDto callback)
        {
            if (string.IsNullOrEmpty(callback.Signature) || string.IsNullOrEmpty(callback.TransactionId)) return false;

            // 9. Secret key không được hard-code
            string secretKey = _config["Payment:VNPaySecret"] ?? string.Empty; 
            if (string.IsNullOrEmpty(secretKey)) return false;

            string rawData = $"{callback.OrderId}|{callback.Amount}|{callback.TransactionId}|{callback.Status}";
            
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            var expectedSignatureBytes = Encoding.UTF8.GetBytes(BitConverter.ToString(hash).Replace("-", "").ToLower());
            var actualSignatureBytes = Encoding.UTF8.GetBytes(callback.Signature.ToLower());

            // 8. Constant-time comparison
            if (expectedSignatureBytes.Length != actualSignatureBytes.Length)
                return false;

            return CryptographicOperations.FixedTimeEquals(expectedSignatureBytes, actualSignatureBytes);
        }

        private string BuildVNPayUrl(Guid paymentId, decimal amount, string returnUrl)
        {
            // TODO: Build actual VNPay URL with proper HMAC-SHA512 signature
            return $"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount={amount * 100}&vnp_TxnRef={paymentId}&vnp_ReturnUrl={returnUrl}";
        }

        private string BuildMoMoUrl(Guid paymentId, decimal amount)
        {
            // TODO: Build actual MoMo URL
            return $"https://test-payment.momo.vn/pay?orderId={paymentId}&amount={amount}";
        }
    }
}


