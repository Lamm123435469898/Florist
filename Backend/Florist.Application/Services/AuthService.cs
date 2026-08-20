using Florist.Application.DTOs.Auth;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _userRepository.ExistsByEmailAsync(request.Email))
                throw new ConflictException("Email is already in use.");

            var user = new User
            {
                Email = request.Email,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = _passwordHasher.HashPassword(request.Password)
            };

            var createdUser = await _userRepository.AddUserAsync(user);
            var userRole = await _userRepository.GetRoleByNameAsync("USER");
            if (userRole != null)
                await _userRepository.AddUserRoleAsync(new UserRole { UserId = createdUser.Id, RoleId = userRole.Id });

            var roles = new List<string> { "USER" };
            return await BuildAuthResponse(createdUser, roles);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetUserByEmailAsync(request.Email);
            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
                throw new UnauthorizedException("Invalid email or password.");

            var roles = await _userRepository.GetUserRolesAsync(user.Id);
            return await BuildAuthResponse(user, roles);
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var refreshToken = await _userRepository.GetRefreshTokenAsync(request.RefreshToken)
                ?? throw new UnauthorizedException("Invalid or expired refresh token.");

            if (refreshToken.ExpiresAt < DateTime.UtcNow)
                throw new UnauthorizedException("Refresh token has expired.");

            // Revoke old refresh token (rotation)
            await _userRepository.RevokeRefreshTokenAsync(request.RefreshToken);

            var user = refreshToken.User!;
            var roles = await _userRepository.GetUserRolesAsync(user.Id);
            return await BuildAuthResponse(user, roles);
        }

        public async Task LogoutAsync(LogoutRequest request)
        {
            await _userRepository.RevokeRefreshTokenAsync(request.RefreshToken);
        }

        private async Task<AuthResponse> BuildAuthResponse(User user, System.Collections.Generic.IEnumerable<string> roles)
        {
            var permissions = await _userRepository.GetUserPermissionsAsync(user.Id);
            var accessToken = _jwtTokenGenerator.GenerateToken(user, roles, permissions);
            var refreshTokenStr = _jwtTokenGenerator.GenerateRefreshToken();
            var expiry = _jwtTokenGenerator.GetRefreshTokenExpiry();

            await _userRepository.AddRefreshTokenAsync(new RefreshToken
            {
                Token = refreshTokenStr,
                UserId = user.Id,
                ExpiresAt = expiry
            });

            return new AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                AccessToken = accessToken,
                RefreshToken = refreshTokenStr,
                AccessTokenExpiry = DateTime.UtcNow.AddMinutes(60)
            };
        }
    }
}

