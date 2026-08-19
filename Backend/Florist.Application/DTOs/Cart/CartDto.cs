using System;
using System.Collections.Generic;

namespace Florist.Application.DTOs.Cart
{
    public class CartItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductVariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? ImageUrl { get; set; }
        public string? Size { get; set; }
        public string? Color { get; set; }
        public decimal Subtotal => Price * Quantity;
    }
    public class CartDto
    {
        public Guid Id { get; set; }
        public List<CartItemDto> Items { get; set; } = new();
        public decimal Total => Items.Sum(i => i.Subtotal);
        public int TotalItems => Items.Sum(i => i.Quantity);
    }
    public class AddToCartRequest
    {
        public Guid ProductVariantId { get; set; }
        public int Quantity { get; set; } = 1;
    }
    public class UpdateCartItemRequest
    {
        public int Quantity { get; set; }
    }
}
