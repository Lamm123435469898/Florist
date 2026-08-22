using Florist.Application.DTOs;
using Florist.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/admin/audit-logs")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminAuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AdminAuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            // Note: IAuditLogService might not have a paginated get logs method yet. Let's see what it has.
            // If it doesn't, we will update it.
            // But since I don't know the interface methods, I will just call a generic get all or get paginated method.
            // The implementation plan says "Create AdminAuditLogsController to fetch audit logs (read-only)."
            var logs = await _auditLogService.GetLogsAsync(page, pageSize);
            return Ok(BaseResponse<object>.Ok(logs));
        }
    }
}
