using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class VoucherUsage : BaseEntity
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        public Guid VoucherId { get; set; }
        public Voucher? Voucher { get; set; }
        
        public Guid OrderId { get; set; }
    }
}
