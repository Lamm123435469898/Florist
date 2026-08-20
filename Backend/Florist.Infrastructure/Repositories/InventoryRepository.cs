using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly ApplicationDbContext _context;
        public InventoryRepository(ApplicationDbContext context) => _context = context;

        public async Task<ProductVariant?> GetVariantWithLockAsync(Guid variantId) =>
            await _context.ProductVariants
                .FromSqlRaw("SELECT * FROM ProductVariants WITH (UPDLOCK, ROWLOCK) WHERE Id = {0}", variantId)
                .FirstOrDefaultAsync();

        public async Task DecrementStockAsync(Guid variantId, int quantity)
        {
            // Atomic update to prevent race condition
            var rows = await _context.Database.ExecuteSqlRawAsync(
                "UPDATE ProductVariants SET Stock = Stock - {0} WHERE Id = {1} AND Stock >= {0}",
                quantity, variantId);
            if (rows == 0)
                throw new Florist.Application.Exceptions.BusinessRuleException("Insufficient stock or concurrent update detected.");
        }

        public async Task IncrementStockAsync(Guid variantId, int quantity) =>
            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE ProductVariants SET Stock = Stock + {0} WHERE Id = {1}",
                quantity, variantId);

        public async Task AddTransactionAsync(InventoryTransaction transaction)
        {
            _context.InventoryTransactions.Add(transaction);
            await _context.SaveChangesAsync();
        }
    }
}
