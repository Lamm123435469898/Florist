using Florist.Application.DTOs;
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
    [Route("api/admin/payments")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminPaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminPaymentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPayments([FromQuery] string? search = null, [FromQuery] int? status = null, [FromQuery] string? method = null)
        {
            var query = _context.Payments
                .Include(p => p.Order)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(p => 
                    (p.PaymentReference != null && p.PaymentReference.ToLower().Contains(s)) ||
                    (p.TransactionId != null && p.TransactionId.ToLower().Contains(s)) ||
                    p.OrderId.ToString().Contains(s));
            }

            if (status.HasValue)
            {
                query = query.Where(p => (int)p.Status == status.Value);
            }

            if (!string.IsNullOrWhiteSpace(method))
            {
                query = query.Where(p => p.PaymentProvider.ToLower() == method.ToLower());
            }

            var payments = await query
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new 
                {
                    p.Id,
                    p.PaymentProvider,
                    p.Amount,
                    p.Status,
                    p.TransactionId,
                    p.PaymentReference,
                    p.OrderId,
                    p.CreatedAt,
                    p.UpdatedAt,
                    Order = p.Order != null ? new 
                    {
                        p.Order.CustomerName,
                        p.Order.CustomerEmail,
                        p.Order.FinalTotal
                    } : null
                })
                .ToListAsync();

            return Ok(BaseResponse<object>.Ok(payments));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment(Guid id)
        {
            var payment = await _context.Payments
                .Include(p => p.Order)
                .Include(p => p.Transactions)
                .Where(p => p.Id == id)
                .Select(p => new 
                {
                    p.Id,
                    p.PaymentProvider,
                    p.Amount,
                    p.Status,
                    p.TransactionId,
                    p.PaymentReference,
                    p.OrderId,
                    p.CreatedAt,
                    p.UpdatedAt,
                    Order = p.Order != null ? new 
                    {
                        p.Order.CustomerName,
                        p.Order.CustomerEmail,
                        p.Order.FinalTotal
                    } : null,
                    Transactions = p.Transactions.OrderByDescending(t => t.CreatedAt).Select(t => new
                    {
                        t.Id,
                        t.Status,
                        t.ProviderResponse,
                        t.CreatedAt
                    })
                })
                .FirstOrDefaultAsync();

            if (payment == null)
            {
                return NotFound(BaseResponse<object>.Failure("Payment not found."));
            }

            return Ok(BaseResponse<object>.Ok(payment));
        }
    }
}
