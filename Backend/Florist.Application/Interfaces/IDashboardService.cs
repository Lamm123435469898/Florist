using Florist.Application.DTOs.Admin;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetStatsAsync();
    }
}
