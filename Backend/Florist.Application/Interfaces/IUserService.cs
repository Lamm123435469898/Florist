using Florist.Application.DTOs.Users;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto> GetProfileAsync(Guid userId);
        Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
        Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    }
}
