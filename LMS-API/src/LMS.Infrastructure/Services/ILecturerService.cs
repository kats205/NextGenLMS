using LMS.Application.Lecturer;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public interface ILecturerService
    {
        // Dashboard
        Task<LecturerDashboardDto> GetDashboardAsync(Guid lecturerId);

        // Courses
        Task<PaginatedResponse<CourseDto>> GetCoursesAsync(Guid lecturerId, CourseFilterDto filter);
        Task<CourseDto> GetCourseByIdAsync(Guid courseId);
        Task<CourseDto> CreateCourseAsync(Guid lecturerId, CreateCourseDto dto);
        Task<CourseDto> UpdateCourseAsync(Guid courseId, UpdateCourseDto dto);
        Task DeleteCourseAsync(Guid courseId);
        Task<CourseReportDto> GetCourseReportAsync(Guid courseId);

        // Chapters
        Task<List<ChapterDto>> GetChaptersByCourseAsync(Guid courseId);
        Task<ChapterDto> GetChapterByIdAsync(Guid chapterId);
        Task<ChapterDto> CreateChapterAsync(CreateChapterDto dto);
        Task<ChapterDto> UpdateChapterAsync(Guid chapterId, UpdateChapterDto dto);
        Task DeleteChapterAsync(Guid chapterId);
        Task ReorderChaptersAsync(Guid courseId, List<Guid> chapterIds);

        // Lessons
        Task<List<LessonDto>> GetLessonsByChapterAsync(Guid chapterId);
        Task<LessonDto> GetLessonByIdAsync(Guid lessonId);
        Task<LessonDto> CreateLessonAsync(CreateLessonDto dto);
        Task<LessonDto> UpdateLessonAsync(Guid lessonId, UpdateLessonDto dto);
        Task DeleteLessonAsync(Guid lessonId);
        Task<LessonDto> PublishLessonAsync(Guid lessonId, bool isPublished);

        // Quizzes
        Task<List<QuizDto>> GetQuizzesByChapterAsync(Guid chapterId);
        Task<List<QuizDto>> GetQuizzesByCourseAsync(Guid courseId);
        Task<QuizDto> GetQuizByIdAsync(Guid quizId);
        Task<QuizDto> CreateQuizAsync(CreateQuizDto dto);
        Task<QuizDto> UpdateQuizAsync(Guid quizId, UpdateQuizDto dto);
        Task DeleteQuizAsync(Guid quizId);

        // Questions
        Task<List<QuestionTopicDto>> GetQuestionTopicsAsync(Guid lecturerId);
        Task<QuestionTopicDto> CreateQuestionTopicAsync(Guid lecturerId, CreateQuestionTopicDto dto);
        Task DeleteQuestionTopicAsync(Guid topicId);
        Task<List<QuestionDto>> GetQuestionsByTopicAsync(Guid topicId);
        Task<List<QuizQuestionDto>> GetQuestionsByQuizAsync(Guid quizId);
        Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto dto);
        Task AddQuestionsToQuizAsync(Guid quizId, List<AddQuestionDto> questions);

        // Students
        Task<PaginatedResponse<StudentDto>> GetStudentsByCourseAsync(Guid courseId, PaginationDto pagination);
        Task<StudentProgressDto> GetStudentProgressAsync(Guid courseId, Guid studentId);
        Task EnrollStudentAsync(Guid courseId, string studentEmail);
        Task RemoveStudentAsync(Guid courseId, Guid studentId);

        // Files
        Task<string> UploadFileAsync(IFormFile file, string type);

        Task<List<QuizSubmissionDto>> GetQuizSubmissionsAsync(Guid quizId);
        Task<QuizSubmissionDto> GetSubmissionByIdAsync(Guid submissionId);
        Task GradeSubmissionAsync(Guid submissionId, GradeSubmissionDto dto);
    }
}
