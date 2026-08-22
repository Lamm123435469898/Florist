namespace Florist.Application.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int TotalOrders { get; set; }
        public int TotalUsers { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TodayRevenue { get; set; }
        public int PendingOrders { get; set; }
        public int ProcessingOrders { get; set; }
        public int ShippedOrders { get; set; }
        public int DeliveredOrders { get; set; }
        
        public List<RevenueByDateDto> RevenueByDate { get; set; } = new();
        public List<TopProductDto> TopProducts { get; set; } = new();
    }

    public class RevenueByDateDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
    }

    public class TopProductDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int TotalSold { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
