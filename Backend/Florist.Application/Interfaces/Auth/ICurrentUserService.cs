using System;
using System.Collections.Generic;

namespace Florist.Application.Interfaces.Auth
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string? Email { get; }
        bool IsAuthenticated { get; }
        bool HasPermission(string permission);
        bool IsInRole(string role);
    }
}
