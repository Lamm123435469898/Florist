using System;
using System.Collections.Generic;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class Cart : BaseEntity
    {
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
    }
}
