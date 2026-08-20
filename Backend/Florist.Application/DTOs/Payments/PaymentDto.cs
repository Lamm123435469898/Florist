using System;

namespace Florist.Application.DTOs.Payments
{
    public class CreatePaymentRequest
    {
        public Guid OrderId { get; set; }
        public string PaymentMethod { get; set; } = "COD";
        public string? ReturnUrl { get; set; }
    }
    public class PaymentResultDto
    {
        public Guid PaymentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? PaymentUrl { get; set; } // For online payments
        public string? TransactionId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
    public class PaymentCallbackDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Signature { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
    }
    public class AdminPaymentDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string PaymentProvider { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
