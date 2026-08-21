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
        
        public string? PaymentMethod { get; set; }
        public string? PaymentReference { get; set; }
        public decimal? Amount { get; set; }
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
    }
    
    public class SePayWebhookRequest
    {
        public int id { get; set; }
        public string gateway { get; set; } = string.Empty;
        public string transactionDate { get; set; } = string.Empty;
        public string accountNumber { get; set; } = string.Empty;
        public string? code { get; set; }
        public string content { get; set; } = string.Empty;
        public string transferType { get; set; } = string.Empty;
        public decimal transferAmount { get; set; }
        public decimal accumulated { get; set; }
        public string? referenceCode { get; set; }
        public string? description { get; set; }
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
