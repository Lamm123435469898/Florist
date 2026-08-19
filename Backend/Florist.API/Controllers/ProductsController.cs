using Florist.Application.DTOs;
using Florist.Application.DTOs.Products;
using Florist.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        public ProductsController(IProductService productService) => _productService = productService;

        [HttpGet]
        public async Task<IActionResult> GetProducts([FromQuery] ProductQueryParams query)
        {
            var result = await _productService.GetProductsAsync(query);
            return Ok(BaseResponse<PagedResult<ProductDto>>.Ok(result));
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _productService.GetProductByIdAsync(id);
            return Ok(BaseResponse<ProductDto>.Ok(result));
        }

        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var result = await _productService.GetProductBySlugAsync(slug);
            return Ok(BaseResponse<ProductDto>.Ok(result));
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
        {
            var result = await _productService.CreateProductAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, BaseResponse<ProductDto>.Ok(result, "Product created successfully"));
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
        {
            var result = await _productService.UpdateProductAsync(id, request);
            return Ok(BaseResponse<ProductDto>.Ok(result, "Product updated successfully"));
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _productService.DeleteProductAsync(id);
            return Ok(BaseResponse<object>.Ok(null!, "Product deleted successfully"));
        }
    }
}
