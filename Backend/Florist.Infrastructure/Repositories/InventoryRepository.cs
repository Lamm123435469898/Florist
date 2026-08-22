using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly ApplicationDbContext _context;
        public InventoryRepository(ApplicationDbContext context) => _context = context;

        public async Task<ProductVariant?> GetVariantWithLockAsync(Guid variantId) =>
            await _context.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId);

        public async Task DecrementStockAsync(Guid variantId, int quantity)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null || variant.Stock < quantity)
                throw new Florist.Application.Exceptions.BusinessRuleException("Insufficient stock.");
            
            variant.Stock -= quantity;
            _context.ProductVariants.Update(variant);
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { throw new Florist.Application.Exceptions.BusinessRuleException("Concurrent update detected."); }
        }

        public async Task IncrementStockAsync(Guid variantId, int quantity)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant != null)
            {
                variant.Stock += quantity;
                _context.ProductVariants.Update(variant);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddTransactionAsync(InventoryTransaction transaction)
        {
            _context.InventoryTransactions.Add(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task<System.Collections.Generic.List<InventoryTransaction>> GetTransactionsAsync(Guid variantId)
        {
            return await _context.InventoryTransactions
                .Where(t => t.ProductVariantId == variantId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }
    }
}
