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

        public async Task<object> GetLogsAsync(int page, int pageSize)
        {
            var query = _context.AuditLogs.AsQueryable();
            var totalCount = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(query);

            var items = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                query.OrderByDescending(l => l.CreatedAt)
                     .Skip((page - 1) * pageSize)
                     .Take(pageSize)
                     .Select(l => new Florist.Application.DTOs.Admin.AuditLogDto
                     {
                         Id = l.Id,
                         UserId = l.UserId,
                         Action = l.Action,
                         Resource = l.Resource,
                         ResourceId = l.ResourceId,
                         IPAddress = l.IPAddress,
                         UserAgent = l.UserAgent,
                         Metadata = l.Metadata,
                         CreatedAt = l.CreatedAt
                     })
            );

            return new
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                Items = items
            };
        }
    }
}
