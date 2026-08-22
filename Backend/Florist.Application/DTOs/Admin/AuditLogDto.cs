using System;

namespace Florist.Application.DTOs.Admin
{
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string? ResourceId { get; set; }
        public string? IPAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? Metadata { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
