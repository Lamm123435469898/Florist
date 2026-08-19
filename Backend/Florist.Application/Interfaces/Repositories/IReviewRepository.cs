using Florist.Application.DTOs.Products;
using Florist.Application.DTOs.Reviews;
using Florist.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Repositories
{
    public interface IReviewRepository
    {
        Task<PagedResult<ReviewDto>> GetByProductIdAsync(Guid productId, int page, int pageSize);
        Task<Review> AddAsync(Review review);
        Task<bool> HasUserReviewedProductAsync(Guid userId, Guid productId);
    }
}
