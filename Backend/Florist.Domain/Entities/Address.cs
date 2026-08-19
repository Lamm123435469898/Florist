using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class Address : BaseEntity
    {
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string Ward { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
        
        public Guid UserId { get; set; }
        public User? User { get; set; }
    }
}
