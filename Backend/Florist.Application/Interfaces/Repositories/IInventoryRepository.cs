using Florist.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Repositories
{
    public interface IInventoryRepository
    {
        Task<ProductVariant?> GetVariantWithLockAsync(Guid variantId);
        Task DecrementStockAsync(Guid variantId, int quantity);
        Task IncrementStockAsync(Guid variantId, int quantity);
        Task AddTransactionAsync(InventoryTransaction transaction);
        Task<System.Collections.Generic.List<InventoryTransaction>> GetTransactionsAsync(Guid variantId);
    }
}
