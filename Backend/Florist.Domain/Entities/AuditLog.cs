using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class AuditLog : BaseEntity
    {
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? UserId { get; set; }
        public string? Details { get; set; }
    }
}
