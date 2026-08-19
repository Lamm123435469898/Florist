using Florist.Application.DTOs.Products;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;
        public ProductRepository(ApplicationDbContext context) => _context = context;

        public async Task<PagedResult<ProductDto>> GetProductsAsync(ProductQueryParams query)
        {
            var q = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .Include(p => p.Images)
                .Where(p => p.IsActive);

            if (!string.IsNullOrWhiteSpace(query.Search))
                q = q.Where(p => p.Name.Contains(query.Search));
            if (query.CategoryId.HasValue)
                q = q.Where(p => p.CategoryId == query.CategoryId.Value);
            if (query.MinPrice.HasValue)
                q = q.Where(p => p.Variants.Any(v => v.Price >= query.MinPrice.Value));
            if (query.MaxPrice.HasValue)
                q = q.Where(p => p.Variants.Any(v => v.Price <= query.MaxPrice.Value));

            q = query.SortBy switch
            {
                "price_asc" => q.OrderBy(p => p.Variants.Min(v => v.Price)),
                "price_desc" => q.OrderByDescending(p => p.Variants.Max(v => v.Price)),
                _ => q.OrderByDescending(p => p.CreatedAt)
            };

            var total = await q.CountAsync();
            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Slug = p.Slug,
                    Description = p.Description,
                    IsActive = p.IsActive,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                    Variants = p.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto
                    {
                        Id = v.Id, SKU = v.SKU, Price = v.Price, Stock = v.Stock,
                        Size = v.Size, Color = v.Color, IsActive = v.IsActive
                    }).ToList(),
                    Images = p.Images.Select(i => new ProductImageDto
                    {
                        Id = i.Id, ImageUrl = i.ImageUrl, IsPrimary = i.IsPrimary
                    }).ToList()
                }).ToListAsync();

            return new PagedResult<ProductDto> { Items = items, TotalCount = total, Page = query.Page, PageSize = query.PageSize };
        }

        public async Task<Product?> GetByIdAsync(Guid id) =>
            await _context.Products.Include(p => p.Category).Include(p => p.Variants).Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);

        public async Task<Product?> GetBySlugAsync(string slug) =>
            await _context.Products.Include(p => p.Category).Include(p => p.Variants).Include(p => p.Images).FirstOrDefaultAsync(p => p.Slug == slug);

        public async Task<Product> CreateAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product> UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task DeleteAsync(Guid id)
        {
            var p = await _context.Products.FindAsync(id);
            if (p != null) { p.IsActive = false; await _context.SaveChangesAsync(); }
        }

        public async Task<bool> SlugExistsAsync(string slug) =>
            await _context.Products.AnyAsync(p => p.Slug == slug);
    }

    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;
        public CategoryRepository(ApplicationDbContext context) => _context = context;

        public async Task<List<Category>> GetAllAsync() =>
            await _context.Categories.Where(c => c.IsActive).OrderBy(c => c.SortOrder).ToListAsync();

        public async Task<Category?> GetByIdAsync(Guid id) =>
            await _context.Categories.FindAsync(id);

        public async Task<Category> CreateAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<Category> UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task DeleteAsync(Guid id)
        {
            var c = await _context.Categories.FindAsync(id);
            if (c != null) { c.IsActive = false; await _context.SaveChangesAsync(); }
        }

        public async Task<bool> SlugExistsAsync(string slug) =>
            await _context.Categories.AnyAsync(c => c.Slug == slug);
    }
}
