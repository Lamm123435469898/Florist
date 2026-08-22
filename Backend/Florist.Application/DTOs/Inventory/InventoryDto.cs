using System;
using System.Collections.Generic;

namespace Florist.Application.DTOs.Inventory
{
    public class InventoryTransactionDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? ReferenceId { get; set; }
        public string? Note { get; set; }
        public Guid ProductVariantId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdjustStockRequest
    {
        public Guid VariantId { get; set; }
        public int Quantity { get; set; }
        public string Note { get; set; } = string.Empty;
    }
}
