using Florist.Application.DTOs.Wishlist;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly IWishlistRepository _wishlistRepo;
        public WishlistService(IWishlistRepository wishlistRepo) => _wishlistRepo = wishlistRepo;

        public async Task<List<WishlistItemDto>> GetWishlistAsync(Guid userId) =>
            await _wishlistRepo.GetByUserIdAsync(userId);

        public async Task<ToggleWishlistResponse> ToggleWishlistAsync(Guid userId, Guid productId)
        {
            var existing = await _wishlistRepo.GetAsync(userId, productId);
            if (existing != null)
            {
                await _wishlistRepo.RemoveAsync(existing);
                return new ToggleWishlistResponse { IsInWishlist = false, Message = "Removed from wishlist" };
            }
            await _wishlistRepo.AddAsync(new Wishlist { UserId = userId, ProductId = productId });
            return new ToggleWishlistResponse { IsInWishlist = true, Message = "Added to wishlist" };
        }

        public async Task<bool> IsInWishlistAsync(Guid userId, Guid productId) =>
            await _wishlistRepo.GetAsync(userId, productId) != null;
    }
}
