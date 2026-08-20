using Florist.Application.DTOs.Wishlist;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Repositories
{
    public class WishlistRepository : IWishlistRepository
    {
        private readonly ApplicationDbContext _context;
        public WishlistRepository(ApplicationDbContext context) => _context = context;

        public async Task<List<WishlistItemDto>> GetByUserIdAsync(Guid userId) =>
            await _context.Wishlists
                .Include(w => w.Product)
                    .ThenInclude(p => p!.Images)
                .Include(w => w.Product)
                    .ThenInclude(p => p!.Variants)
                .Where(w => w.UserId == userId)
                .Select(w => new WishlistItemDto
                {
                    Id = w.Id,
                    ProductId = w.ProductId,
                    ProductName = w.Product != null ? w.Product.Name : string.Empty,
                    ProductSlug = w.Product != null ? w.Product.Slug : string.Empty,
                    ImageUrl = w.Product != null ? w.Product.Images.FirstOrDefault(i => i.IsPrimary)!.ImageUrl : null,
                    MinPrice = w.Product != null && w.Product.Variants.Any() ? w.Product.Variants.Min(v => v.Price) : null
                })
                .ToListAsync();

        public async Task<Wishlist?> GetAsync(Guid userId, Guid productId) =>
            await _context.Wishlists.FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        public async Task AddAsync(Wishlist wishlist) { _context.Wishlists.Add(wishlist); await _context.SaveChangesAsync(); }
        public async Task RemoveAsync(Wishlist wishlist) { _context.Wishlists.Remove(wishlist); await _context.SaveChangesAsync(); }
    }
}
