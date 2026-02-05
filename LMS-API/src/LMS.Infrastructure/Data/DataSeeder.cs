using LMS.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;
using LMS.Domain.Entities.System;
using LMS.Domain.Entities.Courses;
using LMS.Domain.Entities.Content;
using LMS.Domain.Entities.Assessment;
using System;
using System.Collections.Generic;

namespace LMS.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            var now = new DateTime(2026, 2, 2, 0, 0, 0, DateTimeKind.Utc);
            
            // Password: 123456
            // Note: This hash is generated for "123456"
            var passwordHash = BCrypt.Net.BCrypt.HashPassword("123456");

            // =============================================
            // DECLARE VARIABLES (GUIDs cố định)
            // =============================================

            // Role IDs
            var roleAdminId = new Guid("7F6A5FB8-10D6-4B31-9F64-0AE904225071");
            var roleLecturerId = new Guid("DDEB87B1-28F2-4B15-88D5-350CFF603FBA");
            var roleStudentId = new Guid("D06CDE01-4C8B-4F26-AD27-41E8DF3B64E7");

            // Department IDs
            var deptFITId = new Guid("68D2BA61-E3E8-42FE-BD96-542C0FC033C3");
            var deptBusinessId = new Guid("FCDAE90C-0456-46CA-A81E-863ABA3D9030");

            // User IDs
            var adminUserId = new Guid("F2CD183C-ECD7-4297-9237-BD306017E8AA");
            var lecturer01Id = new Guid("50ED565D-C2A9-4B86-81FF-D42C3290D4B8");
            var lecturer02Id = new Guid("CEDFD30B-E83D-4D0D-957B-F669C2703440");
            var student01Id = new Guid("48C6A748-4B43-4EAA-9AA7-A610D3423139");
            var student02Id = new Guid("4D2E259C-6E7F-4BBD-AFB5-1AF74DEFEB67");
            var student03Id = new Guid("13F2C2BE-0347-4E08-A5D5-FCB6E217E0DA");

            // Academic Year & Semester IDs
            var academicYear2024Id = new Guid("07DFA9A6-E5E0-432F-ADA4-FF25EFCCBB16");
            var semesterSpring2024Id = new Guid("A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D");
            var semesterFall2024Id = new Guid("B2C3D4E5-F6A7-4B5C-8D9E-0F1A2B3C4D5E");

            // Major IDs
            var majorSEId = new Guid("C3D4E5F6-A7B8-4C5D-8E9F-0A1B2C3D4E5F");
            var majorAIId = new Guid("D4E5F6A7-B8C9-4D5E-8F9A-0B1C2D3E4F5A");

            // Course IDs
            var courseNET101Id = new Guid("E5F6A7B8-C9D0-4E5F-8A9B-0C1D2E3F4A5B");
            var coursePRN211Id = new Guid("F6A7B8C9-D0E1-4F5A-8B9C-0D1E2F3A4B5C");

            // Chapter IDs
            var chapter1NET101Id = new Guid("A7B8C9D0-E1F2-4A5B-8C9D-0E1F2A3B4C5D");
            var chapter2NET101Id = new Guid("B8C9D0E1-F2A3-4B5C-8D9E-0F1A2B3C4D5E");

            // Content IDs
            var lesson1Id = new Guid("C9D0E1F2-A3B4-4C5D-8E9F-0A1B2C3D4E5F");
            var quiz1Id = new Guid("D0E1F2A3-B4C5-4D5E-8F9A-0B1C2D3E4F5A");
            var announcement1Id = new Guid("E1F2A3B4-C5D6-4E5F-8A9B-0C1D2E3F4A5B");

            // Topic & Question IDs
            var topic1Id = new Guid("F2A3B4C5-D6E7-4F5A-8B9C-0D1E2F3A4B5C");
            var question1Id = new Guid("A3B4C5D6-E7F8-4A5B-8C9D-0E1F2A3B4C5D");
            var question2Id = new Guid("B4C5D6E7-F8A9-4B5C-8D9E-0F1A2B3C4D5E");

            // Answer IDs
            var answer1Q1Id = new Guid("C5D6E7F8-A9B0-4C5D-8E9F-0A1B2C3D4E5F");
            var answer2Q1Id = new Guid("D6E7F8A9-B0C1-4D5E-8F9A-0B1C2D3E4F5A");
            var answer3Q1Id = new Guid("E7F8A9B0-C1D2-4E5F-8A9B-0C1D2E3F4A5B");
            var answer4Q1Id = new Guid("F8A9B0C1-D2E3-4F5A-8B9C-0D1E2F3A4B5C");
            var answer1Q2Id = new Guid("A9B0C1D2-E3F4-4A5B-8C9D-0E1F2A3B4C5D");
            var answer2Q2Id = new Guid("B0C1D2E3-F4A5-4B5C-8D9E-0F1A2B3C4D5E");

            // =============================================
            // 1. Roles
            // =============================================
            modelBuilder.Entity<AppRole>().HasData(
                new AppRole { Id = roleAdminId, RoleName = "Admin", Description = "Quản trị viên hệ thống - Có toàn quyền quản lý", CreatedAt = now, IsDeleted = false },
                new AppRole { Id = roleLecturerId, RoleName = "Lecturer", Description = "Giảng viên - Quản lý khóa học và sinh viên", CreatedAt = now, IsDeleted = false },
                new AppRole { Id = roleStudentId, RoleName = "Student", Description = "Sinh viên - Học tập và làm bài thi", CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 2. Departments
            // =============================================
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = deptFITId, Name = "Khoa Công nghệ Thông tin", Code = "FIT", CreatedAt = now, IsDeleted = false },
                new Department { Id = deptBusinessId, Name = "Khoa Quản trị Kinh doanh", Code = "BUS", CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 3. Academic Years
            // =============================================
            modelBuilder.Entity<AcademicYear>().HasData(
                new AcademicYear { Id = academicYear2024Id, Name = "2024-2025", StartDate = new DateTime(2024, 9, 1), EndDate = new DateTime(2025, 8, 31, 23, 59, 59), CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 4. Semesters
            // =============================================
            modelBuilder.Entity<Semester>().HasData(
                new Semester { Id = semesterSpring2024Id, Name = "Spring 2024", CreatedAt = now, IsDeleted = false },
                new Semester { Id = semesterFall2024Id, Name = "Fall 2024", CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 5. Majors
            // =============================================
            modelBuilder.Entity<Major>().HasData(
                new Major { Id = majorSEId, Name = "Software Engineering", DepartmentId = deptFITId, CreatedAt = now, IsDeleted = false },
                new Major { Id = majorAIId, Name = "Artificial Intelligence", DepartmentId = deptFITId, CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 6. Users
            // =============================================
            modelBuilder.Entity<AppUser>().HasData(
                new AppUser
                {
                    Id = adminUserId,
                    Email = "admintest@gmail.com",
                    PasswordHash = passwordHash,
                    FullName = "Nguyễn Văn Admin",
                    Phone = "0901234567",
                    Bio = "Quản trị viên hệ thống LMS",
                    DateOfBirth = new DateTime(1985, 1, 1),
                    MustChangePassword = true,
                    Status = "Active",
                    IsActive = true,
                    RoleId = roleAdminId,
                    CreatedAt = now,
                    IsDeleted = false
                },
                new AppUser
                {
                    Id = lecturer01Id,
                    Email = "gv01test@gmail.com",
                    PasswordHash = passwordHash,
                    FullName = "Trần Thị Minh",
                    Phone = "0912345678",
                    Bio = "Giảng viên Lập trình Web",
                    TeacherCode = "GV001",
                    DateOfBirth = new DateTime(1980, 5, 15),
                    MustChangePassword = true,
                    Status = "Active",
                    IsActive = true,
                    RoleId = roleLecturerId,
                    DepartmentId = deptFITId,
                    CreatedAt = now,
                    IsDeleted = false
                },
                new AppUser
                {
                    Id = lecturer02Id,
                    Email = "gv02test@gmail.com",
                    PasswordHash = passwordHash,
                    FullName = "Lê Văn Hùng",
                    Phone = "0923456789",
                    Bio = "Giảng viên Cơ sở dữ liệu",
                    TeacherCode = "GV002",
                    DateOfBirth = new DateTime(1982, 8, 20),
                    MustChangePassword = true,
                    Status = "Active",
                    IsActive = true,
                    RoleId = roleLecturerId,
                    DepartmentId = deptFITId,
                    CreatedAt = now,
                    IsDeleted = false
                },
                new AppUser
                {
                    Id = student01Id,
                    Email = "sv01test@gmail.com",
                    PasswordHash = passwordHash,
                    FullName = "Phạm Văn An",
                    Phone = "0934567890",
                    Bio = "Sinh viên năm 3 ngành SE",
                    StudentCode = "SE150001",
                    DateOfBirth = new DateTime(2003, 3, 10),
                    MustChangePassword = true,
                    Status = "Active",
                    IsActive = true,
                    RoleId = roleStudentId,
                    DepartmentId = deptFITId,
                    CreatedAt = now,
                    IsDeleted = false
                },
                new AppUser
                {
                    Id = student02Id,
                    Email = "sv02test@gmail.com",
                    PasswordHash = passwordHash,
                    FullName = "Hoàng Thị Bình",
                    Phone = "0945678901",
                    Bio = "Sinh viên năm 3 ngành SE",
                    StudentCode = "SE150002",
                    DateOfBirth = new DateTime(2003, 7, 25),
                    MustChangePassword = true,
                    Status = "Active",
                    IsActive = true,
                    RoleId = roleStudentId,
                    DepartmentId = deptFITId,
                    CreatedAt = now,
                    IsDeleted = false
                },
                new AppUser
                {
                    Id = student03Id,
                    Email = "sv03test@gmail.com",
                    PasswordHash = passwordHash,
                    FullName = "Vũ Minh Châu",
                    Phone = "0956789012",
                    Bio = "Sinh viên năm 2 ngành AI",
                    StudentCode = "AI160001",
                    DateOfBirth = new DateTime(2004, 11, 30),
                    MustChangePassword = true,
                    Status = "Active",
                    IsActive = true,
                    RoleId = roleStudentId,
                    DepartmentId = deptFITId,
                    CreatedAt = now,
                    IsDeleted = false
                }
            );

            // =============================================
            // 7. System Configs
            // =============================================
            modelBuilder.Entity<SystemConfig>().HasData(
                new SystemConfig { Id = Guid.NewGuid(), ConfigKey = "MaxFileSize", ConfigValue = "52428800", CreatedAt = now, IsDeleted = false },
                new SystemConfig { Id = Guid.NewGuid(), ConfigKey = "MaxVideoSize", ConfigValue = "524288000", CreatedAt = now, IsDeleted = false },
                new SystemConfig { Id = Guid.NewGuid(), ConfigKey = "AllowedFileTypes", ConfigValue = "pdf,docx,xlsx,pptx,mp4,avi", CreatedAt = now, IsDeleted = false },
                new SystemConfig { Id = Guid.NewGuid(), ConfigKey = "DefaultPasswordFormat", ConfigValue = "ddmmyyyy", CreatedAt = now, IsDeleted = false },
                new SystemConfig { Id = Guid.NewGuid(), ConfigKey = "SessionTimeoutMinutes", ConfigValue = "30", CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 8. Email Templates
            // =============================================
            modelBuilder.Entity<EmailTemplate>().HasData(
                new EmailTemplate { Id = Guid.NewGuid(), TemplateCode = "WELCOME", SubjectTemplate = "Chào mừng đến với NextGenLMS - {FullName}", BodyTemplateHtml = "<h1>Xin chào {FullName}!</h1><p>Tài khoản của bạn đã được tạo thành công.</p><p><strong>Email:</strong> {Email}</p><p><strong>Mật khẩu tạm:</strong> {Password}</p><p>Vui lòng đăng nhập và đổi mật khẩu ngay lập tức.</p>", Description = "Email chào mừng user mới", CreatedAt = now, IsDeleted = false },
                new EmailTemplate { Id = Guid.NewGuid(), TemplateCode = "RESET_PASSWORD", SubjectTemplate = "Yêu cầu đặt lại mật khẩu - NextGenLMS", BodyTemplateHtml = "<h1>Đặt lại mật khẩu</h1><p>Nhấn vào link sau để đặt lại mật khẩu:</p><p><a href=\"{ResetLink}\">Đặt lại mật khẩu</a></p><p>Link có hiệu lực trong 15 phút.</p>", Description = "Email reset password", CreatedAt = now, IsDeleted = false },
                new EmailTemplate { Id = Guid.NewGuid(), TemplateCode = "QUIZ_REMINDER", SubjectTemplate = "Nhắc nhở: Bài kiểm tra \"{QuizTitle}\" sắp mở", BodyTemplateHtml = "<h1>Nhắc nhở bài kiểm tra</h1><p>Bài kiểm tra <strong>{QuizTitle}</strong> trong khóa học <strong>{CourseName}</strong> sẽ mở vào {OpenTime}.</p><p>Thời gian làm bài: {DurationMinutes} phút</p>", Description = "Email nhắc nhở bài kiểm tra", CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 9. Courses
            // =============================================
            modelBuilder.Entity<Course>().HasData(
                new Course
                {
                    Id = courseNET101Id,
                    CourseCode = "NET101_FALL24",
                    Name = "Lập trình Web với ASP.NET Core",
                    Description = "Khóa học cơ bản về lập trình web sử dụng ASP.NET Core MVC và Entity Framework",
                    SemesterId = semesterFall2024Id,
                    AcademicYearId = academicYear2024Id,
                    MajorId = majorSEId,
                    CreatedAt = now,
                    IsDeleted = false
                },
                new Course
                {
                    Id = coursePRN211Id,
                    CourseCode = "PRN211_FALL24",
                    Name = "Lập trình Windows Forms",
                    Description = "Xây dựng ứng dụng Desktop với C# Windows Forms",
                    SemesterId = semesterFall2024Id,
                    AcademicYearId = academicYear2024Id,
                    MajorId = majorSEId,
                    CreatedAt = now,
                    IsDeleted = false
                }
            );

            // =============================================
            // 10. Course Lecturers
            // =============================================
            modelBuilder.Entity<CourseLecturer>().HasData(
                new CourseLecturer { Id = Guid.NewGuid(), CourseId = courseNET101Id, LecturerId = lecturer01Id, IsPrimary = true, CreatedAt = now, IsDeleted = false },
                new CourseLecturer { Id = Guid.NewGuid(), CourseId = courseNET101Id, LecturerId = lecturer02Id, IsPrimary = false, CreatedAt = now, IsDeleted = false },
                new CourseLecturer { Id = Guid.NewGuid(), CourseId = coursePRN211Id, LecturerId = lecturer02Id, IsPrimary = true, CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 11. Course Students
            // =============================================
            modelBuilder.Entity<CourseStudent>().HasData(
                new CourseStudent { Id = Guid.NewGuid(), CourseId = courseNET101Id, StudentId = student01Id, EnrolledDate = now, Source = "Manual", CreatedAt = now, IsDeleted = false },
                new CourseStudent { Id = Guid.NewGuid(), CourseId = courseNET101Id, StudentId = student02Id, EnrolledDate = now, Source = "SIS", CreatedAt = now, IsDeleted = false },
                new CourseStudent { Id = Guid.NewGuid(), CourseId = coursePRN211Id, StudentId = student03Id, EnrolledDate = now, Source = "Import", CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 12. Chapters
            // =============================================
            modelBuilder.Entity<Chapter>().HasData(
                new Chapter { Id = chapter1NET101Id, CourseId = courseNET101Id, Title = "Chapter 1: Giới thiệu ASP.NET Core", OrderIndex = 1, CreatedAt = now, IsDeleted = false },
                new Chapter { Id = chapter2NET101Id, CourseId = courseNET101Id, Title = "Chapter 2: MVC Pattern và Routing", OrderIndex = 2, CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 13. Course Contents (Lessons, Quizzes, Announcements)
            // =============================================
            modelBuilder.Entity<Lesson>().HasData(
                new Lesson
                {
                    Id = lesson1Id,
                    ChapterId = chapter1NET101Id,
                    Title = "Bài 1: Cài đặt môi trường",
                    Type = ContentType.Lesson,
                    OrderIndex = 1,
                    FileUrl = "https://cloudinary.com/videos/lesson1.mp4",
                    FileType = "video/mp4",
                    FileSize = 15728640,
                    DurationSeconds = 1200,
                    ContentHtml = "<h2>Hướng dẫn cài đặt Visual Studio 2022</h2><p>Các bước chi tiết...</p>",
                    CreatedAt = now,
                    IsDeleted = false
                }
            );

            modelBuilder.Entity<Quiz>().HasData(
                new Quiz
                {
                    Id = quiz1Id,
                    ChapterId = chapter1NET101Id,
                    Title = "Quiz 1: Kiểm tra kiến thức cơ bản",
                    Type = ContentType.Quiz,
                    OrderIndex = 2,
                    OpenTime = now.AddDays(1),
                    CloseTime = now.AddDays(8),
                    DurationMinutes = 30,
                    ShuffleQuestions = true,
                    ShuffleAnswers = true,
                    CreatedAt = now,
                    IsDeleted = false
                }
            );

            modelBuilder.Entity<Announcement>().HasData(
                new Announcement
                {
                    Id = announcement1Id,
                    ChapterId = chapter1NET101Id,
                    Title = "Thông báo: Thay đổi lịch học",
                    Type = ContentType.Announcement,
                    OrderIndex = 3,
                    ContentHtml = "<p>Thông báo: Lớp học buổi 3 chuyển từ phòng 301 sang phòng 405. Thời gian giữ nguyên.</p>",
                    AttachmentsJson = "[]",
                    CreatedAt = now,
                    IsDeleted = false
                }
            );

            // =============================================
            // 14. Question Topics
            // =============================================
            modelBuilder.Entity<QuestionTopic>().HasData(
                new QuestionTopic { Id = topic1Id, Name = "ASP.NET Core Basics", LecturerId = lecturer01Id, CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 15. Questions
            // =============================================
            modelBuilder.Entity<Question>().HasData(
                new Question
                {
                    Id = question1Id,
                    TopicId = topic1Id,
                    ContentText = "ASP.NET Core sử dụng design pattern nào làm cốt lõi?",
                    Type = QuestionType.MultipleChoice,
                    CreatedAt = now,
                    IsDeleted = false
                },
                new Question
                {
                    Id = question2Id,
                    TopicId = topic1Id,
                    ContentText = "Entity Framework Core có phải là ORM không?",
                    Type = QuestionType.TrueFalse, // Corrected from SQL (2) to Enum (3)
                    CreatedAt = now,
                    IsDeleted = false
                }
            );

            // =============================================
            // 16. Answers
            // =============================================
            modelBuilder.Entity<Answer>().HasData(
                new Answer { Id = answer1Q1Id, QuestionId = question1Id, ContentText = "MVC (Model-View-Controller)", IsCorrect = true, CreatedAt = now, IsDeleted = false },
                new Answer { Id = answer2Q1Id, QuestionId = question1Id, ContentText = "MVP (Model-View-Presenter)", IsCorrect = false, CreatedAt = now, IsDeleted = false },
                new Answer { Id = answer3Q1Id, QuestionId = question1Id, ContentText = "MVVM (Model-View-ViewModel)", IsCorrect = false, CreatedAt = now, IsDeleted = false },
                new Answer { Id = answer4Q1Id, QuestionId = question1Id, ContentText = "Singleton Pattern", IsCorrect = false, CreatedAt = now, IsDeleted = false },
                new Answer { Id = answer1Q2Id, QuestionId = question2Id, ContentText = "True", IsCorrect = true, CreatedAt = now, IsDeleted = false },
                new Answer { Id = answer2Q2Id, QuestionId = question2Id, ContentText = "False", IsCorrect = false, CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 17. Quiz Questions
            // =============================================
            modelBuilder.Entity<QuizQuestion>().HasData(
                new QuizQuestion { Id = Guid.NewGuid(), QuizId = quiz1Id, QuestionId = question1Id, Points = 5, CreatedAt = now, IsDeleted = false },
                new QuizQuestion { Id = Guid.NewGuid(), QuizId = quiz1Id, QuestionId = question2Id, Points = 5, CreatedAt = now, IsDeleted = false }
            );

            // =============================================
            // 18. Audit Logs (LogEntities)
            // =============================================
            modelBuilder.Entity<AuditLog>().HasData(
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    UserId = adminUserId,
                    Action = "Create",
                    ResourceType = "User",
                    ResourceId = student01Id.ToString(),
                    NewValue = "{\"Email\":\"sv01@test.com\",\"FullName\":\"Phạm Văn An\",\"Role\":\"Student\"}",
                    Timestamp = now,
                    CreatedAt = now,
                    IsDeleted = false
                }
            );
            
            // =============================================
            // 19. Activity Logs (LogEntities)
            // =============================================
             modelBuilder.Entity<ActivityLog>().HasData(
                new ActivityLog
                {
                    Id = Guid.NewGuid(),
                    UserId = student01Id,
                    ActivityType = "Login",
                    Details = "Sinh viên đăng nhập thành công",
                    IpAddress = "192.168.1.100",
                    UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
                    Timestamp = now,
                    CreatedAt = now,
                    IsDeleted = false
                }
            );
        }
    }
}
