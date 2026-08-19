using System.Collections.Generic;

namespace Florist.Application.DTOs
{
    public class BaseResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new List<string>();

        public static BaseResponse<T> Ok(T data, string message = "Success")
        {
            return new BaseResponse<T> { Success = true, Data = data, Message = message };
        }

        public static BaseResponse<T> Failure(string message, List<string>? errors = null)
        {
            return new BaseResponse<T> { Success = false, Message = message, Errors = errors ?? new List<string>() };
        }
    }
}
