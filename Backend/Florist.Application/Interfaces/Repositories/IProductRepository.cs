using Florist.Application.DTOs.Products;
using Florist.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Repositories
{
    public interface IProductRepository
    {
        Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams query);
        Task<Product?> GetByIdAsync(Guid id);
        Task<Product?> GetBySlugAsync(string slug);
        Task<Product> CreateAsync(Product product);
        Task<Product> UpdateAsync(Product product);
        Task DeleteAsync(Guid id);
        Task<bool> SlugExistsAsync(string slug);
    }
    public interface ICategoryRepository
    {
        Task<List<Florist.Domain.Entities.Category>> GetAllAsync();
        Task<Florist.Domain.Entities.Category?> GetByIdAsync(Guid id);
        Task<Florist.Domain.Entities.Category> CreateAsync(Florist.Domain.Entities.Category category);
        Task<Florist.Domain.Entities.Category> UpdateAsync(Florist.Domain.Entities.Category category);
        Task DeleteAsync(Guid id);
        Task<bool> SlugExistsAsync(string slug);
    }
}
