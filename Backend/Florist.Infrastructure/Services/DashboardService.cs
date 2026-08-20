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
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != Florist.Domain.Enums.OrderStatus.CANCELLED)
                .SumAsync(o => o.FinalTotal);

            return new DashboardStatsDto
            {
                TotalProducts = totalProducts,
                TotalOrders = totalOrders,
                TotalUsers = totalUsers,
                TotalRevenue = totalRevenue
            };
        }
    }
}
