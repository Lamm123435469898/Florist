using Florist.Application.DTOs;
using Florist.Application.DTOs.Cart;
using Florist.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        public CartController(ICartService cartService) => _cartService = cartService;

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!);

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var result = await _cartService.GetCartAsync(GetUserId());
            return Ok(BaseResponse<CartDto>.Ok(result));
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request)
        {
            var result = await _cartService.AddItemAsync(GetUserId(), request);
            return Ok(BaseResponse<CartDto>.Ok(result, "Item added to cart"));
        }

        [HttpPut("items/{itemId:guid}")]
        public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] UpdateCartItemRequest request)
        {
            var result = await _cartService.UpdateItemAsync(GetUserId(), itemId, request);
            return Ok(BaseResponse<CartDto>.Ok(result, "Cart updated"));
        }

        [HttpDelete("items/{itemId:guid}")]
        public async Task<IActionResult> RemoveItem(Guid itemId)
        {
            var result = await _cartService.RemoveItemAsync(GetUserId(), itemId);
            return Ok(BaseResponse<CartDto>.Ok(result, "Item removed"));
        }

        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            await _cartService.ClearCartAsync(GetUserId());
            return Ok(BaseResponse<object>.Ok(null!, "Cart cleared"));
        }
    }
}
