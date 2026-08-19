using System;
using System.Collections.Generic;
using Florist.Domain.Common;
using Florist.Domain.Enums;

namespace Florist.Domain.Entities
{
    public class Voucher : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public VoucherDiscountType DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal MinimumOrderValue { get; set; }
        public decimal? MaximumDiscount { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        
        public VoucherStatus Status { get; set; } = VoucherStatus.ACTIVE;
        
        public ICollection<VoucherUsage> VoucherUsages { get; set; } = new List<VoucherUsage>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
