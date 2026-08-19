using Florist.Application.DTOs.Products;
using Florist.Application.DTOs.Reviews;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IReviewService
    {
        Task<PagedResult<ReviewDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize);
        Task<ReviewDto> AddReviewAsync(Guid userId, CreateReviewRequest request);
    }
}
