using System;
using System.Collections.Generic;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class ProductVariant : BaseEntity
    {
        public string SKU { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string? Size { get; set; }
        public string? Color { get; set; }
        public bool IsActive { get; set; } = true;

        [System.ComponentModel.DataAnnotations.Timestamp]
        public byte[]? RowVersion { get; set; }
        
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
        
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    }
}

