namespace Florist.Application.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int TotalOrders { get; set; }
        public int TotalUsers { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
