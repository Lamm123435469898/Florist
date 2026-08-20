namespace Florist.Application.Exceptions
{
    public class ForbiddenException : System.Exception
    {
        public ForbiddenException(string message = "Access forbidden.") : base(message) { }
    }
}
