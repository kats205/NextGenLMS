using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class StudentDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? StudentCode { get; set; }
        public string? AvatarUrl { get; set; }

        // For course enrollment
        public DateTime? EnrolledDate { get; set; }

        // Quick stats (when in course context)
        public double? Progress { get; set; } // 0-100
        public double? AverageScore { get; set; } // 0-10
    }
    public class StudentProgressDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public string? StudentCode { get; set; }
        public string? AvatarUrl { get; set; }

        // Lesson progress
        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public double LessonCompletionRate { get; set; } // percentage

        // Quiz progress
        public int CompletedQuizzes { get; set; }
        public int TotalQuizzes { get; set; }
        public double QuizCompletionRate { get; set; } // percentage

        // Scores
        public double AverageQuizScore { get; set; } // 0-10
        public double AverageAssignmentScore { get; set; } // 0-10
        public double OverallScore { get; set; } // 0-10

        // Overall progress
        public double ProgressPercentage { get; set; } // 0-100

        // Time tracking
        public int TotalTimeSpentSeconds { get; set; }
        public DateTime? LastAccessDate { get; set; }

        // Detailed breakdown (optional)
        public List<LessonProgressDetailDto>? LessonProgress { get; set; }
        public List<QuizSubmissionSummaryDto>? QuizSubmissions { get; set; }
    }
}
