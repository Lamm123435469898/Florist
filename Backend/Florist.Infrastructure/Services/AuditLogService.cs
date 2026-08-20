using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Services;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _currentUserService = currentUserService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(string action, string resource, string? resourceId = null, string? metadata = null)
        {
            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = _currentUserService.UserId,
                Action = action,
                Resource = resource,
                ResourceId = resourceId,
                IPAddress = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString(),
                UserAgent = _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"].ToString(),
                Metadata = metadata
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }
    }
}
