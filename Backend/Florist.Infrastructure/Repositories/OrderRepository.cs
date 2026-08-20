using Florist.Application.DTOs.Products;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Domain.Enums;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;
        public OrderRepository(ApplicationDbContext context) => _context = context;

        public async Task<PagedResult<Order>> GetOrdersByUserAsync(Guid userId, int page, int pageSize)
        {
            var q = _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Payment)
                .Include(o => o.Voucher)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt);

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PagedResult<Order> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        public async Task<PagedResult<Order>> GetAllOrdersAsync(int page, int pageSize, string? status)
        {
            var q = _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.User)
                .Include(o => o.Payment)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) && System.Enum.TryParse<OrderStatus>(status, true, out var os))
                q = q.Where(o => o.Status == os);

            q = q.OrderByDescending(o => o.CreatedAt);
            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PagedResult<Order> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        public async Task<Order?> GetByIdAsync(Guid id) =>
            await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Payment)
                .Include(o => o.Voucher)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id);

        public async Task<Order> CreateAsync(Order order) { _context.Orders.Add(order); await _context.SaveChangesAsync(); return order; }
        public async Task<Order> UpdateAsync(Order order) { _context.Orders.Update(order); await _context.SaveChangesAsync(); return order; }

        public async Task<bool> HasUserPurchasedProductAsync(Guid userId, Guid productId)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .AnyAsync(o => o.UserId == userId 
                            && o.Status == OrderStatus.DELIVERED 
                            && o.OrderItems != null 
                            && o.OrderItems.Any(i => i.ProductId == productId));
        }

        public async Task<List<Order>> GetAbandonedOrdersAsync(DateTime cutoffTime)
        {
            return await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.Status == OrderStatus.PENDING && o.CreatedAt <= cutoffTime)
                .ToListAsync();
        }
    }

    public class VoucherRepository : IVoucherRepository
    {
        private readonly ApplicationDbContext _context;
        public VoucherRepository(ApplicationDbContext context) => _context = context;

        public async Task<Voucher?> GetByCodeAsync(string code) =>
            await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == code);

        public async Task<bool> IsValidForUserAsync(string code, Guid userId, decimal orderTotal)
        {
            var voucher = await GetByCodeAsync(code);
            if (voucher == null) return false;
            if (voucher.Status != Florist.Domain.Enums.VoucherStatus.ACTIVE) return false;
            if (voucher.StartDate > DateTime.UtcNow || voucher.EndDate < DateTime.UtcNow) return false;
            if (voucher.UsageLimit > 0 && voucher.UsedCount >= voucher.UsageLimit) return false;
            if (orderTotal < voucher.MinimumOrderValue) return false;
            var alreadyUsed = await _context.VoucherUsages.AnyAsync(u => u.VoucherId == voucher.Id && u.UserId == userId);
            return !alreadyUsed;
        }

        public async Task MarkUsedAsync(Guid voucherId, Guid userId, Guid orderId)
        {
            var voucher = await _context.Vouchers.FindAsync(voucherId);
            if (voucher != null) { voucher.UsedCount++; }
            _context.VoucherUsages.Add(new VoucherUsage { VoucherId = voucherId, UserId = userId, OrderId = orderId });
            await _context.SaveChangesAsync();
        }
    }
}

