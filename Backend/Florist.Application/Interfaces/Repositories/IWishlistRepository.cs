using Florist.Application.DTOs.Wishlist;
using Florist.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Repositories
{
    public interface IWishlistRepository
    {
        Task<List<WishlistItemDto>> GetByUserIdAsync(Guid userId);
        Task<Wishlist?> GetAsync(Guid userId, Guid productId);
        Task AddAsync(Wishlist wishlist);
        Task RemoveAsync(Wishlist wishlist);
    }
}
