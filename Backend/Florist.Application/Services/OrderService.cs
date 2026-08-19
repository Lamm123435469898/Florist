using Florist.Application.DTOs.Orders;
using Florist.Application.DTOs.Products;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using Florist.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly ICartRepository _cartRepo;
        private readonly IVoucherRepository _voucherRepo;

        public OrderService(IOrderRepository orderRepo, ICartRepository cartRepo, IVoucherRepository voucherRepo)
        {
            _orderRepo = orderRepo;
            _cartRepo = cartRepo;
            _voucherRepo = voucherRepo;
        }

        public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request)
        {
            var cart = await _cartRepo.GetCartByUserIdAsync(userId)
                ?? throw new BadRequestException("Cart is empty.");
            if (!cart.Items.Any()) throw new BadRequestException("Cart is empty.");

            // Calculate subtotal from backend - NEVER trust client price
            var subTotal = cart.Items.Sum(i => (i.ProductVariant?.Price ?? 0) * i.Quantity);
            decimal discountAmount = 0;
            Guid? voucherId = null;

            if (!string.IsNullOrEmpty(request.VoucherCode))
            {
                var isValid = await _voucherRepo.IsValidForUserAsync(request.VoucherCode, userId, subTotal);
                if (!isValid) throw new BadRequestException("Voucher is invalid or expired.");
                var voucher = await _voucherRepo.GetByCodeAsync(request.VoucherCode);
                if (voucher != null)
                {
                    voucherId = voucher.Id;
                    discountAmount = voucher.DiscountType == VoucherDiscountType.PERCENTAGE
                        ? Math.Min(subTotal * voucher.DiscountValue / 100, voucher.MaximumDiscount ?? decimal.MaxValue)
                        : voucher.DiscountValue;
                }
            }

            // Fixed shipping fee logic (business rule: Backend decides)
            var shippingFee = subTotal >= 500000 ? 0 : 30000;
            var finalTotal = subTotal - discountAmount + shippingFee;

            var order = new Order
            {
                UserId = userId,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                CustomerPhone = request.CustomerPhone,
                ShippingAddress = request.ShippingAddress,
                SubTotal = subTotal,
                DiscountAmount = discountAmount,
                ShippingFee = shippingFee,
                FinalTotal = finalTotal,
                VoucherId = voucherId,
                Status = OrderStatus.PENDING,
                OrderItems = cart.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductVariant!.ProductId,
                    ProductVariantId = i.ProductVariantId,
                    ProductName = i.ProductVariant.Product?.Name ?? string.Empty,
                    SKU = i.ProductVariant.SKU,
                    Price = i.ProductVariant.Price, // Snapshot price
                    Quantity = i.Quantity
                }).ToList(),
                Payment = new Payment
                {
                    PaymentProvider = request.PaymentMethod,
                    Amount = finalTotal,
                    Status = request.PaymentMethod == "COD" ? PaymentStatus.PENDING : PaymentStatus.PENDING
                }
            };

            var created = await _orderRepo.CreateAsync(order);

            if (voucherId.HasValue)
                await _voucherRepo.MarkUsedAsync(voucherId.Value, userId, created.Id);

            await _cartRepo.ClearCartAsync(cart.Id);

            return MapToDto(created);
        }

        public async Task<PagedResult<OrderDto>> GetMyOrdersAsync(Guid userId, int page, int pageSize)
        {
            var result = await _orderRepo.GetOrdersByUserAsync(userId, page, pageSize);
            return new PagedResult<OrderDto>
            {
                Items = result.Items.Select(MapToDto).ToList(),
                TotalCount = result.TotalCount, Page = result.Page, PageSize = result.PageSize
            };
        }

        public async Task<OrderDto> GetOrderByIdAsync(Guid orderId, Guid userId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId)
                ?? throw new NotFoundException($"Order {orderId} not found.");
            if (order.UserId != userId) throw new UnauthorizedException("Access denied.");
            return MapToDto(order);
        }

        public async Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page, int pageSize, string? status)
        {
            var result = await _orderRepo.GetAllOrdersAsync(page, pageSize, status);
            return new PagedResult<OrderDto>
            {
                Items = result.Items.Select(MapToDto).ToList(),
                TotalCount = result.TotalCount, Page = result.Page, PageSize = result.PageSize
            };
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusRequest request)
        {
            var order = await _orderRepo.GetByIdAsync(orderId)
                ?? throw new NotFoundException($"Order {orderId} not found.");
            if (!System.Enum.TryParse<OrderStatus>(request.Status, true, out var newStatus))
                throw new BadRequestException($"Invalid order status: {request.Status}");
            order.Status = newStatus;
            var updated = await _orderRepo.UpdateAsync(order);
            return MapToDto(updated);
        }

        public async Task<OrderDto> CancelOrderAsync(Guid orderId, Guid userId)
        {
            var order = await _orderRepo.GetByIdAsync(orderId)
                ?? throw new NotFoundException($"Order {orderId} not found.");
            if (order.UserId != userId) throw new UnauthorizedException("Access denied.");
            if (order.Status != OrderStatus.PENDING)
                throw new BadRequestException("Only PENDING orders can be cancelled.");
            order.Status = OrderStatus.CANCELLED;
            var updated = await _orderRepo.UpdateAsync(order);
            return MapToDto(updated);
        }

        private static OrderDto MapToDto(Order o) => new()
        {
            Id = o.Id,
            CustomerName = o.CustomerName,
            CustomerEmail = o.CustomerEmail,
            CustomerPhone = o.CustomerPhone,
            ShippingAddress = o.ShippingAddress,
            SubTotal = o.SubTotal,
            DiscountAmount = o.DiscountAmount,
            ShippingFee = o.ShippingFee,
            FinalTotal = o.FinalTotal,
            Status = o.Status.ToString(),
            VoucherCode = o.Voucher?.Code,
            CreatedAt = o.CreatedAt,
            OrderItems = o.OrderItems?.Select(i => new OrderItemDto
            {
                Id = i.Id, ProductName = i.ProductName, SKU = i.SKU,
                Price = i.Price, Quantity = i.Quantity
            }).ToList() ?? new()
        };
    }
}
