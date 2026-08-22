using System;
using System.Collections.Generic;

namespace Florist.Application.DTOs.Orders
{
    public class OrderItemDto
    {
        public Guid Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal => Price * Quantity;
    }
    public class OrderDto
    {
        public Guid Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal FinalTotal { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ShippingStatus { get; set; }
        public string? Carrier { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        
        public string? VoucherCode { get; set; }
        public string? PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }
        public string? PaymentReference { get; set; }
        public string? Notes { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
    public class CreateOrderRequest
    {
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string? VoucherCode { get; set; }
        public string PaymentMethod { get; set; } = "COD"; // COD, VNPay, MoMo
        public string? Notes { get; set; }
    }
    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
    public class UpdateShippingStatusRequest
    {
        public string ShippingStatus { get; set; } = string.Empty;
        public string? Carrier { get; set; }
        public string? TrackingNumber { get; set; }
    }
}
