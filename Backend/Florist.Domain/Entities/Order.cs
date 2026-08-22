using System;
using System.Collections.Generic;
using Florist.Domain.Common;
using Florist.Domain.Enums;

namespace Florist.Domain.Entities
{
    public class Order : BaseEntity
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string? Notes { get; set; }
        
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal FinalTotal { get; set; }
        
        public OrderStatus Status { get; set; } = OrderStatus.PENDING;
        public ShippingStatus ShippingStatus { get; set; } = ShippingStatus.PENDING;
        public string? Carrier { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        public Guid? VoucherId { get; set; }
        public Voucher? Voucher { get; set; }
        
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public Payment? Payment { get; set; }
    }
}
