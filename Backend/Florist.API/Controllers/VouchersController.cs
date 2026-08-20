using Florist.Application.DTOs;
using Florist.Application.DTOs.Vouchers;
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
    public class VouchersController : ControllerBase
    {
        private readonly IVoucherService _voucherService;
        public VouchersController(IVoucherService voucherService) => _voucherService = voucherService;

        private Guid GetUserId() => Guid.Parse(User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier)!);

        [HttpPost("validate")]
        [Authorize]
        public async Task<IActionResult> Validate([FromBody] ValidateVoucherRequest request)
        {
            var result = await _voucherService.ValidateVoucherAsync(GetUserId(), request);
            return Ok(BaseResponse<ValidateVoucherResponse>.Ok(result));
        }
    }
}
