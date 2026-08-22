using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Services
{
    public interface IAuditLogService
    {
        Task LogAsync(string action, string resource, string? resourceId = null, string? metadata = null);
        Task<object> GetLogsAsync(int page, int pageSize);
    }
}
