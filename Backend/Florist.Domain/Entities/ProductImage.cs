using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class ProductImage : BaseEntity
    {
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsPrimary { get; set; } = false;
        
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
    }
}
