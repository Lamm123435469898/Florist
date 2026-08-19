using Florist.Application.DTOs;
using Florist.Application.DTOs.Auth;
using Florist.Application.Interfaces.Auth;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Florist.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(BaseResponse<AuthResponse>.Ok(response, "User registered successfully"));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _authService.LoginAsync(request);
            return Ok(BaseResponse<AuthResponse>.Ok(response, "Login successful"));
        }
    }
}
