using Florist.Application.DTOs;
using Florist.Application.DTOs.Wishlist;
using Florist.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;
        public WishlistController(IWishlistService wishlistService) => _wishlistService = wishlistService;

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var result = await _wishlistService.GetWishlistAsync(GetUserId());
            return Ok(BaseResponse<List<WishlistItemDto>>.Ok(result));
        }

        [HttpPost("toggle")]
        public async Task<IActionResult> Toggle([FromBody] ToggleWishlistRequest request)
        {
            var result = await _wishlistService.ToggleWishlistAsync(GetUserId(), request.ProductId);
            return Ok(BaseResponse<ToggleWishlistResponse>.Ok(result));
        }

        [HttpGet("{productId:guid}/check")]
        public async Task<IActionResult> Check(Guid productId)
        {
            var result = await _wishlistService.IsInWishlistAsync(GetUserId(), productId);
            return Ok(BaseResponse<bool>.Ok(result));
        }
    }
}
