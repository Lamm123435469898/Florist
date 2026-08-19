using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class OrderItem : BaseEntity
    {
        // Snapshot data at the time of purchase
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal => Price * Quantity;
        
        public Guid OrderId { get; set; }
        public Order? Order { get; set; }
        
        public Guid ProductId { get; set; }
        public Guid ProductVariantId { get; set; }
    }
}
