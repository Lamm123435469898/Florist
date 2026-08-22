using Florist.Application.DTOs;
using Florist.Application.DTOs.Admin;
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
    [Route("api/admin/customers")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminCustomersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminCustomersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomers([FromQuery] string? search = null, [FromQuery] bool? isActive = null)
        {
            var query = _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Include(u => u.Orders)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(u => u.Email.ToLower().Contains(s) || 
                                         u.FullName.ToLower().Contains(s) || 
                                         (u.PhoneNumber != null && u.PhoneNumber.Contains(s)));
            }

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new CustomerDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    TotalOrders = u.Orders.Count,
                    TotalSpent = u.Orders.Where(o => o.Status != Domain.Enums.OrderStatus.CANCELLED).Sum(o => o.FinalTotal),
                    Roles = u.UserRoles.Select(ur => ur.Role!.Name).ToList()
                })
                .ToListAsync();

            return Ok(BaseResponse<List<CustomerDto>>.Ok(users));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(Guid id)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Include(u => u.Orders)
                .Where(u => u.Id == id)
                .Select(u => new CustomerDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    TotalOrders = u.Orders.Count,
                    TotalSpent = u.Orders.Where(o => o.Status != Domain.Enums.OrderStatus.CANCELLED).Sum(o => o.FinalTotal),
                    Roles = u.UserRoles.Select(ur => ur.Role!.Name).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(BaseResponse<object>.Failure("Customer not found."));
            }

            return Ok(BaseResponse<CustomerDto>.Ok(user));
        }

        [HttpGet("{id}/orders")]
        public async Task<IActionResult> GetCustomerOrders(Guid id)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Payment)
                .Where(o => o.UserId == id)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new 
                {
                    o.Id,
                    o.Status,
                    o.FinalTotal,
                    o.CreatedAt,
                    ItemCount = o.OrderItems.Sum(oi => oi.Quantity),
                    PaymentMethod = o.Payment != null ? o.Payment.PaymentProvider : null,
                    PaymentStatus = o.Payment != null ? (int?)o.Payment.Status : null
                })
                .ToListAsync();

            return Ok(BaseResponse<object>.Ok(orders));
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateCustomerStatusRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(BaseResponse<object>.Failure("Customer not found."));
            }

            user.IsActive = request.IsActive;
            await _context.SaveChangesAsync();

            return Ok(BaseResponse<object>.Ok(null!, "Customer status updated successfully."));
        }
    }

    public class UpdateCustomerStatusRequest
    {
        public bool IsActive { get; set; }
    }
}
