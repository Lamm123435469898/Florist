using System;
using Florist.Domain.Common;
using Florist.Domain.Enums;

namespace Florist.Domain.Entities
{
    public class InventoryTransaction : BaseEntity
    {
        public InventoryTransactionType Type { get; set; }
        public int Quantity { get; set; }
        public string? ReferenceId { get; set; } // e.g. OrderId
        public string? Note { get; set; }
        
        public Guid ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }
    }
}
