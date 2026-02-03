using AutoMapper;
using LMS.Application.Lecturer;
using LMS.Domain.Entities.Assessment;
using LMS.Domain.Entities.Content;
using LMS.Domain.Entities.Courses;
using LMS.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class LecturerService : ILecturerService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public LecturerService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ==================== DASHBOARD ====================

        public async Task<LecturerDashboardDto> GetDashboardAsync(Guid lecturerId)
        {
            var courses = await _context.Courses
                .Include(c => c.Chapters)
                    .ThenInclude(ch => ch.Contents)
                .Where(c =>
                    !c.IsDeleted &&
                    c.Lecturers.Any(l => l.LecturerId == lecturerId)
                )
                .ToListAsync();

            var totalLessons = courses.SelectMany(c => c.Chapters)
                .SelectMany(ch => ch.Contents)
                .Count(content => content is Lesson);

            var totalQuizzes = courses.SelectMany(c => c.Chapters)
                .SelectMany(ch => ch.Contents)
                .Count(content => content is Quiz);

            var pendingGrading = await _context.QuizSubmissions
                .CountAsync(qs => qs.Status == "Submitted" &&
                    _context.Quizzes.Any(q => q.Chapter.CourseId == courses.Select(c => c.Id).FirstOrDefault()));

            return new LecturerDashboardDto
            {
                TotalCourses = courses.Count,
                TotalStudents = courses.Sum(c => c.Students.Count),
                TotalLessons = totalLessons,
                TotalQuizzes = totalQuizzes,
                PendingGrading = pendingGrading,
                RecentCourses = _mapper.Map<List<CourseDto>>(courses.Take(5).ToList())
            };
        }
        public async Task<List<LessonDto>> GetLessonsByChapterAsync(Guid chapterId)
        {
            var lessons = await _context.Lessons
                .Where(l => l.ChapterId == chapterId && !l.IsDeleted)
                .OrderBy(l => l.OrderIndex)
                .ToListAsync();

            var lessonIds = lessons.Select(l => l.Id).ToList();

            var progressStats = await _context.LessonProgresses
                .Where(lp => lessonIds.Contains(lp.LessonId))
                .GroupBy(lp => lp.LessonId)
                .Select(g => new
                {
                    LessonId = g.Key,
                    TotalViews = g.Count(),
                    Completed = g.Count(x => x.IsCompleted)
                })
                .ToListAsync();

            var result = _mapper.Map<List<LessonDto>>(lessons);

            foreach (var dto in result)
            {
                var stat = progressStats.FirstOrDefault(s => s.LessonId == dto.Id);
                dto.TotalViews = stat?.TotalViews ?? 0;
                dto.CompletedStudents = stat?.Completed ?? 0;
                dto.CompletionRate = dto.TotalViews == 0
                    ? 0
                    : dto.CompletedStudents * 100.0 / dto.TotalViews;
            }

            return result;
        }
        public async Task DeleteChapterAsync(Guid chapterId)
        {
            var chapter = await _context.Chapters
                .Include(ch => ch.Contents)
                .FirstOrDefaultAsync(ch => ch.Id == chapterId);

            if (chapter == null)
                throw new Exception("Không tìm thấy chương");

            chapter.IsDeleted = true;
            chapter.UpdatedAt = DateTime.UtcNow;

            foreach (var content in chapter.Contents)
            {
                content.IsDeleted = true;
                content.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }
        public async Task<ChapterDto> GetChapterByIdAsync(Guid chapterId)
        {
            var chapter = await _context.Chapters
                .Include(ch => ch.Contents)
                .FirstOrDefaultAsync(ch => ch.Id == chapterId && !ch.IsDeleted);

            if (chapter == null)
                throw new Exception("Không tìm thấy chương");

            var dto = _mapper.Map<ChapterDto>(chapter);

            dto.TotalLessons = chapter.Contents.Count(c => c is Lesson);
            dto.TotalQuizzes = chapter.Contents.Count(c => c is Quiz);

            return dto;
        }
        public async Task<CourseReportDto> GetCourseReportAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                    .ThenInclude(ch => ch.Contents)
                .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

            if (course == null)
                throw new Exception("Không tìm thấy khóa học");

            var lessons = course.Chapters
                .SelectMany(ch => ch.Contents)
                .OfType<Lesson>()
                .ToList();

            var quizzes = course.Chapters
                .SelectMany(ch => ch.Contents)
                .OfType<Quiz>()
                .ToList();

            var lessonIds = lessons.Select(l => l.Id).ToList();
            var quizIds = quizzes.Select(q => q.Id).ToList();

            // ✅ FIX LỖI 1: khai báo lessonProgresses
            var lessonProgresses = await _context.LessonProgresses
                .Where(lp => lessonIds.Contains(lp.LessonId) && lp.IsCompleted)
                .ToListAsync();

            var quizSubmissions = await _context.QuizSubmissions
                .Where(qs => quizIds.Contains(qs.QuizId) && qs.Status == "Graded")
                .ToListAsync();

            var totalContents = lessons.Count + quizzes.Count;

            // Group theo sinh viên
            var completedLessonsByStudent = lessonProgresses
                .GroupBy(lp => lp.UserId)
                .ToDictionary(g => g.Key, g => g.Count());

            var averageQuizScoreByStudent = quizSubmissions
                .GroupBy(qs => qs.StudentId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Average(x => x.Score)
                );

            // ✅ FIX LỖI 2 & 3: KHÔNG dùng Progress / AverageScore
            var studentsAtRisk = course.Students.Count(cs =>
            {
                var studentId = cs.StudentId;

                var completedLessons = completedLessonsByStudent
                    .GetValueOrDefault(studentId, 0);

                var progress = totalContents == 0
                    ? 0
                    : completedLessons * 100.0 / totalContents;

                var avgScore = averageQuizScoreByStudent
                    .GetValueOrDefault(studentId, 0);

                return progress < 50 || avgScore < 5;
            });

            return new CourseReportDto
            {
                CourseId = course.Id,
                CourseName = course.Name,
                CourseCode = course.CourseCode,

                TotalStudents = course.Students.Count,
                TotalLessons = lessons.Count,
                TotalQuizzes = quizzes.Count,
                TotalChapters = course.Chapters.Count,

                AverageQuizScore = quizSubmissions.Count == 0
                    ? 0
                    : quizSubmissions.Average(q => q.Score),

                CompletionRate = totalContents == 0
                    ? 0
                    : quizSubmissions.Count * 100.0 / totalContents,

                AverageProgress = course.Students.Count == 0
                    ? 0
                    : completedLessonsByStudent.Values.Sum() * 100.0 /
                      (course.Students.Count * totalContents),

                StudentsAtRisk = studentsAtRisk
            };
        }
        private IQueryable<Course> LecturerCourseQuery(Guid lecturerId)
        {
            return _context.Courses
                .Include(c => c.Lecturers)
                .Where(c =>
                    !c.IsDeleted &&
                    c.Lecturers.Any(l => l.LecturerId == lecturerId));
        }
        public async Task<List<ChapterDto>> GetChaptersByCourseAsync(Guid courseId)
        {
            var chapters = await _context.Chapters
                .Include(ch => ch.Contents)
                .Where(ch => ch.CourseId == courseId && !ch.IsDeleted)
                .OrderBy(ch => ch.OrderIndex)
                .ToListAsync();

            var result = _mapper.Map<List<ChapterDto>>(chapters);

            foreach (var dto in result)
            {
                var ch = chapters.First(c => c.Id == dto.Id);
                dto.TotalLessons = ch.Contents.Count(c => c is Lesson);
                dto.TotalQuizzes = ch.Contents.Count(c => c is Quiz);
            }

            return result;
        }

        public async Task<ChapterDto> CreateChapterAsync(CreateChapterDto dto)
        {
            var chapter = _mapper.Map<Chapter>(dto);

            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();

            return _mapper.Map<ChapterDto>(chapter);
        }

        public async Task<ChapterDto> UpdateChapterAsync(Guid chapterId, UpdateChapterDto dto)
        {
            var chapter = await _context.Chapters.FindAsync(chapterId)
                ?? throw new Exception("Không tìm thấy chương");

            _mapper.Map(dto, chapter);
            chapter.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return _mapper.Map<ChapterDto>(chapter);
        }

        public async Task ReorderChaptersAsync(Guid courseId, List<Guid> chapterIds)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            var chapters = await _context.Chapters
                .Where(c => c.CourseId == courseId && chapterIds.Contains(c.Id))
                .ToListAsync();

            for (int i = 0; i < chapterIds.Count; i++)
            {
                var ch = chapters.First(c => c.Id == chapterIds[i]);
                ch.OrderIndex = i + 1;
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }

        public async Task<LessonDto> CreateLessonAsync(CreateLessonDto dto)
        {
            var lesson = _mapper.Map<Lesson>(dto);

            _context.Add(lesson);
            await _context.SaveChangesAsync();

            return _mapper.Map<LessonDto>(lesson);
        }

        public async Task<LessonDto> PublishLessonAsync(Guid lessonId, bool isPublished)
        {
            var lesson = await _context.Set<Lesson>()
                .FindAsync(lessonId)
                ?? throw new Exception("Không tìm thấy bài học");

            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return _mapper.Map<LessonDto>(lesson);
        }

        public async Task<QuizDto> CreateQuizAsync(CreateQuizDto dto)
        {
            var quiz = _mapper.Map<Quiz>(dto);
            _context.Add(quiz);
            await _context.SaveChangesAsync();

            return _mapper.Map<QuizDto>(quiz);
        }

        public async Task AddQuestionsToQuizAsync(Guid quizId, List<AddQuestionDto> questions)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            foreach (var q in questions)
            {
                _context.QuizQuestions.Add(new QuizQuestion
                {
                    QuizId = quizId,
                    QuestionId = q.QuestionId,
                    Points = q.Points
                });
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }

        public async Task<PaginatedResponse<StudentDto>> GetStudentsByCourseAsync(
    Guid courseId, PaginationDto pagination)
        {
            var query = _context.CourseStudents
                .Include(cs => cs.Student)
                .Where(cs => cs.CourseId == courseId);

            var total = await query.CountAsync();

            var data = await query
                .Skip((pagination.Page - 1) * pagination.Limit)
                .Take(pagination.Limit)
                .ToListAsync();

            return new PaginatedResponse<StudentDto>
            {
                Data = _mapper.Map<List<StudentDto>>(data),
                Total = total,
                Page = pagination.Page,
                Limit = pagination.Limit,
                TotalPages = (int)Math.Ceiling(total / (double)pagination.Limit)
            };
        }

        public async Task<StudentProgressDto> GetStudentProgressAsync(Guid courseId, Guid studentId)
        {
            var lessons = await _context.Chapters
                .Where(c => c.CourseId == courseId)
                .SelectMany(c => c.Contents)
                .OfType<Lesson>()
                .ToListAsync();

            var completedLessons = await _context.LessonProgresses
                .CountAsync(lp => lp.UserId == studentId && lp.IsCompleted);

            var quizzes = await _context.Quizzes
                .Where(q => q.Chapter.CourseId == courseId)
                .ToListAsync();

            var completedQuizzes = await _context.QuizSubmissions
                .CountAsync(qs =>
                    qs.StudentId == studentId &&
                    qs.Status == "Graded" &&
                    quizzes.Select(q => q.Id).Contains(qs.QuizId));

            return new StudentProgressDto
            {
                StudentId = studentId,
                TotalLessons = lessons.Count,
                CompletedLessons = completedLessons,
                LessonCompletionRate = lessons.Count == 0 ? 0 : completedLessons * 100.0 / lessons.Count,
                TotalQuizzes = quizzes.Count,
                CompletedQuizzes = completedQuizzes,
                QuizCompletionRate = quizzes.Count == 0 ? 0 : completedQuizzes * 100.0 / quizzes.Count,
                ProgressPercentage =
                    (completedLessons + completedQuizzes) * 100.0 /
                    Math.Max(1, lessons.Count + quizzes.Count)
            };
        }

        public async Task<QuizDto> GetQuizByIdAsync(Guid quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                    .ThenInclude(qq => qq.Question)
                        .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);

            if (quiz == null)
                throw new Exception("Không tìm thấy bài kiểm tra");

            var dto = _mapper.Map<QuizDto>(quiz);

            dto.TotalQuestions = quiz.Questions.Count;

            var submissions = await _context.QuizSubmissions
                .Where(s => s.QuizId == quizId)
                .ToListAsync();

            dto.TotalSubmissions = submissions.Count;
            dto.CompletedSubmissions = submissions.Count(s => s.Status == "Graded");
            dto.AverageScore = submissions.Count == 0
                ? 0
                : submissions.Average(s => s.Score);

            dto.PassedCount = submissions.Count(s => s.Score >= dto.PassingScore);
            dto.FailedCount = dto.CompletedSubmissions - dto.PassedCount;

            return dto;
        }

        public async Task<List<QuizDto>> GetQuizzesByChapterAsync(Guid chapterId)
        {
            var quizzes = await _context.Quizzes
                .Where(q => q.ChapterId == chapterId && !q.IsDeleted)
                .OrderBy(q => q.OrderIndex)
                .ToListAsync();

            return _mapper.Map<List<QuizDto>>(quizzes);
        }

        public async Task<List<QuizDto>> GetQuizzesByCourseAsync(Guid courseId)
        {
            var quizzes = await _context.Quizzes
                .Where(q => q.Chapter.CourseId == courseId && !q.IsDeleted)
                .OrderBy(q => q.Chapter.OrderIndex)
                .ThenBy(q => q.OrderIndex)
                .ToListAsync();

            return _mapper.Map<List<QuizDto>>(quizzes);
        }

        public async Task<QuizDto> UpdateQuizAsync(Guid quizId, UpdateQuizDto dto)
        {
            var quiz = await _context.Quizzes.FindAsync(quizId)
                ?? throw new Exception("Không tìm thấy bài kiểm tra");

            _mapper.Map(dto, quiz);
            quiz.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetQuizByIdAsync(quizId);
        }

        public async Task DeleteQuizAsync(Guid quizId)
        {
            var quiz = await _context.Quizzes.FindAsync(quizId)
                ?? throw new Exception("Không tìm thấy bài kiểm tra");

            quiz.IsDeleted = true;
            quiz.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task<List<QuizSubmissionDto>> GetQuizSubmissionsAsync(Guid quizId)
        {
            var submissions = await _context.QuizSubmissions
                .Include(s => s.Student)
                .Where(s => s.QuizId == quizId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<QuizSubmissionDto>>(submissions);
        }

        public async Task<QuizSubmissionDto> GetSubmissionByIdAsync(Guid submissionId)
        {
            var submission = await _context.QuizSubmissions
                .Include(s => s.Student)
                .Include(s => s.Quiz)
                    .ThenInclude(q => q.Questions)
                        .ThenInclude(qq => qq.Question)
                .Include(s => s.Snapshots)
                .FirstOrDefaultAsync(s => s.Id == submissionId);

            if (submission == null)
                throw new Exception("Không tìm thấy bài nộp");

            return _mapper.Map<QuizSubmissionDto>(submission);
        }

        public async Task GradeSubmissionAsync(Guid submissionId, GradeSubmissionDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            var submission = await _context.QuizSubmissions
                .FirstOrDefaultAsync(s => s.Id == submissionId)
                ?? throw new Exception("Không tìm thấy bài nộp");

            submission.Score = dto.Score;
            submission.Status = "Graded";
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }

        public async Task<string> UploadFileAsync(IFormFile file, string type)
        {
            if (file == null || file.Length == 0)
                throw new Exception("File không hợp lệ");

            var folder = Path.Combine("uploads", type.ToLower());
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var ext = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{ext}";
            var path = Path.Combine(folder, fileName);

            using var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);

            return $"/{folder.Replace("\\", "/")}/{fileName}";
        }

        //==================== COURSES ====================

        public async Task<PaginatedResponse<CourseDto>> GetCoursesAsync(Guid lecturerId, CourseFilterDto filter)
        {
            var query = _context.Courses
                .Include(c => c.Semester)
                .Include(c => c.AcademicYear)
                .Include(c => c.Major)
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                .Include(c => c.Chapters)
                .ThenInclude(ch => ch.Contents)
            .Include(c => c.Lecturers)
            .Where(c =>
                !c.IsDeleted &&
                c.Lecturers.Any(cl => cl.LecturerId == lecturerId));

            // Apply filters
            if (filter.SemesterId.HasValue)
                query = query.Where(c => c.SemesterId == filter.SemesterId.Value);

            if (filter.AcademicYearId.HasValue)
                query = query.Where(c => c.AcademicYearId == filter.AcademicYearId.Value);

            if (!string.IsNullOrEmpty(filter.Search))
                query = query.Where(c => c.Name.Contains(filter.Search) || c.CourseCode.Contains(filter.Search));

            var total = await query.CountAsync();

            // Apply pagination
            var courses = await query
                .Skip((filter.Page - 1) * filter.Limit)
                .Take(filter.Limit)
                .ToListAsync();

            var courseDtos = _mapper.Map<List<CourseDto>>(courses);

            // Calculate statistics for each course
            foreach (var dto in courseDtos)
            {
                var course = courses.First(c => c.Id == dto.Id);

                dto.TotalLessons = course.Chapters.SelectMany(ch => ch.Contents).Count(c => c is Lesson);
                dto.TotalQuizzes = course.Chapters.SelectMany(ch => ch.Contents).Count(c => c is Quiz);

                // Calculate average progress
                var studentProgresses = await CalculateCourseAverageProgressAsync(course.Id);
                dto.AverageProgress = studentProgresses;
            }

            return new PaginatedResponse<CourseDto>
            {
                Data = courseDtos,
                Total = total,
                Page = filter.Page,
                Limit = filter.Limit,
                TotalPages = (int)Math.Ceiling(total / (double)filter.Limit)
            };
        }

        public async Task<CourseDto> GetCourseByIdAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Semester)
                .Include(c => c.AcademicYear)
                .Include(c => c.Major)
                .Include(c => c.Lecturers)
                .ThenInclude(cl => cl.Lecturer)
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                    .ThenInclude(ch => ch.Contents)
                .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

            if (course == null)
                throw new Exception("Không tìm thấy khóa học");

            var dto = _mapper.Map<CourseDto>(course);

            // Calculate statistics
            dto.TotalLessons = course.Chapters.SelectMany(ch => ch.Contents).Count(c => c is Lesson);
            dto.TotalQuizzes = course.Chapters.SelectMany(ch => ch.Contents).Count(c => c is Quiz);
            dto.AverageProgress = await CalculateCourseAverageProgressAsync(courseId);

            return dto;
        }

        public async Task<CourseDto> CreateCourseAsync(Guid lecturerId, CreateCourseDto dto)
        {
            // 1. Tạo course
            var course = _mapper.Map<Course>(dto);

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            // 2. Gán giảng viên qua bảng trung gian
            var courseLecturer = new CourseLecturer
            {
                CourseId = course.Id,
                LecturerId = lecturerId
            };

            _context.CourseLecturers.Add(courseLecturer);
            await _context.SaveChangesAsync();

            return await GetCourseByIdAsync(course.Id);
        }

        public async Task<CourseDto> UpdateCourseAsync(Guid courseId, UpdateCourseDto dto)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                throw new Exception("Không tìm thấy khóa học");

            _mapper.Map(dto, course);
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCourseByIdAsync(courseId);
        }

        public async Task DeleteCourseAsync(Guid courseId)
        {
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
                throw new Exception("Không tìm thấy khóa học");

            course.IsDeleted = true;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        // ==================== HELPERS ====================

        private async Task<double> CalculateCourseAverageProgressAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                    .ThenInclude(ch => ch.Contents)
                .FirstOrDefaultAsync(c => c.Id == courseId);

            if (course == null || course.Students.Count == 0)
                return 0;

            var totalContent = course.Chapters.SelectMany(ch => ch.Contents).Count();
            if (totalContent == 0)
                return 0;

            double totalProgress = 0;

            foreach (var enrollment in course.Students)
            {
                var completedLessons = await _context.LessonProgresses
                    .CountAsync(lp => lp.UserId == enrollment.StudentId && lp.IsCompleted);

                var completedQuizzes = await _context.QuizSubmissions
                    .CountAsync(qs => qs.StudentId == enrollment.StudentId && qs.Status == "Graded");

                var studentProgress = ((completedLessons + completedQuizzes) / (double)totalContent) * 100;
                totalProgress += studentProgress;
            }

            return totalProgress / course.Students.Count;
        }

        public async Task<LessonDto> GetLessonByIdAsync(Guid lessonId)
        {
            var lesson = await _context.Lessons
                .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);

            if (lesson == null)
                throw new Exception("Không tìm thấy bài học");

            var dto = _mapper.Map<LessonDto>(lesson);

            // Statistics
            dto.TotalViews = await _context.LessonProgresses
                .CountAsync(lp => lp.LessonId == lessonId);

            dto.CompletedStudents = await _context.LessonProgresses
                .CountAsync(lp => lp.LessonId == lessonId && lp.IsCompleted);

            dto.CompletionRate = dto.TotalViews == 0
                ? 0
                : dto.CompletedStudents * 100.0 / dto.TotalViews;

            return dto;
        }

        public async Task<LessonDto> UpdateLessonAsync(Guid lessonId, UpdateLessonDto dto)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null || lesson.IsDeleted)
                throw new Exception("Không tìm thấy bài học");

            _mapper.Map(dto, lesson);
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetLessonByIdAsync(lessonId);
        }

        public async Task DeleteLessonAsync(Guid lessonId)
        {
            var lesson = await _context.Lessons.FindAsync(lessonId);
            if (lesson == null)
                throw new Exception("Không tìm thấy bài học");

            lesson.IsDeleted = true;
            lesson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<List<QuestionTopicDto>> GetQuestionTopicsAsync(Guid lecturerId)
        {
            var topics = await _context.QuestionTopics
                .Where(t => t.LecturerId == lecturerId && !t.IsDeleted)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<QuestionTopicDto>>(topics);
        }

        public async Task<QuestionTopicDto> CreateQuestionTopicAsync(
    Guid lecturerId, CreateQuestionTopicDto dto)
        {
            var topic = _mapper.Map<QuestionTopic>(dto);
            topic.LecturerId = lecturerId;

            _context.QuestionTopics.Add(topic);
            await _context.SaveChangesAsync();

            return _mapper.Map<QuestionTopicDto>(topic);
        }

        public async Task DeleteQuestionTopicAsync(Guid topicId)
        {
            var topic = await _context.QuestionTopics.FindAsync(topicId)
                ?? throw new Exception("Không tìm thấy chủ đề câu hỏi");

            topic.IsDeleted = true;
            topic.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<List<QuestionDto>> GetQuestionsByTopicAsync(Guid topicId)
        {
            var questions = await _context.Questions
                .Include(q => q.Answers)
                .Where(q => q.TopicId == topicId && !q.IsDeleted)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<QuestionDto>>(questions);
        }
        public async Task<List<QuizQuestionDto>> GetQuestionsByQuizAsync(Guid quizId)
        {
            var quizQuestions = await _context.QuizQuestions
                .Include(qq => qq.Question)
                    .ThenInclude(q => q.Answers)
                .Where(qq => qq.QuizId == quizId)
                .ToListAsync();

            return _mapper.Map<List<QuizQuestionDto>>(quizQuestions);
        }
        public async Task<QuestionDto> CreateQuestionAsync(CreateQuestionDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            var question = new Question
            {
                TopicId = dto.TopicId,
                ContentText = dto.ContentText,
                MediaUrl = dto.MediaUrl,
                Type = dto.Type
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            foreach (var ans in dto.Answers)
            {
                _context.Answers.Add(new Answer
                {
                    QuestionId = question.Id,
                    ContentText = ans.ContentText,
                    IsCorrect = ans.IsCorrect
                });
            }

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return _mapper.Map<QuestionDto>(question);
        }
        public async Task EnrollStudentAsync(Guid courseId, string studentEmail)
        {
            var student = await _context.AppUsers
                .FirstOrDefaultAsync(u => u.Email == studentEmail);

            if (student == null)
                throw new Exception("Không tìm thấy sinh viên");

            var exists = await _context.CourseStudents
                .AnyAsync(cs => cs.CourseId == courseId && cs.StudentId == student.Id);

            if (exists)
                throw new Exception("Sinh viên đã được ghi danh");

            _context.CourseStudents.Add(new CourseStudent
            {
                CourseId = courseId,
                StudentId = student.Id,
                Source = "Manual"
            });

            await _context.SaveChangesAsync();
        }
        public async Task RemoveStudentAsync(Guid courseId, Guid studentId)
        {
            var enrollment = await _context.CourseStudents
                .FirstOrDefaultAsync(cs =>
                    cs.CourseId == courseId &&
                    cs.StudentId == studentId);

            if (enrollment == null)
                throw new Exception("Sinh viên chưa được ghi danh");

            _context.CourseStudents.Remove(enrollment);
            await _context.SaveChangesAsync();
        }

    }
}
