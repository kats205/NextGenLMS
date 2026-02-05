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

            CreateMap<CreateCourseDtoLecturer, Course>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));

            CreateMap<UpdateCourseDtoLecturer, Course>()
                .ForMember(dest => dest.Name, opt => opt.Condition(src => src.Name != null))
                .ForMember(dest => dest.Description, opt => opt.Condition(src => src.Description != null))
                .ForMember(dest => dest.ThumbnailUrl, opt => opt.Condition(src => src.ThumbnailUrl != null))
                .ForMember(dest => dest.CourseCode, opt => opt.Condition(src => src.CourseCode != null))
                .ForMember(dest => dest.SemesterId, opt => opt.Condition(src => src.SemesterId.HasValue))
                .ForMember(dest => dest.AcademicYearId, opt => opt.Condition(src => src.AcademicYearId.HasValue))
                .ForMember(dest => dest.MajorId, opt => opt.Condition(src => src.MajorId.HasValue))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Chapter mappings
            CreateMap<Chapter, ChapterDto>()
                .ForMember(dest => dest.TotalLessons, opt => opt.MapFrom(src => src.Contents.Count(c => c is Lesson)))
                .ForMember(dest => dest.TotalQuizzes, opt => opt.MapFrom(src => src.Contents.Count(c => c is Quiz)));
            
            CreateMap<CreateChapterDto, Chapter>();
            CreateMap<UpdateChapterDto, Chapter>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Lesson mappings
            CreateMap<Lesson, LessonDto>()
                .IncludeBase<CourseContent, CourseContentDto>()
                .ForMember(dest => dest.ContentType, opt => opt.MapFrom(src => "Lesson"))
                .ForMember(dest => dest.TotalViews, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedStudents, opt => opt.Ignore())
                .ForMember(dest => dest.CompletionRate, opt => opt.Ignore());
            
            CreateMap<CreateLessonDto, Lesson>()
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));
            CreateMap<UpdateLessonDto, Lesson>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Quiz mappings
            CreateMap<Quiz, QuizDto>()
                .IncludeBase<CourseContent, CourseContentDto>()
                .ForMember(dest => dest.ContentType, opt => opt.MapFrom(src => "Quiz"))
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.OpenTime))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.CloseTime))
                .ForMember(dest => dest.TimeLimit, opt => opt.MapFrom(src => src.DurationMinutes))
                .ForMember(dest => dest.IsRandomQuestion, opt => opt.MapFrom(src => src.ShuffleQuestions))
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
            CreateMap<CreateQuestionTopicDto, QuestionTopic>();
            CreateMap<CreateQuizDto, Quiz>()
                .ForMember(dest => dest.OpenTime, opt => opt.MapFrom(src => src.StartDate))
                .ForMember(dest => dest.CloseTime, opt => opt.MapFrom(src => src.EndDate))
                .ForMember(dest => dest.DurationMinutes, opt => opt.MapFrom(src => src.TimeLimit))
                .ForMember(dest => dest.ShuffleQuestions, opt => opt.MapFrom(src => src.IsRandomQuestion));

            CreateMap<UpdateQuizDto, Quiz>()
                 .ForMember(dest => dest.OpenTime, opt => opt.MapFrom(src => src.StartDate))
                 .ForMember(dest => dest.CloseTime, opt => opt.MapFrom(src => src.EndDate))
                 .ForMember(dest => dest.DurationMinutes, opt => opt.MapFrom(src => src.TimeLimit))
                 .ForMember(dest => dest.ShuffleQuestions, opt => opt.MapFrom(src => src.IsRandomQuestion))
                 .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<CreateQuestionDto, Question>();
            CreateMap<CreateAnswerDto, Answer>();
            CreateMap<CourseContent, CourseContentDto>();
        }
    }
}
