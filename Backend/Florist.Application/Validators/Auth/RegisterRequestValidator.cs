using FluentValidation;
using Florist.Application.DTOs.Auth;

namespace Florist.Application.Validators.Auth
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Email is invalid.");
                
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");
                
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full Name is required.");
        }
    }
}
