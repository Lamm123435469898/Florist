using System;
using System.Collections.Generic;

namespace Florist.Application.DTOs.Wishlist
{
    public class WishlistItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSlug { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public decimal? MinPrice { get; set; }
    }
    public class ToggleWishlistRequest
    {
        public Guid ProductId { get; set; }
    }
    public class ToggleWishlistResponse
    {
        public bool IsInWishlist { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
