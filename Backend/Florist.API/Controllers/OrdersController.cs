using Florist.Application.DTOs;
using Florist.Application.DTOs.Orders;
using Florist.Application.DTOs.Products;
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
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrdersController(IOrderService orderService) => _orderService = orderService;

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var result = await _orderService.CreateOrderAsync(GetUserId(), request);
            return Ok(BaseResponse<OrderDto>.Ok(result, "Order placed successfully"));
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _orderService.GetMyOrdersAsync(GetUserId(), page, pageSize);
            return Ok(BaseResponse<PagedResult<OrderDto>>.Ok(result));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _orderService.GetOrderByIdAsync(id, GetUserId());
            return Ok(BaseResponse<OrderDto>.Ok(result));
        }

        [HttpPost("{id:guid}/cancel")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var result = await _orderService.CancelOrderAsync(id, GetUserId());
            return Ok(BaseResponse<OrderDto>.Ok(result, "Order cancelled"));
        }

        // Admin only
        [HttpGet("admin")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
        {
            var result = await _orderService.GetAllOrdersAsync(page, pageSize, status);
            return Ok(BaseResponse<PagedResult<OrderDto>>.Ok(result));
        }

        [HttpPut("admin/{id:guid}/status")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
        {
            var result = await _orderService.UpdateOrderStatusAsync(id, request);
            return Ok(BaseResponse<OrderDto>.Ok(result, "Order status updated"));
        }

        [HttpPut("admin/{id:guid}/shipping")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateShippingStatus(Guid id, [FromBody] UpdateShippingStatusRequest request)
        {
            var result = await _orderService.UpdateShippingStatusAsync(id, request);
            return Ok(BaseResponse<OrderDto>.Ok(result, "Shipping status updated"));
        }

        [HttpPost("admin/{id:guid}/cancel")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> AdminCancelOrder(Guid id)
        {
            var result = await _orderService.UpdateOrderStatusAsync(id, new UpdateOrderStatusRequest { Status = "CANCELLED" });
            return Ok(BaseResponse<OrderDto>.Ok(result, "Order cancelled successfully"));
        }
    }
}
