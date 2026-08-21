using Florist.Application.DTOs.Products;
using Florist.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Repositories
{
    public interface IOrderRepository
    {
        Task<PagedResult<Order>> GetOrdersByUserAsync(Guid userId, int page, int pageSize);
        Task<PagedResult<Order>> GetAllOrdersAsync(int page, int pageSize, string? status);
        Task<Order?> GetByIdAsync(Guid id);
        Task<Order?> GetOrderByPaymentReferenceAsync(string paymentReference);
        Task<Order> CreateAsync(Order order);
        Task<Order> UpdateAsync(Order order);
        Task<bool> HasUserPurchasedProductAsync(Guid userId, Guid productId);
        Task<List<Order>> GetAbandonedOrdersAsync(DateTime cutoffTime);
    }
    public interface IVoucherRepository
    {
        Task<Voucher?> GetByCodeAsync(string code);
        Task<bool> IsValidForUserAsync(string code, Guid userId, decimal orderTotal);
        Task MarkUsedAsync(Guid voucherId, Guid userId, Guid orderId);
    }
}

