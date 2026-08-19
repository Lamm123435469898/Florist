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
            var voucher = await _voucherRepo.GetByCodeAsync("");
            // This is a simplified version - in real project use dedicated list method
            return new List<VoucherDto>();
        }

        public async Task<VoucherDto> CreateVoucherAsync(CreateVoucherRequest request)
        {
            throw new NotImplementedException("Use admin panel or direct DB insert for now.");
        }
    }
}
