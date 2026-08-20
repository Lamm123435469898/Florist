using Florist.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Florist.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<User> AddUserAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<IEnumerable<string>> GetUserRolesAsync(Guid userId);
        Task<IEnumerable<string>> GetUserPermissionsAsync(Guid userId);
        Task<Role?> GetRoleByNameAsync(string name);
        Task AddUserRoleAsync(UserRole userRole);
        Task<bool> ExistsByEmailAsync(string email);
        Task<RefreshToken?> GetRefreshTokenAsync(string token);
        Task AddRefreshTokenAsync(RefreshToken token);
        Task RevokeRefreshTokenAsync(string token);
    }
}
