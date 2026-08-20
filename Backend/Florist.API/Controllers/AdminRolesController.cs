using Florist.API.Authorization;
using Florist.Application.DTOs;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Florist.API.Controllers
{
    [Route("api/admin/roles")]
    [ApiController]
    [Authorize]
    public class AdminRolesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminRolesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [HasPermission("role.read")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .Select(r => new { r.Id, r.Name, Permissions = r.RolePermissions.Select(rp => rp.Permission!.Name) })
                .ToListAsync();
            return Ok(BaseResponse<object>.Ok(roles));
        }

        [HttpPost]
        [HasPermission("role.create")]
        public async Task<IActionResult> CreateRole([FromBody] string roleName)
        {
            if (await _context.Roles.AnyAsync(r => r.Name == roleName))
                return BadRequest(BaseResponse<object>.Failure("Role already exists."));

            var role = new Role { Id = Guid.NewGuid(), Name = roleName };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return Ok(BaseResponse<object>.Ok(role, "Role created"));
        }

        [HttpPost("{id}/permissions")]
        [HasPermission("role.update")]
        public async Task<IActionResult> AssignPermissions(Guid id, [FromBody] List<string> permissionNames)
        {
            var role = await _context.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Id == id);
            if (role == null) return NotFound(BaseResponse<object>.Failure("Role not found."));

            if (role.Name == "ADMIN") return BadRequest(BaseResponse<object>.Failure("Cannot modify ADMIN permissions this way."));

            // Remove all current
            _context.RolePermissions.RemoveRange(role.RolePermissions);
            
            var validPermissions = await _context.Permissions.Where(p => permissionNames.Contains(p.Name)).ToListAsync();
            foreach(var p in validPermissions)
            {
                _context.RolePermissions.Add(new RolePermission { Id = Guid.NewGuid(), RoleId = role.Id, PermissionId = p.Id });
            }
            
            await _context.SaveChangesAsync();
            return Ok(BaseResponse<object>.Ok(null!, "Permissions assigned"));
        }
    }
}
