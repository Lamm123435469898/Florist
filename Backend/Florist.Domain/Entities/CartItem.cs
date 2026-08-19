using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class CartItem : BaseEntity
    {
        public int Quantity { get; set; }
        
        public Guid CartId { get; set; }
        public Cart? Cart { get; set; }
        
        public Guid ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }
    }
}
