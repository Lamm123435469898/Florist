using Florist.Application.DTOs.Auth;
using Florist.Application.Exceptions;
using Florist.Application.Interfaces.Auth;
using Florist.Application.Interfaces.Repositories;
using Florist.Domain.Entities;
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
            {
                throw new BadRequestException("Email is already in use.");
            }

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
            {
                await _userRepository.AddUserRoleAsync(new UserRole { UserId = createdUser.Id, RoleId = userRole.Id });
            }

            var roles = new List<string> { "USER" };
            var token = _jwtTokenGenerator.GenerateToken(createdUser, roles);

            return new AuthResponse
            {
                UserId = createdUser.Id,
                Email = createdUser.Email,
                FullName = createdUser.FullName,
                AccessToken = token
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository.GetUserByEmailAsync(request.Email);
            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedException("Invalid email or password.");
            }

            var roles = await _userRepository.GetUserRolesAsync(user.Id);
            var token = _jwtTokenGenerator.GenerateToken(user, roles);

            return new AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                AccessToken = token
            };
        }
    }
}
