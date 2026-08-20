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
    [Route("api/admin/users")]
    [ApiController]
    [Authorize]
    public class AdminUsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminUsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [HasPermission("user.read")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Email, u.FullName, Roles = u.UserRoles.Select(ur => ur.Role!.Name) })
                .ToListAsync();
            return Ok(BaseResponse<object>.Ok(users));
        }

        [HttpPost("{id}/roles")]
        [HasPermission("user.update")]
        public async Task<IActionResult> AssignRoles(Guid id, [FromBody] List<string> roleNames)
        {
            var user = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound(BaseResponse<object>.Failure("User not found."));

            // Protect last ADMIN
            var isAdmin = user.UserRoles.Any(ur => ur.Role!.Name == "ADMIN");
            if (isAdmin && !roleNames.Contains("ADMIN"))
            {
                var adminCount = await _context.UserRoles.CountAsync(ur => ur.Role!.Name == "ADMIN");
                if (adminCount <= 1) return BadRequest(BaseResponse<object>.Failure("Cannot remove the last ADMIN."));
            }

            _context.UserRoles.RemoveRange(user.UserRoles);
            
            var validRoles = await _context.Roles.Where(r => roleNames.Contains(r.Name)).ToListAsync();
            foreach(var r in validRoles)
            {
                _context.UserRoles.Add(new UserRole { Id = Guid.NewGuid(), UserId = user.Id, RoleId = r.Id });
            }
            
            await _context.SaveChangesAsync();
            return Ok(BaseResponse<object>.Ok(null!, "Roles assigned"));
        }
    }
}
