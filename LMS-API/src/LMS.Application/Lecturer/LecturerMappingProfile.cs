using AutoMapper;
using LMS.Domain.Entities.Assessment;
using LMS.Domain.Entities.Content;
using LMS.Domain.Entities.Courses;
using LMS.Domain.Entities.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LMS.Application.Lecturer
{
    public class LecturerMappingProfile : Profile
    {
        public LecturerMappingProfile()
        {
            // Course mappings
            CreateMap<Course, CourseDto>()
                .ForMember(dest => dest.SemesterName, opt => opt.MapFrom(src => src.Semester != null ? src.Semester.Name : null))
                .ForMember(dest => dest.AcademicYearName, opt => opt.MapFrom(src => src.AcademicYear != null ? src.AcademicYear.Name : null))
                .ForMember(dest => dest.MajorName, opt => opt.MapFrom(src => src.Major != null ? src.Major.Name : null))
                //.ForMember(dest => dest.LecturerName, opt => opt.MapFrom(src => src.Lecturer != null ? src.Lecturer.FullName : null))
                .ForMember(dest => dest.TotalStudents, opt => opt.MapFrom(src => src.Students.Count))
                .ForMember(dest => dest.TotalChapters, opt => opt.MapFrom(src => src.Chapters.Count))
                .ForMember(dest => dest.TotalLessons, opt => opt.Ignore()) // Compute separately
                .ForMember(dest => dest.TotalQuizzes, opt => opt.Ignore()) // Compute separately
                .ForMember(dest => dest.AverageProgress, opt => opt.Ignore()); // Compute separately

            // Chapter mappings
            CreateMap<Chapter, ChapterDto>()
                .ForMember(dest => dest.TotalLessons, opt => opt.MapFrom(src => src.Contents.Count(c => c is Lesson)))
                .ForMember(dest => dest.TotalQuizzes, opt => opt.MapFrom(src => src.Contents.Count(c => c is Quiz)));

            // Lesson mappings
            CreateMap<Lesson, LessonDto>()
                .IncludeBase<CourseContent, CourseContentDto>()
                .ForMember(dest => dest.ContentType, opt => opt.MapFrom(src => "Lesson"))
                .ForMember(dest => dest.TotalViews, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedStudents, opt => opt.Ignore())
                .ForMember(dest => dest.CompletionRate, opt => opt.Ignore());

            // Quiz mappings
            CreateMap<Quiz, QuizDto>()
                .IncludeBase<CourseContent, CourseContentDto>()
                .ForMember(dest => dest.ContentType, opt => opt.MapFrom(src => "Quiz"))
                .ForMember(dest => dest.TotalQuestions, opt => opt.Ignore())
                .ForMember(dest => dest.TotalSubmissions, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedSubmissions, opt => opt.Ignore())
                .ForMember(dest => dest.AverageScore, opt => opt.Ignore())
                .ForMember(dest => dest.PassedCount, opt => opt.Ignore())
                .ForMember(dest => dest.FailedCount, opt => opt.Ignore());

            // Question mappings
            CreateMap<QuestionTopic, QuestionTopicDto>()
                .ForMember(dest => dest.TotalQuestions, opt => opt.Ignore())
                .ForMember(dest => dest.UsedInQuizzes, opt => opt.Ignore());

            CreateMap<Question, QuestionDto>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type.ToString()))
                //.ForMember(dest => dest.TopicName, opt => opt.MapFrom(src => src.TopicI != null ? src.Topic.Name : null))
                .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
                .ForMember(dest => dest.Difficulty, opt => opt.Ignore())
                .ForMember(dest => dest.Tags, opt => opt.Ignore());

            CreateMap<Answer, AnswerDto>();

            CreateMap<QuizQuestion, QuizQuestionDto>();

            // Student mappings
            CreateMap<AppUser, StudentDto>()
                .ForMember(dest => dest.EnrolledDate, opt => opt.Ignore())
                .ForMember(dest => dest.Progress, opt => opt.Ignore())
                .ForMember(dest => dest.AverageScore, opt => opt.Ignore());

            // Quiz Submission mappings
            CreateMap<QuizSubmission, QuizSubmissionDto>()
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => src.Student != null ? src.Student.FullName : ""))
                .ForMember(dest => dest.StudentEmail, opt => opt.MapFrom(src => src.Student != null ? src.Student.Email : ""))
                .ForMember(dest => dest.StudentCode, opt => opt.MapFrom(src => src.Student != null ? src.Student.StudentCode : null))
                .ForMember(dest => dest.QuizTitle, opt => opt.MapFrom(src => src.Quiz != null ? src.Quiz.Title : ""))
                .ForMember(dest => dest.Answers, opt => opt.Ignore());
        }
    }
}
