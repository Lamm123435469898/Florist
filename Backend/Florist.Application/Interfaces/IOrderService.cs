using Florist.Application.DTOs.Orders;
using Florist.Application.DTOs.Products;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request);
        Task<PagedResult<OrderDto>> GetMyOrdersAsync(Guid userId, int page, int pageSize);
        Task<OrderDto> GetOrderByIdAsync(Guid orderId, Guid userId);
        Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page, int pageSize, string? status);
        Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request);
        Task<OrderDto> CancelOrderAsync(Guid orderId, Guid userId);
    }
}
