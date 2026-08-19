using System;

namespace Florist.Application.DTOs.Reviews
{
    public class ReviewDto
    {
        public Guid Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
    public class CreateReviewRequest
    {
        public Guid ProductId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }
}
