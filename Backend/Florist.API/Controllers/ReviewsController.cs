using Florist.Application.DTOs;
using Florist.Application.DTOs.Products;
using Florist.Application.DTOs.Reviews;
using Florist.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        public ReviewsController(IReviewService reviewService) => _reviewService = reviewService;

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);

        [HttpGet("product/{productId:guid}")]
        public async Task<IActionResult> GetProductReviews(Guid productId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _reviewService.GetProductReviewsAsync(productId, page, pageSize);
            return Ok(BaseResponse<PagedResult<ReviewDto>>.Ok(result));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewRequest request)
        {
            var result = await _reviewService.AddReviewAsync(GetUserId(), request);
            return Ok(BaseResponse<ReviewDto>.Ok(result, "Review added successfully"));
        }
    }
}
