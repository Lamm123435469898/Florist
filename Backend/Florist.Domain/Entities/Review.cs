using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class Review : BaseEntity
    {
        public int Rating { get; set; }
        public string? Comment { get; set; }
        
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        public Guid ProductId { get; set; }
        public Product? Product { get; set; }
        
        public Guid OrderId { get; set; }
    }
}
