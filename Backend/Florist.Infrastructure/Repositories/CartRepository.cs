using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _context;
        public CartRepository(ApplicationDbContext context) => _context = context;

        public async Task<Cart?> GetCartByUserIdAsync(Guid userId) =>
            await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v!.Product)
                            .ThenInclude(p => p!.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId);

        public async Task<Cart> GetOrCreateCartAsync(Guid userId)
        {
            var cart = await GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
                cart = await GetCartByUserIdAsync(userId) ?? cart;
            }
            return cart;
        }

        public async Task<CartItem?> GetCartItemAsync(Guid cartId, Guid productVariantId) =>
            await _context.CartItems.FirstOrDefaultAsync(i => i.CartId == cartId && i.ProductVariantId == productVariantId);

        public async Task<CartItem?> GetCartItemByIdAsync(Guid cartItemId) =>
            await _context.CartItems.FindAsync(cartItemId);

        public async Task AddItemAsync(CartItem item) { _context.CartItems.Add(item); await _context.SaveChangesAsync(); }
        public async Task UpdateItemAsync(CartItem item) { _context.CartItems.Update(item); await _context.SaveChangesAsync(); }
        public async Task RemoveItemAsync(CartItem item) { _context.CartItems.Remove(item); await _context.SaveChangesAsync(); }

        public async Task ClearCartAsync(Guid cartId)
        {
            var items = await _context.CartItems.Where(i => i.CartId == cartId).ToListAsync();
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
