using Florist.Application.DTOs.Products;
using Florist.Application.DTOs.Reviews;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepo;
        public ReviewService(IReviewRepository reviewRepo) => _reviewRepo = reviewRepo;

        public async Task<PagedResult<ReviewDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize) =>
            await _reviewRepo.GetByProductIdAsync(productId, page, pageSize);

        public async Task<ReviewDto> AddReviewAsync(Guid userId, CreateReviewRequest request)
        {
            if (request.Rating < 1 || request.Rating > 5) throw new BadRequestException("Rating must be 1-5.");
            if (await _reviewRepo.HasUserReviewedProductAsync(userId, request.ProductId))
                throw new BadRequestException("You have already reviewed this product.");

            var review = new Review
            {
                UserId = userId, ProductId = request.ProductId,
                Rating = request.Rating, Comment = request.Comment
            };
            var created = await _reviewRepo.AddAsync(review);
            return new ReviewDto { Id = created.Id, Rating = created.Rating, Comment = created.Comment, UserFullName = string.Empty, CreatedAt = created.CreatedAt };
        }
    }
}
