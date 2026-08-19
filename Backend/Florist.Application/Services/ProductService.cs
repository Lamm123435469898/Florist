using Florist.Application.DTOs.Categories;
using Florist.Application.DTOs.Products;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepo;
        public ProductService(IProductRepository productRepo) => _productRepo = productRepo;

        public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams query) =>
            await _productRepo.GetProductsAsync(query);

        public async Task<ProductDto> GetProductByIdAsync(Guid id)
        {
            var p = await _productRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Product {id} not found.");
            return MapToDto(p);
        }

        public async Task<ProductDto> GetProductBySlugAsync(string slug)
        {
            var p = await _productRepo.GetBySlugAsync(slug)
                ?? throw new NotFoundException($"Product '{slug}' not found.");
            return MapToDto(p);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductRequest request)
        {
            if (await _productRepo.SlugExistsAsync(request.Slug))
                throw new BadRequestException($"Slug '{request.Slug}' already exists.");

            var product = new Product
            {
                Name = request.Name,
                Slug = request.Slug,
                Description = request.Description,
                CategoryId = request.CategoryId,
                Variants = request.Variants.Select(v => new ProductVariant
                {
                    SKU = v.SKU, Price = v.Price, Stock = v.Stock, Size = v.Size, Color = v.Color
                }).ToList(),
                Images = request.ImageUrls.Select((url, i) => new ProductImage
                {
                    ImageUrl = url, IsPrimary = i == 0
                }).ToList()
            };

            var created = await _productRepo.CreateAsync(product);
            return MapToDto(created);
        }

        public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request)
        {
            var product = await _productRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Product {id} not found.");
            product.Name = request.Name;
            product.Description = request.Description;
            product.CategoryId = request.CategoryId;
            product.IsActive = request.IsActive;
            var updated = await _productRepo.UpdateAsync(product);
            return MapToDto(updated);
        }

        public async Task DeleteProductAsync(Guid id) => await _productRepo.DeleteAsync(id);

        private static ProductDto MapToDto(Product p) => new()
        {
            Id = p.Id, Name = p.Name, Slug = p.Slug, Description = p.Description,
            IsActive = p.IsActive, CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? string.Empty,
            Variants = p.Variants?.Select(v => new ProductVariantDto
            {
                Id = v.Id, SKU = v.SKU, Price = v.Price, Stock = v.Stock,
                Size = v.Size, Color = v.Color, IsActive = v.IsActive
            }).ToList() ?? new(),
            Images = p.Images?.Select(i => new ProductImageDto
            {
                Id = i.Id, ImageUrl = i.ImageUrl, IsPrimary = i.IsPrimary
            }).ToList() ?? new()
        };
    }

    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepo;
        public CategoryService(ICategoryRepository categoryRepo) => _categoryRepo = categoryRepo;

        public async Task<List<CategoryDto>> GetAllCategoriesAsync()
        {
            var cats = await _categoryRepo.GetAllAsync();
            return cats.Select(c => new CategoryDto
            {
                Id = c.Id, Name = c.Name, Slug = c.Slug, Description = c.Description,
                ImageUrl = c.ImageUrl, IsActive = c.IsActive
            }).ToList();
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request)
        {
            if (await _categoryRepo.SlugExistsAsync(request.Slug))
                throw new BadRequestException($"Slug '{request.Slug}' already exists.");
            var cat = new Category { Name = request.Name, Slug = request.Slug, Description = request.Description, ImageUrl = request.ImageUrl };
            var created = await _categoryRepo.CreateAsync(cat);
            return new CategoryDto { Id = created.Id, Name = created.Name, Slug = created.Slug, Description = created.Description, ImageUrl = created.ImageUrl, IsActive = created.IsActive };
        }

        public async Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request)
        {
            var cat = await _categoryRepo.GetByIdAsync(id) ?? throw new NotFoundException($"Category {id} not found.");
            cat.Name = request.Name; cat.Description = request.Description; cat.ImageUrl = request.ImageUrl; cat.IsActive = request.IsActive;
            var updated = await _categoryRepo.UpdateAsync(cat);
            return new CategoryDto { Id = updated.Id, Name = updated.Name, Slug = updated.Slug, Description = updated.Description, ImageUrl = updated.ImageUrl, IsActive = updated.IsActive };
        }

        public async Task DeleteCategoryAsync(Guid id) => await _categoryRepo.DeleteAsync(id);
    }
}
