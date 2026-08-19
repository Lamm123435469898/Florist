using Florist.Application.DTOs.Products;
using Florist.Application.DTOs.Categories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IProductService
    {
        Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams query);
        Task<ProductDto> GetProductByIdAsync(Guid id);
        Task<ProductDto> GetProductBySlugAsync(string slug);
        Task<ProductDto> CreateProductAsync(CreateProductRequest request);
        Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request);
        Task DeleteProductAsync(Guid id);
    }
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request);
        Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request);
        Task DeleteCategoryAsync(Guid id);
    }
}
