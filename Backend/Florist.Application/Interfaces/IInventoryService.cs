using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IInventoryService
    {
        Task ReserveStockAsync(Guid variantId, int quantity, string referenceId);
        Task ReleaseStockAsync(Guid variantId, int quantity, string referenceId);
        Task AdjustStockAsync(Guid variantId, int quantity, string note);
        Task<System.Collections.Generic.List<Florist.Application.DTOs.Inventory.InventoryTransactionDto>> GetTransactionsAsync(Guid variantId);
    }
}
