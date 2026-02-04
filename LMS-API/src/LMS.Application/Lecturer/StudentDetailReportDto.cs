using System;
using System.Collections.Generic;

namespace LMS.Application.Lecturer
{
    public class StudentDetailReportDto
    {
        public Guid StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        
        public double Progress { get; set; }
        public double AvgQuizScore { get; set; }
        public double ParticipationRate { get; set; }

        public List<LessonDetailDto> Lessons { get; set; } = new List<LessonDetailDto>();
        public List<QuizResultDto> Quizzes { get; set; } = new List<QuizResultDto>();
    }

    public class LessonDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public DateTime? LastAccess { get; set; }
        public string ChapterTitle { get; set; } = string.Empty;
    }

    public class QuizResultDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public double? Score { get; set; }
        public double MaxScore { get; set; } = 10;
        public DateTime? SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty; // InProgress, Submitted...
    }
}
