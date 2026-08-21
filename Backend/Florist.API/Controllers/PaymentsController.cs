using Florist.Application.DTOs;
using Florist.Application.DTOs.Payments;
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
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        public PaymentsController(IPaymentService paymentService) => _paymentService = paymentService;

        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);
            var result = await _paymentService.CreatePaymentAsync(userId, request);
            return Ok(BaseResponse<PaymentResultDto>.Ok(result));
        }

        // Webhook — no auth (called by payment provider)
        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromBody] PaymentCallbackDto callback)
        {
            var success = await _paymentService.ProcessCallbackAsync(callback);
            return Ok(new { success });
        }

        [HttpGet("order/{orderId:guid}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetByOrder(Guid orderId)
        {
            var result = await _paymentService.GetPaymentByOrderIdAsync(orderId);
            return Ok(BaseResponse<AdminPaymentDto>.Ok(result!));
        }

        [HttpPost("sepay/webhook")]
        public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookRequest request, [FromServices] Microsoft.Extensions.Configuration.IConfiguration config)
        {
            var authHeader = Request.Headers["Authorization"].ToString();
            var configuredToken = config["SePay:ApiToken"];
            
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Apikey "))
            {
                return Unauthorized(new { success = false, message = "Missing or malformed Authorization header" });
            }

            var token = authHeader.Substring("Apikey ".Length).Trim();
            if (token != configuredToken)
            {
                return Unauthorized(new { success = false, message = "Invalid API Token" });
            }

            var success = await _paymentService.ProcessSePayWebhookAsync(request);
            return success ? Ok(new { success = true }) : BadRequest(new { success = false });
        }

        [HttpGet("{orderId:guid}/status")]
        [Authorize]
        public async Task<IActionResult> GetPaymentStatus(Guid orderId, [FromServices] Florist.Application.Interfaces.Repositories.IOrderRepository orderRepo)
        {
            var userId = Guid.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);
            var order = await orderRepo.GetByIdAsync(orderId);
            
            if (order == null) return NotFound(new { success = false, message = "Order not found." });
            if (order.UserId != userId) return StatusCode(403, new { success = false, message = "Access denied." });
            
            return Ok(new 
            { 
                success = true,
                status = order.Payment?.Status.ToString(),
                amount = order.Payment?.Amount,
                paymentReference = order.Payment?.PaymentReference
            });
        }
    }
}
