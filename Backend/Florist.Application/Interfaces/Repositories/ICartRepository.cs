using Florist.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Repositories
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(Guid userId);
        Task<Cart> GetOrCreateCartAsync(Guid userId);
        Task<CartItem?> GetCartItemAsync(Guid cartId, Guid productVariantId);
        Task<CartItem?> GetCartItemByIdAsync(Guid cartItemId);
        Task AddItemAsync(CartItem item);
        Task UpdateItemAsync(CartItem item);
        Task RemoveItemAsync(CartItem item);
        Task ClearCartAsync(Guid cartId);
        Task SaveChangesAsync();
    }
}
