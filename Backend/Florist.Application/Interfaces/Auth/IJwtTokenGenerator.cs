using Florist.Domain.Entities;
using System.Collections.Generic;

namespace Florist.Application.Interfaces.Auth
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user, IEnumerable<string> roles);
    }
}
