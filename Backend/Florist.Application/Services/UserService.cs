using Florist.Application.DTOs.Users;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces;
using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Repositories;
using System;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly IPasswordHasher _passwordHasher;

        public UserService(IUserRepository userRepo, IPasswordHasher passwordHasher)
        {
            _userRepo = userRepo;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserProfileDto> GetProfileAsync(Guid userId)
        {
            var user = await _userRepo.GetUserByIdAsync(userId)
                ?? throw new NotFoundException("User not found.");
            return new UserProfileDto { Id = user.Id, Email = user.Email, FullName = user.FullName, PhoneNumber = user.PhoneNumber };
        }

        public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
        {
            var user = await _userRepo.GetUserByIdAsync(userId)
                ?? throw new NotFoundException("User not found.");
            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;
            var updated = await _userRepo.UpdateAsync(user);
            return new UserProfileDto { Id = updated.Id, Email = updated.Email, FullName = updated.FullName, PhoneNumber = updated.PhoneNumber };
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            var user = await _userRepo.GetUserByIdAsync(userId)
                ?? throw new NotFoundException("User not found.");
            if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
                throw new BadRequestException("Current password is incorrect.");
            user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
            await _userRepo.UpdateAsync(user);
        }
    }
}

