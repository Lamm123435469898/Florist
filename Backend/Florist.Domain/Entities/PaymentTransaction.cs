using System;
using Florist.Domain.Common;
using Florist.Domain.Enums;

namespace Florist.Domain.Entities
{
    public class PaymentTransaction : BaseEntity
    {
        public PaymentStatus Status { get; set; }
        public string? ProviderResponse { get; set; }
        
        public Guid PaymentId { get; set; }
        public Payment? Payment { get; set; }
    }
}
