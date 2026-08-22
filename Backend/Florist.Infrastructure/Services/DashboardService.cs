using Florist.Application.DTOs.Admin;
using Florist.Application.Interfaces;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetStatsAsync()
        {
            var totalProducts = await _context.Products.CountAsync();
            var totalOrders = await _context.Orders.CountAsync();
            var totalUsers = await _context.Users.CountAsync();
            
            // Assuming successful/paid orders contribute to revenue. 
            // For now just sum all orders that are not cancelled.
            var today = System.DateTime.UtcNow.Date;
            
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != Florist.Domain.Enums.OrderStatus.CANCELLED)
                .SumAsync(o => o.FinalTotal);

            var todayRevenue = await _context.Orders
                .Where(o => o.Status != Florist.Domain.Enums.OrderStatus.CANCELLED && o.CreatedAt >= today)
                .SumAsync(o => o.FinalTotal);

            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == Florist.Domain.Enums.OrderStatus.PENDING);
            var processingOrders = await _context.Orders.CountAsync(o => o.Status == Florist.Domain.Enums.OrderStatus.PROCESSING);
            var shippedOrders = await _context.Orders.CountAsync(o => o.Status == Florist.Domain.Enums.OrderStatus.SHIPPED);
            var deliveredOrders = await _context.Orders.CountAsync(o => o.Status == Florist.Domain.Enums.OrderStatus.DELIVERED);

            var sevenDaysAgo = today.AddDays(-6);
            var revenueByDate = await _context.Orders
                .Where(o => o.Status != Florist.Domain.Enums.OrderStatus.CANCELLED && o.CreatedAt >= sevenDaysAgo)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new RevenueByDateDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(o => o.FinalTotal)
                })
                .OrderBy(r => r.Date)
                .ToListAsync();

            var topProducts = await _context.OrderItems
                .Where(oi => oi.Order != null && oi.Order.Status != Florist.Domain.Enums.OrderStatus.CANCELLED)
                .GroupBy(oi => oi.ProductName)
                .Select(g => new TopProductDto
                {
                    ProductName = g.Key,
                    TotalSold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Price * oi.Quantity)
                })
                .OrderByDescending(tp => tp.TotalSold)
                .Take(5)
                .ToListAsync();

            return new DashboardStatsDto
            {
                TotalProducts = totalProducts,
                TotalOrders = totalOrders,
                TotalUsers = totalUsers,
                TotalRevenue = totalRevenue,
                TodayRevenue = todayRevenue,
                PendingOrders = pendingOrders,
                ProcessingOrders = processingOrders,
                ShippedOrders = shippedOrders,
                DeliveredOrders = deliveredOrders,
                RevenueByDate = revenueByDate,
                TopProducts = topProducts
            };
        }
    }
}
