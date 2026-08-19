using System;
using System.Collections.Generic;
using Florist.Domain.Common;
using Florist.Domain.Enums;

namespace Florist.Domain.Entities
{
    public class Payment : BaseEntity
    {
        public string PaymentProvider { get; set; } = string.Empty; // e.g. VNPay, MoMo, COD
        public decimal Amount { get; set; }
        public PaymentStatus Status { get; set; } = PaymentStatus.PENDING;
        public string? TransactionId { get; set; }
        
        public Guid OrderId { get; set; }
        public Order? Order { get; set; }
        
        public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();
    }
}
