using Florist.Application.DTOs.Products;
using Florist.Application.DTOs.Reviews;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly ApplicationDbContext _context;
        public ReviewRepository(ApplicationDbContext context) => _context = context;

        public async Task<PagedResult<ReviewDto>> GetByProductIdAsync(Guid productId, int page, int pageSize)
        {
            var q = _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId)
                .OrderByDescending(r => r.CreatedAt);

            var total = await q.CountAsync();
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
                .Select(r => new ReviewDto
                {
                    Id = r.Id, Rating = r.Rating, Comment = r.Comment,
                    UserFullName = r.User != null ? r.User.FullName : "Anonymous",
                    CreatedAt = r.CreatedAt
                }).ToListAsync();

            return new PagedResult<ReviewDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
        }

        public async Task<Review> AddAsync(Review review) { _context.Reviews.Add(review); await _context.SaveChangesAsync(); return review; }

        public async Task<bool> HasUserReviewedProductAsync(Guid userId, Guid productId) =>
            await _context.Reviews.AnyAsync(r => r.UserId == userId && r.ProductId == productId);
    }
}
