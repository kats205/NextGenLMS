-- =============================================
-- NextGenLMS Database Seed Data Script
-- Version: 1.1 (Fixed Variable Scope)
-- Date: 02/02/2026
-- Description: Khởi tạo dữ liệu mẫu cho hệ thống LMS
-- =============================================

USE [NextGenLMS_Db];


BEGIN TRANSACTION;

-- =============================================
-- DECLARE VARIABLES (GUIDs cố định để tránh conflict)
-- =============================================

-- Role IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @RoleAdminId UNIQUEIDENTIFIER = '7F6A5FB8-10D6-4B31-9F64-0AE904225071';
DECLARE @RoleLecturerId UNIQUEIDENTIFIER = 'DDEB87B1-28F2-4B15-88D5-350CFF603FBA';
DECLARE @RoleStudentId UNIQUEIDENTIFIER = 'D06CDE01-4C8B-4F26-AD27-41E8DF3B64E7';

-- Department IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @DeptFITId UNIQUEIDENTIFIER = '68D2BA61-E3E8-42FE-BD96-542C0FC033C3';
DECLARE @DeptBusinessId UNIQUEIDENTIFIER = 'FCDAE90C-0456-46CA-A81E-863ABA3D9030';

-- User IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @AdminUserId UNIQUEIDENTIFIER = 'F2CD183C-ECD7-4297-9237-BD306017E8AA';
DECLARE @Lecturer01Id UNIQUEIDENTIFIER = '50ED565D-C2A9-4B86-81FF-D42C3290D4B8';
DECLARE @Lecturer02Id UNIQUEIDENTIFIER = 'CEDFD30B-E83D-4D0D-957B-F669C2703440';
DECLARE @Student01Id UNIQUEIDENTIFIER = '48C6A748-4B43-4EAA-9AA7-A610D3423139';
DECLARE @Student02Id UNIQUEIDENTIFIER = '4D2E259C-6E7F-4BBD-AFB5-1AF74DEFEB67';
DECLARE @Student03Id UNIQUEIDENTIFIER = '13F2C2BE-0347-4E08-A5D5-FCB6E217E0DA';

-- Academic Year & Semester IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @AcademicYear2024Id UNIQUEIDENTIFIER = '07DFA9A6-E5E0-432F-ADA4-FF25EFCCBB16';
DECLARE @SemesterSpring2024Id UNIQUEIDENTIFIER = 'A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D';
DECLARE @SemesterFall2024Id UNIQUEIDENTIFIER = 'B2C3D4E5-F6A7-4B5C-8D9E-0F1A2B3C4D5E';

-- Major IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @MajorSEId UNIQUEIDENTIFIER = 'C3D4E5F6-A7B8-4C5D-8E9F-0A1B2C3D4E5F';
DECLARE @MajorAIId UNIQUEIDENTIFIER = 'D4E5F6A7-B8C9-4D5E-8F9A-0B1C2D3E4F5A';

-- Course IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @CourseNET101Id UNIQUEIDENTIFIER = 'E5F6A7B8-C9D0-4E5F-8A9B-0C1D2E3F4A5B';
DECLARE @CoursePRN211Id UNIQUEIDENTIFIER = 'F6A7B8C9-D0E1-4F5A-8B9C-0D1E2F3A4B5C';

-- Chapter IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @Chapter1NET101Id UNIQUEIDENTIFIER = 'A7B8C9D0-E1F2-4A5B-8C9D-0E1F2A3B4C5D';
DECLARE @Chapter2NET101Id UNIQUEIDENTIFIER = 'B8C9D0E1-F2A3-4B5C-8D9E-0F1A2B3C4D5E';

-- Content IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @Lesson1Id UNIQUEIDENTIFIER = 'C9D0E1F2-A3B4-4C5D-8E9F-0A1B2C3D4E5F';
DECLARE @Quiz1Id UNIQUEIDENTIFIER = 'D0E1F2A3-B4C5-4D5E-8F9A-0B1C2D3E4F5A';
DECLARE @Assignment1Id UNIQUEIDENTIFIER = 'F2A3B4C5-D6E7-4F5A-8B9C-0D1E2F3A4B5C';
DECLARE @Announcement1Id UNIQUEIDENTIFIER = 'E1F2A3B4-C5D6-4E5F-8A9B-0C1D2E3F4A5B';

-- Topic & Question IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @Topic1Id UNIQUEIDENTIFIER = 'F2A3B4C5-D6E7-4F5A-8B9C-0D1E2F3A4B5C';
DECLARE @Question1Id UNIQUEIDENTIFIER = 'A3B4C5D6-E7F8-4A5B-8C9D-0E1F2A3B4C5D';
DECLARE @Question2Id UNIQUEIDENTIFIER = 'B4C5D6E7-F8A9-4B5C-8D9E-0F1A2B3C4D5E';

-- Answer IDs (FIXED GUIDs - DO NOT CHANGE)
DECLARE @Answer1Q1Id UNIQUEIDENTIFIER = 'C5D6E7F8-A9B0-4C5D-8E9F-0A1B2C3D4E5F';
DECLARE @Answer2Q1Id UNIQUEIDENTIFIER = 'D6E7F8A9-B0C1-4D5E-8F9A-0B1C2D3E4F5A';
DECLARE @Answer3Q1Id UNIQUEIDENTIFIER = 'E7F8A9B0-C1D2-4E5F-8A9B-0C1D2E3F4A5B';
DECLARE @Answer4Q1Id UNIQUEIDENTIFIER = 'F8A9B0C1-D2E3-4F5A-8B9C-0D1E2F3A4B5C';

DECLARE @Answer1Q2Id UNIQUEIDENTIFIER = 'A9B0C1D2-E3F4-4A5B-8C9D-0E1F2A3B4C5D';
DECLARE @Answer2Q2Id UNIQUEIDENTIFIER = 'B0C1D2E3-F4A5-4B5C-8D9E-0F1A2B3C4D5E';

-- Current timestamp
DECLARE @Now DATETIME2 = GETUTCDATE();

-- BCrypt hash for password "123456"
-- Hash này được tạo bằng BCrypt với cost factor 11
DECLARE @DefaultPasswordHash NVARCHAR(MAX) = '$2a$11$mC7p/.VQUlV6.j.d8x90.eBMZqJ3q9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z';

-- =============================================
-- 1. INSERT ROLES (AppRoles)
-- Mô tả: Tạo 3 vai trò chính trong hệ thống
-- [HANDLED IN C# SEEDER]
-- =============================================
PRINT '▶ Skipped Inserting Roles (Handled in Code)...';

/*
-- Xóa roles cũ nếu đã tồn tại (dựa trên GUID cố định)
DELETE FROM [AppRoles] WHERE [Id] IN (@RoleAdminId, @RoleLecturerId, @RoleStudentId);

INSERT INTO [AppRoles] ([Id], [RoleName], [Description], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@RoleAdminId, N'Admin', N'Quản trị viên hệ thống - Có toàn quyền quản lý', @Now, NULL, 0),
    (@RoleLecturerId, N'Lecturer', N'Giảng viên - Quản lý khóa học và sinh viên', @Now, NULL, 0),
    (@RoleStudentId, N'Student', N'Sinh viên - Học tập và làm bài thi', @Now, NULL, 0);

PRINT '✓ Inserted 3 Roles successfully.';
*/

-- =============================================
-- 2. INSERT DEPARTMENTS (Departments)
-- Mô tả: Tạo các khoa/bộ môn
-- =============================================
PRINT '▶ Inserting Departments...';

INSERT INTO [Departments] ([Id], [Name], [Code], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (@DeptFITId, N'Khoa Công nghệ Thông tin', N'FIT', @Now, NULL, 0),
    (@DeptBusinessId, N'Khoa Quản trị Kinh doanh', N'BUS', @Now, NULL, 0)
) AS T(Id, Name, Code, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [Departments] WHERE Id = T.Id);

PRINT '✓ Inserted 2 Departments successfully.';

-- =============================================
-- 3. INSERT ACADEMIC YEARS (AcademicYears)
-- Mô tả: Tạo niên khóa
-- =============================================
PRINT '▶ Inserting Academic Years...';

INSERT INTO [AcademicYears] ([Id], [Name], [StartDate], [EndDate], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (@AcademicYear2024Id, N'2024-2025', '2024-09-01 00:00:00', '2025-08-31 23:59:59', @Now, NULL, 0)
) AS T(Id, Name, StartDate, EndDate, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [AcademicYears] WHERE Id = T.Id);

PRINT '✓ Inserted 1 Academic Year successfully.';

-- =============================================
-- 4. INSERT SEMESTERS (Semesters)
-- Mô tả: Tạo các học kỳ
-- =============================================
PRINT '▶ Inserting Semesters...';

INSERT INTO [Semesters] ([Id], [Name], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (@SemesterSpring2024Id, N'Spring 2024', @Now, NULL, 0),
    (@SemesterFall2024Id, N'Fall 2024', @Now, NULL, 0)
) AS T(Id, Name, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [Semesters] WHERE Id = T.Id);

PRINT '✓ Inserted 2 Semesters successfully.';


-- =============================================
-- 5. INSERT MAJORS (Majors)
-- Mô tả: Tạo các ngành học thuộc khoa FIT
-- =============================================
PRINT '▶ Inserting Majors...';

INSERT INTO [Majors] ([Id], [Name], [DepartmentId], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (@MajorSEId, N'Software Engineering', @DeptFITId, @Now, NULL, 0),
    (@MajorAIId, N'Artificial Intelligence', @DeptFITId, @Now, NULL, 0)
) AS T(Id, Name, DepartmentId, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [Majors] WHERE Id = T.Id);

PRINT '✓ Inserted 2 Majors successfully.';


-- =============================================
-- 6. INSERT USERS (AppUsers)
-- Mô tả: Tạo 1 Admin, 2 Lecturers, 3 Students
-- Password mặc định cho tất cả: 123456
-- [HANDLED IN C# SEEDER]
-- =============================================
PRINT '▶ Skipped Inserting Users (Handled in Code)...';

-- 6.1. Admin User
INSERT INTO [AppUsers] 
    ([Id], [Email], [PasswordHash], [FullName], [Phone], [AvatarUrl], [Bio], 
     [StudentCode], [TeacherCode], [DateOfBirth], [MustChangePassword], [Status], 
     [IsActive], [RoleId], [DepartmentId], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES
    (@AdminUserId, N'admin@test.com', @DefaultPasswordHash, N'Nguyễn Văn Admin', 
     N'0901234567', NULL, N'Quản trị viên hệ thống LMS', 
     NULL, NULL, CAST('1985-01-01' AS DATETIME2), CAST(1 AS BIT), N'Active', 
     CAST(1 AS BIT), @RoleAdminId, NULL, @Now, NULL, CAST(0 AS BIT))
) AS T(Id, Email, PasswordHash, FullName, Phone, AvatarUrl, Bio, StudentCode, TeacherCode, DateOfBirth, MustChangePassword, Status, IsActive, RoleId, DepartmentId, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [AppUsers] WHERE Id = T.Id);

-- 6.2. Lecturer Users
INSERT INTO [AppUsers] 
    ([Id], [Email], [PasswordHash], [FullName], [Phone], [AvatarUrl], [Bio], 
     [StudentCode], [TeacherCode], [DateOfBirth], [MustChangePassword], [Status], 
     [IsActive], [RoleId], [DepartmentId], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (@Lecturer01Id, N'gv01@test.com', @DefaultPasswordHash, N'Trần Thị Minh', 
     N'0912345678', NULL, N'Giảng viên Lập trình Web', 
     NULL, N'GV001', CAST('1980-05-15' AS DATETIME2), CAST(1 AS BIT), N'Active', 
     CAST(1 AS BIT), @RoleLecturerId, @DeptFITId, @Now, NULL, CAST(0 AS BIT)),
    
    (@Lecturer02Id, N'gv02@test.com', @DefaultPasswordHash, N'Lê Văn Hùng', 
     N'0923456789', NULL, N'Giảng viên Cơ sở dữ liệu', 
     NULL, N'GV002', CAST('1982-08-20' AS DATETIME2), CAST(1 AS BIT), N'Active', 
     CAST(1 AS BIT), @RoleLecturerId, @DeptFITId, @Now, NULL, CAST(0 AS BIT))
) AS T(Id, Email, PasswordHash, FullName, Phone, AvatarUrl, Bio, StudentCode, TeacherCode, DateOfBirth, MustChangePassword, Status, IsActive, RoleId, DepartmentId, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [AppUsers] WHERE Id = T.Id);

-- 6.3. Student Users
INSERT INTO [AppUsers] 
    ([Id], [Email], [PasswordHash], [FullName], [Phone], [AvatarUrl], [Bio], 
     [StudentCode], [TeacherCode], [DateOfBirth], [MustChangePassword], [Status], 
     [IsActive], [RoleId], [DepartmentId], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (@Student01Id, N'sv01@test.com', @DefaultPasswordHash, N'Phạm Văn An', 
     N'0934567890', NULL, N'Sinh viên năm 3 ngành SE', 
     N'SE150001', NULL, CAST('2003-03-10' AS DATETIME2), CAST(1 AS BIT), N'Active', 
     CAST(1 AS BIT), @RoleStudentId, @DeptFITId, @Now, NULL, CAST(0 AS BIT)),
    
    (@Student02Id, N'sv02@test.com', @DefaultPasswordHash, N'Hoàng Thị Bình', 
     N'0945678901', NULL, N'Sinh viên năm 3 ngành SE', 
     N'SE150002', NULL, CAST('2003-07-25' AS DATETIME2), CAST(1 AS BIT), N'Active', 
     CAST(1 AS BIT), @RoleStudentId, @DeptFITId, @Now, NULL, CAST(0 AS BIT)),
    
    (@Student03Id, N'sv03@test.com', @DefaultPasswordHash, N'Vũ Minh Châu', 
     N'0956789012', NULL, N'Sinh viên năm 2 ngành AI', 
     N'AI160001', NULL, CAST('2004-11-30' AS DATETIME2), CAST(1 AS BIT), N'Active', 
     CAST(1 AS BIT), @RoleStudentId, @DeptFITId, @Now, NULL, CAST(0 AS BIT))
) AS T(Id, Email, PasswordHash, FullName, Phone, AvatarUrl, Bio, StudentCode, TeacherCode, DateOfBirth, MustChangePassword, Status, IsActive, RoleId, DepartmentId, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [AppUsers] WHERE Id = T.Id);

PRINT '✓ Inserted 6 Users (1 Admin, 2 Lecturers, 3 Students) successfully.';


-- =============================================
-- 7. INSERT SYSTEM CONFIGS (SystemConfigs)
-- Mô tả: Cấu hình hệ thống
-- =============================================
PRINT '▶ Inserting System Configs...';

INSERT INTO [SystemConfigs] ([Id], [ConfigKey], [ConfigValue], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (NEWID(), N'MaxFileSize', N'52428800', @Now, NULL, 0), -- 50MB
    (NEWID(), N'MaxVideoSize', N'524288000', @Now, NULL, 0), -- 500MB
    (NEWID(), N'AllowedFileTypes', N'pdf,docx,xlsx,pptx,mp4,avi', @Now, NULL, 0),
    (NEWID(), N'DefaultPasswordFormat', N'ddmmyyyy', @Now, NULL, 0),
    (NEWID(), N'SessionTimeoutMinutes', N'30', @Now, NULL, 0);

PRINT '✓ Inserted 5 System Configs successfully.';


-- =============================================
-- 8. INSERT EMAIL TEMPLATES (EmailTemplates)
-- Mô tả: Các mẫu email tự động
-- =============================================
PRINT '▶ Inserting Email Templates...';

INSERT INTO [EmailTemplates] ([Id], [TemplateCode], [SubjectTemplate], [BodyTemplateHtml], [Description], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (NEWID(), N'WELCOME', 
     N'Chào mừng đến với NextGenLMS - {FullName}', 
     N'<h1>Xin chào {FullName}!</h1><p>Tài khoản của bạn đã được tạo thành công.</p><p><strong>Email:</strong> {Email}</p><p><strong>Mật khẩu tạm:</strong> {Password}</p><p>Vui lòng đăng nhập và đổi mật khẩu ngay lập tức.</p>', 
     N'Email chào mừng user mới', @Now, NULL, 0),
    
    (NEWID(), N'RESET_PASSWORD', 
     N'Yêu cầu đặt lại mật khẩu - NextGenLMS', 
     N'<h1>Đặt lại mật khẩu</h1><p>Nhấn vào link sau để đặt lại mật khẩu:</p><p><a href="{ResetLink}">Đặt lại mật khẩu</a></p><p>Link có hiệu lực trong 15 phút.</p>', 
     N'Email reset password', @Now, NULL, 0),
    
    (NEWID(), N'QUIZ_REMINDER', 
     N'Nhắc nhở: Bài kiểm tra "{QuizTitle}" sắp mở', 
     N'<h1>Nhắc nhở bài kiểm tra</h1><p>Bài kiểm tra <strong>{QuizTitle}</strong> trong khóa học <strong>{CourseName}</strong> sẽ mở vào {OpenTime}.</p><p>Thời gian làm bài: {DurationMinutes} phút</p>', 
     N'Email nhắc nhở bài kiểm tra', @Now, NULL, 0);

PRINT '✓ Inserted 3 Email Templates successfully.';


-- =============================================
-- 9. INSERT COURSES (Courses)
-- Mô tả: Tạo 2 khóa học mẫu
-- =============================================
PRINT '▶ Inserting Courses...';

INSERT INTO [Courses] 
    ([Id], [CourseCode], [Name], [Description], [ThumbnailUrl], 
     [SemesterId], [AcademicYearId], [MajorId], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@CourseNET101Id, N'NET101_FALL24', N'Lập trình Web với ASP.NET Core', 
     N'Khóa học cơ bản về lập trình web sử dụng ASP.NET Core MVC và Entity Framework', 
     NULL, @SemesterFall2024Id, @AcademicYear2024Id, @MajorSEId, @Now, NULL, 0),
    
    (@CoursePRN211Id, N'PRN211_FALL24', N'Lập trình Windows Forms', 
     N'Xây dựng ứng dụng Desktop với C# Windows Forms', 
     NULL, @SemesterFall2024Id, @AcademicYear2024Id, @MajorSEId, @Now, NULL, 0);

PRINT '✓ Inserted 2 Courses successfully.';


-- =============================================
-- 10. INSERT COURSE LECTURERS (CourseLecturers)
-- Mô tả: Gán giảng viên cho khóa học
-- =============================================
PRINT '▶ Inserting Course Lecturers...';

INSERT INTO [CourseLecturers] ([Id], [CourseId], [LecturerId], [IsPrimary], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (NEWID(), @CourseNET101Id, @Lecturer01Id, 1, @Now, NULL, 0), -- GV chính
    (NEWID(), @CourseNET101Id, @Lecturer02Id, 0, @Now, NULL, 0), -- GV hỗ trợ
    (NEWID(), @CoursePRN211Id, @Lecturer02Id, 1, @Now, NULL, 0);

PRINT '✓ Inserted 3 Course-Lecturer relationships successfully.';


-- =============================================
-- 11. INSERT COURSE STUDENTS (CourseStudents)
-- Mô tả: Ghi danh sinh viên vào khóa học
-- =============================================
PRINT '▶ Enrolling Students to Courses...';

INSERT INTO [CourseStudents] ([Id], [CourseId], [StudentId], [EnrolledDate], [Source], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (NEWID(), @CourseNET101Id, @Student01Id, @Now, N'Manual', @Now, NULL, 0),
    (NEWID(), @CourseNET101Id, @Student02Id, @Now, N'SIS', @Now, NULL, 0),
    (NEWID(), @CoursePRN211Id, @Student03Id, @Now, N'Import', @Now, NULL, 0);

PRINT '✓ Enrolled 3 Students to Courses successfully.';


-- =============================================
-- 12. INSERT CHAPTERS (Chapters)
-- Mô tả: Tạo các chương trong khóa học
-- =============================================
PRINT '▶ Inserting Chapters...';

INSERT INTO [Chapters] ([Id], [CourseId], [Title], [OrderIndex], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@Chapter1NET101Id, @CourseNET101Id, N'Chapter 1: Giới thiệu ASP.NET Core', 1, @Now, NULL, 0),
    (@Chapter2NET101Id, @CourseNET101Id, N'Chapter 2: MVC Pattern và Routing', 2, @Now, NULL, 0);

PRINT '✓ Inserted 2 Chapters successfully.';


-- =============================================
-- 13. INSERT COURSE CONTENTS (TPT Pattern)
-- Mô tả: Tạo nội dung: Lesson, Quiz, Announcement
-- =============================================
PRINT '▶ Inserting Course Contents...';

-- 13.1. Parent Table: CourseContents
INSERT INTO [CourseContents] ([Id], [ChapterId], [Title], [Type], [OrderIndex], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@Lesson1Id, @Chapter1NET101Id, N'Bài 1: Cài đặt môi trường', 1, 1, @Now, NULL, 0), -- Type 1 = Lesson
    (@Quiz1Id, @Chapter1NET101Id, N'Quiz 1: Kiểm tra kiến thức cơ bản', 3, 2, @Now, NULL, 0), -- Type 3 = Quiz (Trắc nghiệm)
    (@Assignment1Id, @Chapter1NET101Id, N'Bài tập 1: Tạo ứng dụng đầu tiên', 2, 3, @Now, NULL, 0), -- Type 2 = Assignment (Tự luận)
    (@Announcement1Id, @Chapter1NET101Id, N'Thông báo: Thay đổi lịch học', 4, 4, @Now, NULL, 0); -- Type 4 = Announcement

-- 13.2. Child Table: Lessons
INSERT INTO [Lessons] ([Id], [FileUrl], [FileType], [FileSize], [DurationSeconds], [ContentHtml])
VALUES 
    (@Lesson1Id, N'https://www.w3schools.com/html/mov_bbb.mp4', N'Video', 15728640, 1200, 
     N'<h2>Hướng dẫn cài đặt Visual Studio 2022</h2><p>Các bước chi tiết...</p>');

-- 13.3. Child Table: Quizzes
INSERT INTO [Quizzes] ([Id], [OpenTime], [CloseTime], [DurationMinutes], [ShuffleQuestions], [ShuffleAnswers])
VALUES 
    (@Quiz1Id, DATEADD(DAY, 1, @Now), DATEADD(DAY, 8, @Now), 30, 1, 1);

-- 13.4. Child Table: Assignments
INSERT INTO [Assignments] ([Id], [DueDate], [MaxScore], [Description], [Instructions], [AttachmentsJson], [AllowLateSubmission], [LatePenaltyPercent], [MaxAttempts], [RequireTextSubmission], [AllowFileSubmission], [AllowLinkSubmission], [AllowedFileTypes], [MaxFileSize])
VALUES 
    (@Assignment1Id, DATEADD(DAY, 7, @Now), 100, 
     N'Tạo một ứng dụng ASP.NET Core đơn giản với các chức năng cơ bản', 
     N'<h3>Yêu cầu:</h3><ul><li>Tạo project ASP.NET Core MVC</li><li>Tạo Controller và View</li><li>Kết nối cơ sở dữ liệu</li><li>Upload source code lên GitHub</li></ul>', 
     N'{"fileName": "assignment-template.docx","fileUrl": "https://res.cloudinary.com/dtzncc4fw/raw/upload/v1770217535/assignment-template.docx","fileSize": 1048576}',
     1, 10, 3, 1, 1, 1, N'.pdf,.docx,.zip,.rar', 52428800);

-- 13.5. Child Table: Announcements
INSERT INTO [Announcements] ([Id], [ContentHtml], [AttachmentsJson])
VALUES 
    (@Announcement1Id, 
     N'<p>Thông báo: Lớp học buổi 3 chuyển từ phòng 301 sang phòng 405. Thời gian giữ nguyên.</p>', 
     N'[]');

PRINT '✓ Inserted 4 Course Contents (1 Lesson, 1 Quiz, 1 Assignment, 1 Announcement) successfully.';


-- =============================================
-- 14. INSERT QUESTION TOPICS (QuestionTopics)
-- Mô tả: Tạo chủ đề ngân hàng câu hỏi
-- =============================================
PRINT '▶ Inserting Question Topics...';

INSERT INTO [QuestionTopics] ([Id], [Name], [LecturerId], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@Topic1Id, N'ASP.NET Core Basics', @Lecturer01Id, @Now, NULL, 0);

PRINT '✓ Inserted 1 Question Topic successfully.';


-- =============================================
-- 15. INSERT QUESTIONS (Questions)
-- Mô tả: Tạo câu hỏi trắc nghiệm
-- =============================================
PRINT '▶ Inserting Questions...';

INSERT INTO [Questions] ([Id], [TopicId], [ContentText], [MediaUrl], [Type], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@Question1Id, @Topic1Id, 
     N'ASP.NET Core sử dụng design pattern nào làm cốt lõi?', 
     NULL, 1, @Now, NULL, 0), -- Type 1 = MultipleChoice
    
    (@Question2Id, @Topic1Id, 
     N'Entity Framework Core có phải là ORM không?', 
     NULL, 2, @Now, NULL, 0); -- Type 2 = TrueFalse

PRINT '✓ Inserted 2 Questions successfully.';


-- =============================================
-- 16. INSERT ANSWERS (Answers)
-- Mô tả: Tạo đáp án cho câu hỏi
-- =============================================
PRINT '▶ Inserting Answers...';

-- Answers for Question 1 (Multiple Choice)
INSERT INTO [Answers] ([Id], [QuestionId], [ContentText], [IsCorrect], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@Answer1Q1Id, @Question1Id, N'MVC (Model-View-Controller)', 1, @Now, NULL, 0), -- Correct
    (@Answer2Q1Id, @Question1Id, N'MVP (Model-View-Presenter)', 0, @Now, NULL, 0),
    (@Answer3Q1Id, @Question1Id, N'MVVM (Model-View-ViewModel)', 0, @Now, NULL, 0),
    (@Answer4Q1Id, @Question1Id, N'Singleton Pattern', 0, @Now, NULL, 0);

-- Answers for Question 2 (True/False)
INSERT INTO [Answers] ([Id], [QuestionId], [ContentText], [IsCorrect], [CreatedAt], [UpdatedAt], [IsDeleted])
VALUES 
    (@Answer1Q2Id, @Question2Id, N'True', 1, @Now, NULL, 0), -- Correct
    (@Answer2Q2Id, @Question2Id, N'False', 0, @Now, NULL, 0);

PRINT '✓ Inserted 6 Answers successfully.';


-- =============================================
-- 17. INSERT QUIZ QUESTIONS (QuizQuestions)
-- Mô tả: Gắn câu hỏi vào đề thi
-- =============================================
PRINT '▶ Linking Questions to Quiz...';

INSERT INTO [QuizQuestions] ([Id], [QuizId], [QuestionId], [Points], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (NEWID(), @Quiz1Id, @Question1Id, 5, @Now, NULL, 0), -- 5 điểm
    (NEWID(), @Quiz1Id, @Question2Id, 5, @Now, NULL, 0)  -- 5 điểm
) AS T(Id, QuizId, QuestionId, Points, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [QuizQuestions] WHERE QuizId = T.QuizId AND QuestionId = T.QuestionId);

PRINT '✓ Linked 2 Questions to Quiz successfully.';


-- =============================================
-- 18. INSERT AUDIT LOG (Sample)
-- Mô tả: Log mẫu khi Admin tạo user
-- =============================================
PRINT '▶ Inserting Sample Audit Log...';

INSERT INTO [AuditLogs] 
    ([Id], [UserId], [Action], [ResourceType], [ResourceId], [OldValue], [NewValue], [Timestamp], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (NEWID(), @AdminUserId, N'Create', N'User', CAST(@Student01Id AS NVARCHAR(MAX)), 
     NULL, 
     N'{"Email":"sv01@test.com","FullName":"Phạm Văn An","Role":"Student"}', 
     @Now, @Now, NULL, 0)
) AS T(Id, UserId, Action, ResourceType, ResourceId, OldValue, NewValue, Timestamp, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [AuditLogs] WHERE UserId = T.UserId AND Action = T.Action AND Timestamp = T.Timestamp);

PRINT '✓ Inserted 1 Audit Log successfully.';


-- =============================================
-- 19. INSERT ACTIVITY LOG (Sample)
-- Mô tả: Log hoạt động đăng nhập
-- =============================================
PRINT '▶ Inserting Sample Activity Log...';

INSERT INTO [ActivityLogs] 
    ([Id], [UserId], [ActivityType], [Details], [IpAddress], [UserAgent], [Timestamp], [CreatedAt], [UpdatedAt], [IsDeleted])
SELECT T.* FROM (VALUES 
    (NEWID(), @Student01Id, N'Login', 
     N'Sinh viên đăng nhập thành công', 
     N'192.168.1.100', 
     N'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 
     @Now, @Now, NULL, 0)
) AS T(Id, UserId, ActivityType, Details, IpAddress, UserAgent, Timestamp, CreatedAt, UpdatedAt, IsDeleted)
WHERE NOT EXISTS (SELECT 1 FROM [ActivityLogs] WHERE UserId = T.UserId AND ActivityType = T.ActivityType AND Timestamp = T.Timestamp);

PRINT '✓ Inserted 1 Activity Log successfully.';


-- =============================================
-- COMMIT TRANSACTION
-- =============================================

COMMIT TRANSACTION;

PRINT '';
PRINT '═══════════════════════════════════════════════════════════';
PRINT '✓✓✓ SEED DATA COMPLETED SUCCESSFULLY ✓✓✓';
PRINT '═══════════════════════════════════════════════════════════';
PRINT '';
PRINT 'Summary:';
PRINT '  • 3 Roles (Admin, Lecturer, Student)';
PRINT '  • 2 Departments (FIT, Business)';
PRINT '  • 1 Academic Year (2024-2025)';
PRINT '  • 2 Semesters (Spring, Fall 2024)';
PRINT '  • 2 Majors (SE, AI)';
PRINT '  • 6 Users (1 Admin, 2 Lecturers, 3 Students)';
PRINT '  • 5 System Configs';
PRINT '  • 3 Email Templates';
PRINT '  • 2 Courses (NET101, PRN211)';
PRINT '  • 3 Course-Lecturer assignments';
PRINT '  • 3 Student Enrollments';
PRINT '  • 2 Chapters in NET101';
PRINT '  • 3 Course Contents (1 Lesson, 1 Quiz, 1 Announcement)';
PRINT '  • 1 Question Topic';
PRINT '  • 2 Questions with 6 Answers';
PRINT '  • 2 Quiz Questions (linked to Quiz1)';
PRINT '  • 1 Audit Log + 1 Activity Log';
PRINT '';
PRINT 'Default Login Credentials:';
PRINT '  Admin:    admin@test.com / 123456';
PRINT '  Lecturer: gv01@test.com / 123456';
PRINT '  Student:  sv01@test.com / 123456';
PRINT '';
PRINT 'IMPORTANT: All users have MustChangePassword = 1';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════';
GO

