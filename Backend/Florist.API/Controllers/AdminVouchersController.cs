using Florist.Application.DTOs;
using Florist.Application.DTOs.Vouchers;
using Florist.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/admin/vouchers")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminVouchersController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public AdminVouchersController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _voucherService.GetAllVouchersAsync();
            return Ok(BaseResponse<List<VoucherDto>>.Ok(result));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVoucherRequest request)
        {
            var result = await _voucherService.CreateVoucherAsync(request);
            return Ok(BaseResponse<VoucherDto>.Ok(result, "Voucher created successfully"));
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateVoucherRequest request)
        {
            var result = await _voucherService.UpdateVoucherAsync(id, request);
            return Ok(BaseResponse<VoucherDto>.Ok(result, "Voucher updated successfully"));
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _voucherService.DeleteVoucherAsync(id);
            return Ok(BaseResponse<object>.Ok(null!, "Voucher deleted successfully"));
        }
    }
}
