using System;

namespace Florist.Application.DTOs.Vouchers
{
    public class VoucherDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public decimal MinimumOrderValue { get; set; }
        public decimal? MaximumDiscount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public string Status { get; set; } = string.Empty;
    }
    public class ValidateVoucherRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal OrderTotal { get; set; }
    }
    public class ValidateVoucherResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal DiscountAmount { get; set; }
    }
    public class CreateVoucherRequest
    {
        public string Code { get; set; } = string.Empty;
        public string DiscountType { get; set; } = "PERCENTAGE";
        public decimal DiscountValue { get; set; }
        public decimal MinimumOrderValue { get; set; }
        public decimal? MaximumDiscount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
    }
}
