using Florist.Application.DTOs.Vouchers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IVoucherService
    {
        Task<ValidateVoucherResponse> ValidateVoucherAsync(Guid userId, ValidateVoucherRequest request);
        Task<List<VoucherDto>> GetAllVouchersAsync();
        Task<VoucherDto> CreateVoucherAsync(CreateVoucherRequest request);
    }
}
