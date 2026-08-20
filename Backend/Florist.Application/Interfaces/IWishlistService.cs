using Florist.Application.DTOs.Wishlist;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IWishlistService
    {
        Task<List<WishlistItemDto>> GetWishlistAsync(Guid userId);
        Task<ToggleWishlistResponse> ToggleWishlistAsync(Guid userId, Guid productId);
        Task<bool> IsInWishlistAsync(Guid userId, Guid productId);
    }
}
