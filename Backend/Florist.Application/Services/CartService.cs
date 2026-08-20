using Florist.Application.DTOs.Cart;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepo;
        private readonly IProductRepository _productRepo;

        public CartService(ICartRepository cartRepo, IProductRepository productRepo)
        {
            _cartRepo = cartRepo;
            _productRepo = productRepo;
        }

        public async Task<CartDto> GetCartAsync(Guid userId)
        {
            var cart = await _cartRepo.GetOrCreateCartAsync(userId);
            return MapToDto(cart);
        }

        public async Task<CartDto> AddItemAsync(Guid userId, AddToCartRequest request)
        {
            if (request.Quantity <= 0) throw new BadRequestException("Quantity must be greater than 0.");

            var cart = await _cartRepo.GetOrCreateCartAsync(userId);
            var existingItem = await _cartRepo.GetCartItemAsync(cart.Id, request.ProductVariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
                await _cartRepo.UpdateItemAsync(existingItem);
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductVariantId = request.ProductVariantId,
                    Quantity = request.Quantity
                };
                await _cartRepo.AddItemAsync(newItem);
            }

            var updatedCart = await _cartRepo.GetOrCreateCartAsync(userId);
            return MapToDto(updatedCart);
        }

        public async Task<CartDto> UpdateItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequest request)
        {
            var cart = await _cartRepo.GetOrCreateCartAsync(userId);
            var item = await _cartRepo.GetCartItemByIdAsync(cartItemId)
                ?? throw new NotFoundException("Cart item not found.");

            if (item.CartId != cart.Id) throw new ForbiddenException("Access denied.");

            if (request.Quantity <= 0)
            {
                await _cartRepo.RemoveItemAsync(item);
            }
            else
            {
                item.Quantity = request.Quantity;
                await _cartRepo.UpdateItemAsync(item);
            }

            var updatedCart = await _cartRepo.GetOrCreateCartAsync(userId);
            return MapToDto(updatedCart);
        }

        public async Task<CartDto> RemoveItemAsync(Guid userId, Guid cartItemId)
        {
            var cart = await _cartRepo.GetOrCreateCartAsync(userId);
            var item = await _cartRepo.GetCartItemByIdAsync(cartItemId)
                ?? throw new NotFoundException("Cart item not found.");
            if (item.CartId != cart.Id) throw new ForbiddenException("Access denied.");
            await _cartRepo.RemoveItemAsync(item);
            var updatedCart = await _cartRepo.GetOrCreateCartAsync(userId);
            return MapToDto(updatedCart);
        }

        public async Task ClearCartAsync(Guid userId)
        {
            var cart = await _cartRepo.GetOrCreateCartAsync(userId);
            await _cartRepo.ClearCartAsync(cart.Id);
        }

        private static CartDto MapToDto(Cart cart)
        {
            return new CartDto
            {
                Id = cart.Id,
                Items = cart.Items?.Select(i => new CartItemDto
                {
                    Id = i.Id,
                    ProductVariantId = i.ProductVariantId,
                    ProductName = i.ProductVariant?.Product?.Name ?? string.Empty,
                    SKU = i.ProductVariant?.SKU ?? string.Empty,
                    Price = i.ProductVariant?.Price ?? 0,
                    Quantity = i.Quantity,
                    Size = i.ProductVariant?.Size,
                    Color = i.ProductVariant?.Color,
                    ImageUrl = i.ProductVariant?.Product?.Images?.FirstOrDefault(img => img.IsPrimary)?.ImageUrl
                }).ToList() ?? new()
            };
        }
    }
}
