using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class QuizDto : CourseContentDto
    {
        public int? TimeLimit { get; set; } // in minutes
        public int TotalPoints { get; set; }
        public int PassingScore { get; set; }
        public bool IsRandomQuestion { get; set; }
        public int MaxAttempts { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // Optional: Include questions when needed
        public List<QuizQuestionDto>? Questions { get; set; }

        // Statistics
        public int TotalQuestions { get; set; }
        public int TotalSubmissions { get; set; }
        public int CompletedSubmissions { get; set; }
        public double AverageScore { get; set; }
        public int PassedCount { get; set; }
        public int FailedCount { get; set; }
    }
    public class CreateQuizDto
    {
        [Required]
        public Guid ChapterId { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int OrderIndex { get; set; }

        public int? TimeLimit { get; set; }

        [Required]
        public int TotalPoints { get; set; }

        [Required]
        public int PassingScore { get; set; }

        public bool IsRandomQuestion { get; set; }
        public int MaxAttempts { get; set; } = 1;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
    public class UpdateQuizDto
    {
        public string? Title { get; set; }
        public int? OrderIndex { get; set; }
        public int? TimeLimit { get; set; }
        public int? TotalPoints { get; set; }
        public int? PassingScore { get; set; }
        public bool? IsRandomQuestion { get; set; }
        public int? MaxAttempts { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsPublished { get; set; }
    }
    public class QuestionTopicDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid LecturerId { get; set; }

        // Statistics
        public int TotalQuestions { get; set; }
        public int UsedInQuizzes { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    public class CreateQuestionTopicDto
    {
        public string Name { get; set; } = string.Empty;
    }
    public class QuizSubmissionSummaryDto
    {
        public Guid QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public Guid SubmissionId { get; set; }
        public DateTime SubmittedAt { get; set; }
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty; // "InProgress", "Submitted", "Graded"
        public bool Passed { get; set; }
    }
    public class QuizSubmissionDto
    {
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public Guid StudentId { get; set; }

        // Student info
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public string? StudentCode { get; set; }

        // Quiz info
        public string QuizTitle { get; set; } = string.Empty;

        // Submission details
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public double Score { get; set; }
        public string Status { get; set; } = string.Empty; // "InProgress", "Submitted", "Graded"

        // Answers (JSON or structured)
        public string? TempData { get; set; }
        public List<SubmissionAnswerDto>? Answers { get; set; }

        public DateTime CreatedAt { get; set; }
    }

}
