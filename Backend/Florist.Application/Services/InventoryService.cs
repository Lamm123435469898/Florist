using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Domain.Enums;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _inventoryRepo;
        public InventoryService(IInventoryRepository inventoryRepo) => _inventoryRepo = inventoryRepo;

        public async Task ReserveStockAsync(Guid variantId, int quantity, string referenceId)
        {
            if (quantity <= 0) throw new BadRequestException("Quantity must be > 0.");
            var variant = await _inventoryRepo.GetVariantWithLockAsync(variantId)
                ?? throw new NotFoundException($"Product variant {variantId} not found.");
            if (!variant.IsActive) throw new BusinessRuleException("Product variant is not available.");
            if (variant.Stock < quantity)
                throw new BusinessRuleException($"Insufficient stock. Available: {variant.Stock}, requested: {quantity}.");

            await _inventoryRepo.DecrementStockAsync(variantId, quantity);
            await _inventoryRepo.AddTransactionAsync(new InventoryTransaction
            {
                ProductVariantId = variantId,
                Type = InventoryTransactionType.OUT,
                Quantity = quantity,
                ReferenceId = referenceId,
                Note = $"Order {referenceId}"
            });
        }

        public async Task ReleaseStockAsync(Guid variantId, int quantity, string referenceId)
        {
            await _inventoryRepo.IncrementStockAsync(variantId, quantity);
            await _inventoryRepo.AddTransactionAsync(new InventoryTransaction
            {
                ProductVariantId = variantId,
                Type = InventoryTransactionType.RELEASE,
                Quantity = quantity,
                ReferenceId = referenceId,
                Note = $"Released for order {referenceId}"
            });
        }

        public async Task AdjustStockAsync(Guid variantId, int quantity, string note)
        {
            if (quantity > 0)
                await _inventoryRepo.IncrementStockAsync(variantId, quantity);
            else
                await _inventoryRepo.DecrementStockAsync(variantId, -quantity);

            await _inventoryRepo.AddTransactionAsync(new InventoryTransaction
            {
                ProductVariantId = variantId,
                Type = InventoryTransactionType.ADJUSTMENT,
                Quantity = System.Math.Abs(quantity),
                Note = note
            });
        }

        public async Task<System.Collections.Generic.List<Florist.Application.DTOs.Inventory.InventoryTransactionDto>> GetTransactionsAsync(Guid variantId)
        {
            var transactions = await _inventoryRepo.GetTransactionsAsync(variantId);
            return transactions.Select(t => new Florist.Application.DTOs.Inventory.InventoryTransactionDto
            {
                Id = t.Id,
                Type = t.Type.ToString(),
                Quantity = t.Quantity,
                ReferenceId = t.ReferenceId,
                Note = t.Note,
                ProductVariantId = t.ProductVariantId,
                CreatedAt = t.CreatedAt
            }).ToList();
        }
    }
}
