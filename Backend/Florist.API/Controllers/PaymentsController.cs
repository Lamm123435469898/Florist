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
    }
}
