using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class AuditLog : BaseEntity
    {
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string? ResourceId { get; set; }
        public string? IPAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? Metadata { get; set; }
    }
}
