using Florist.Application.DTOs.Payments;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    /// <summary>
    /// Payment abstraction — supports COD, VNPay, MoMo, Stripe
    /// </summary>
    public interface IPaymentService
    {
        Task<PaymentResultDto> CreatePaymentAsync(Guid userId, CreatePaymentRequest request);
        Task<bool> ProcessCallbackAsync(PaymentCallbackDto callback);
        Task<AdminPaymentDto?> GetPaymentByOrderIdAsync(Guid orderId);
    }
}
