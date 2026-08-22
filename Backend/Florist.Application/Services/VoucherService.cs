using Florist.Application.DTOs.Vouchers;
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
    public class VoucherService : IVoucherService
    {
        private readonly IVoucherRepository _voucherRepo;

        public VoucherService(IVoucherRepository voucherRepo)
        {
            _voucherRepo = voucherRepo;
        }

        public async Task<ValidateVoucherResponse> ValidateVoucherAsync(Guid userId, ValidateVoucherRequest request)
        {
            var isValid = await _voucherRepo.IsValidForUserAsync(request.Code, userId, request.OrderTotal);
            if (!isValid)
                return new ValidateVoucherResponse { IsValid = false, Message = "Voucher is invalid, expired, or already used." };

            var voucher = await _voucherRepo.GetByCodeAsync(request.Code);
            decimal discount = voucher!.DiscountType == VoucherDiscountType.PERCENTAGE
                ? Math.Min(request.OrderTotal * voucher.DiscountValue / 100, voucher.MaximumDiscount ?? decimal.MaxValue)
                : voucher.DiscountValue;

            return new ValidateVoucherResponse { IsValid = true, Message = "Voucher is valid.", DiscountAmount = discount };
        }

        public async Task<List<VoucherDto>> GetAllVouchersAsync()
        {
            var vouchers = await _voucherRepo.GetAllAsync();
            return vouchers.Select(v => new VoucherDto
            {
                Id = v.Id,
                Code = v.Code,
                DiscountType = v.DiscountType.ToString(),
                DiscountValue = v.DiscountValue,
                MinimumOrderValue = v.MinimumOrderValue,
                MaximumDiscount = v.MaximumDiscount,
                StartDate = v.StartDate,
                EndDate = v.EndDate,
                UsageLimit = v.UsageLimit,
                UsedCount = v.UsedCount,
                Status = v.Status.ToString()
            }).ToList();
        }

        public async Task<VoucherDto> CreateVoucherAsync(CreateVoucherRequest request)
        {
            var existing = await _voucherRepo.GetByCodeAsync(request.Code);
            if (existing != null) throw new BadRequestException("Voucher code already exists.");

            var voucher = new Voucher
            {
                Code = request.Code.ToUpper(),
                DiscountType = Enum.Parse<VoucherDiscountType>(request.DiscountType),
                DiscountValue = request.DiscountValue,
                MinimumOrderValue = request.MinimumOrderValue,
                MaximumDiscount = request.MaximumDiscount,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                UsageLimit = request.UsageLimit,
                Status = VoucherStatus.ACTIVE
            };

            var created = await _voucherRepo.CreateAsync(voucher);
            return await MapToDto(created);
        }

        public async Task<VoucherDto> UpdateVoucherAsync(Guid id, CreateVoucherRequest request)
        {
            var voucher = await _voucherRepo.GetByIdAsync(id);
            if (voucher == null) throw new NotFoundException("Voucher not found.");

            voucher.Code = request.Code.ToUpper();
            voucher.DiscountType = Enum.Parse<VoucherDiscountType>(request.DiscountType);
            voucher.DiscountValue = request.DiscountValue;
            voucher.MinimumOrderValue = request.MinimumOrderValue;
            voucher.MaximumDiscount = request.MaximumDiscount;
            voucher.StartDate = request.StartDate;
            voucher.EndDate = request.EndDate;
            voucher.UsageLimit = request.UsageLimit;

            var updated = await _voucherRepo.UpdateAsync(voucher);
            return await MapToDto(updated);
        }

        public async Task DeleteVoucherAsync(Guid id)
        {
            await _voucherRepo.DeleteAsync(id);
        }

        private Task<VoucherDto> MapToDto(Voucher v)
        {
            return Task.FromResult(new VoucherDto
            {
                Id = v.Id,
                Code = v.Code,
                DiscountType = v.DiscountType.ToString(),
                DiscountValue = v.DiscountValue,
                MinimumOrderValue = v.MinimumOrderValue,
                MaximumDiscount = v.MaximumDiscount,
                StartDate = v.StartDate,
                EndDate = v.EndDate,
                UsageLimit = v.UsageLimit,
                UsedCount = v.UsedCount,
                Status = v.Status.ToString()
            });
        }
    }
}
