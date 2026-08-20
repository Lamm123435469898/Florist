using Florist.Domain.Entities;
using System;
using System.Collections.Generic;

namespace Florist.Application.Interfaces.Auth
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
        string GenerateRefreshToken();
        DateTime GetRefreshTokenExpiry();
    }
}
