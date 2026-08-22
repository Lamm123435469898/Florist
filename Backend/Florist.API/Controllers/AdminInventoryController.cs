using Florist.Application.DTOs;
using Florist.Application.DTOs.Inventory;
using Florist.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/admin/inventory")]
    [ApiController]
    [Authorize(Roles = "ADMIN")]
    public class AdminInventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public AdminInventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet("{variantId:guid}/transactions")]
        public async Task<IActionResult> GetTransactions(Guid variantId)
        {
            var result = await _inventoryService.GetTransactionsAsync(variantId);
            return Ok(BaseResponse<List<InventoryTransactionDto>>.Ok(result));
        }

        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustStock([FromBody] AdjustStockRequest request)
        {
            await _inventoryService.AdjustStockAsync(request.VariantId, request.Quantity, request.Note);
            return Ok(BaseResponse<object>.Ok(null!, "Stock adjusted successfully"));
        }
    }
}
