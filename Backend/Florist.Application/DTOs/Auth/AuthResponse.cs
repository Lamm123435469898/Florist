using System;

namespace Florist.Application.DTOs.Auth
{
    public class AuthResponse
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime AccessTokenExpiry { get; set; }
    }
    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
    public class LogoutRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
