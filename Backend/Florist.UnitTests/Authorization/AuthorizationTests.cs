using Florist.API.Authorization;
using Florist.Domain.Entities;
using Florist.Infrastructure.Auth;
using Florist.Infrastructure.Auth.Settings;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace Florist.UnitTests.Authorization
{
    public class AuthorizationTests
    {
        [Fact]
        public void JwtTokenGenerator_ShouldIncludePermissionsInToken()
        {
            // Arrange
            var jwtSettings = new JwtSettings
            {
                Secret = "A_Very_Long_Super_Secret_Key_For_Florist_App_12345!",
                Issuer = "TestIssuer",
                Audience = "TestAudience",
                ExpiryMinutes = 60
            };
            var options = Options.Create(jwtSettings);
            var generator = new JwtTokenGenerator(options);

            var user = new User { Id = Guid.NewGuid(), Email = "test@test.com", FullName = "Test User" };
            var roles = new List<string> { "STAFF" };
            var permissions = new List<string> { "user.read", "product.update" };

            // Act
            var tokenStr = generator.GenerateToken(user, roles, permissions);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(tokenStr);

            token.Claims.Should().Contain(c => c.Type == "permissions" && c.Value == "user.read");
            token.Claims.Should().Contain(c => c.Type == "permissions" && c.Value == "product.update");
        }

        [Fact]
        public async Task PermissionAuthorizationHandler_WithCorrectPermission_ShouldSucceed()
        {
            // Arrange
            var handler = new PermissionAuthorizationHandler();
            var requirement = new PermissionRequirement("user.delete");
            
            var claims = new List<Claim>
            {
                new Claim("permissions", "user.read"),
                new Claim("permissions", "user.delete")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var user = new ClaimsPrincipal(identity);
            
            var context = new AuthorizationHandlerContext(new[] { requirement }, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert
            context.HasSucceeded.Should().BeTrue();
        }

        [Fact]
        public async Task PermissionAuthorizationHandler_WithoutCorrectPermission_EvenIfAdmin_ShouldFail()
        {
            // Arrange
            var handler = new PermissionAuthorizationHandler();
            var requirement = new PermissionRequirement("user.delete");
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Role, "ADMIN"), // Is Admin
                new Claim("permissions", "user.read") // But lacks user.delete
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var user = new ClaimsPrincipal(identity);
            
            var context = new AuthorizationHandlerContext(new[] { requirement }, user, null);

            // Act
            await handler.HandleAsync(context);

            // Assert
            context.HasSucceeded.Should().BeFalse();
        }
    }
}
