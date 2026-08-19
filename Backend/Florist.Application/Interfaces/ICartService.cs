using Florist.Application.DTOs.Cart;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(Guid userId);
        Task<CartDto> AddItemAsync(Guid userId, AddToCartRequest request);
        Task<CartDto> UpdateItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequest request);
        Task<CartDto> RemoveItemAsync(Guid userId, Guid cartItemId);
        Task ClearCartAsync(Guid userId);
    }
}
