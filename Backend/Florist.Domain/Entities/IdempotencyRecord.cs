using System;
using Florist.Domain.Common;

namespace Florist.Domain.Entities
{
    public class IdempotencyRecord : BaseEntity
    {
        public string Key { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public string? ResponseBody { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
