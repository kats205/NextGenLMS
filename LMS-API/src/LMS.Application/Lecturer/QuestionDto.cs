using LMS.Domain.Entities.Assessment;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class QuestionDto
    {
        public Guid Id { get; set; }
        public Guid TopicId { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public string? MediaUrl { get; set; }
        public string Type { get; set; } = string.Empty; // "MultipleChoice", "Essay", "TrueFalse"

        // Navigation
        public string? TopicName { get; set; }
        public List<AnswerDto> Answers { get; set; } = new();

        // For question bank
        public int UsageCount { get; set; }
        public string? Difficulty { get; set; } // "Easy", "Medium", "Hard"
        public List<string> Tags { get; set; } = new();

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
    public class AnswerDto
    {
        public Guid Id { get; set; }
        public Guid QuestionId { get; set; }
        public string ContentText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
    public class SubmissionAnswerDto
    {
        public Guid QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public int Points { get; set; }

        // Student's answer
        public string? AnswerText { get; set; }
        public Guid? SelectedAnswerId { get; set; }

        // Grading
        public double EarnedPoints { get; set; }
        public bool? IsCorrect { get; set; }
        public string? Feedback { get; set; }
    }
    public class CreateQuestionDto
    {
        [Required]
        public Guid TopicId { get; set; }

        [Required]
        public string ContentText { get; set; } = string.Empty;

        public string? MediaUrl { get; set; }

        [Required]
        public QuestionType Type { get; set; }

        [Required]
        public List<CreateAnswerDto> Answers { get; set; } = new();
    }

    public class CreateAnswerDto
    {
        [Required]
        public string ContentText { get; set; } = string.Empty;

        [Required]
        public bool IsCorrect { get; set; }
    }
    public class QuizQuestionDto
    {
        public Guid Id { get; set; }
        public Guid QuizId { get; set; }
        public Guid QuestionId { get; set; }
        public int Points { get; set; }

        // Include full question details
        public QuestionDto? Question { get; set; }

        public DateTime CreatedAt { get; set; }
    }

    public class AddQuestionDto
    {
        public Guid QuestionId { get; set; }
        public int Points { get; set; }
    }
    public class QuestionGradeDto
    {
        public Guid QuestionId { get; set; }
        public double EarnedPoints { get; set; }
        public string? Feedback { get; set; }
    }
    public class GradeSubmissionDto
    {
        public double Score { get; set; }
        public string? Feedback { get; set; }
        public List<QuestionGradeDto>? QuestionGrades { get; set; }
    }
}
