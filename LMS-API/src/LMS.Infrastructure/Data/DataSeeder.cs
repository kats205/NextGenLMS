using LMS.Domain.Entities.Assessment;
using LMS.Domain.Entities.Content;
using LMS.Domain.Entities.Courses;
using LMS.Domain.Entities.System;
using LMS.Domain.Entities.Users;
using LMS.Infrastructure.Data;
using LMS.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

public sealed class DataSeeder
{
    private readonly AppDbContext _db;

    public DataSeeder(AppDbContext db) => _db = db;

    public async Task SeedAsync(string jsonPath, CancellationToken ct = default)
    {
        if (!File.Exists(jsonPath))
        {
            Console.WriteLine($"[SEED] File NOT FOUND!");
            return;
        }

        Console.WriteLine($"[SEED] File found, checking existing data...");

        // Điều kiện chặn seed lặp
        if (await _db.AppUsers.AnyAsync(x => x.Email == "admin@nextgenlms.local", ct))
        {
            Console.WriteLine($"[SEED] Admin user already exists, skipping seed.");
            return;
        }

        Console.WriteLine($"[SEED] Reading JSON file...");
        var json = await File.ReadAllTextAsync(jsonPath, ct);

        Console.WriteLine($"[SEED] Deserializing JSON...");
        var dataset = JsonSerializer.Deserialize<SeedDataset>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (dataset is null)
        {
            Console.WriteLine($"[SEED] Failed to deserialize JSON!");
            return;
        }

        Console.WriteLine($"[SEED] Dataset loaded. Roles: {dataset.Roles.Count}, Users: {dataset.Users.Count}");

        var now = DateTime.UtcNow;


        // Roles
        _db.AppRoles.AddRange(dataset.Roles.Select(x => new AppRole
        {
            Id = x.Id,
            RoleName = x.RoleName,
            Description = x.Description,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // Departments
        _db.Departments.AddRange(dataset.Departments.Select(x => new Department
        {
            Id = x.Id,
            Name = x.Name,
            Code = x.Code,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // Majors
        _db.Majors.AddRange(dataset.Majors.Select(x => new Major
        {
            Id = x.Id,
            Name = x.Name,
            DepartmentId = x.DepartmentId,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // AcademicYears
        _db.AcademicYears.AddRange(dataset.AcademicYears.Select(x => new AcademicYear
        {
            Id = x.Id,
            Name = x.Name,
            StartDate = x.StartDate,
            EndDate = x.EndDate,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // Semesters
        _db.Semesters.AddRange(dataset.Semesters.Select(x => new Semester
        {
            Id = x.Id,
            Name = x.Name,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // SystemConfigs
        _db.SystemConfigs.AddRange(dataset.SystemConfigs.Select(x => new SystemConfig
        {
            Id = x.Id,
            ConfigKey = x.ConfigKey,
            ConfigValue = x.ConfigValue,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // Users
        foreach (var u in dataset.Users)
        {
            var entity = new AppUser
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                AvatarUrl = null,
                Bio = null,
                StudentCode = u.StudentCode,
                IsFirstLogin = u.IsFirstLogin,
                IsActive = u.IsActive,
                RoleId = u.RoleId,
                DepartmentId = u.DepartmentId,
                CreatedAt = now,
                UpdatedAt = null,
                IsDeleted = false
            };

            entity.PasswordHash = PasswordHelper.Hash(u.PlainPassword);
            _db.AppUsers.Add(entity);
        }

        // Courses
        _db.Courses.AddRange(dataset.Courses.Select(x => new Course
        {
            Id = x.Id,
            CourseCode = x.CourseCode,
            Name = x.Name,
            Description = x.Description,
            ThumbnailUrl = x.ThumbnailUrl,
            SemesterId = x.SemesterId,
            AcademicYearId = x.AcademicYearId,
            MajorId = x.MajorId,
            LecturerId = x.LecturerId,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // Chapters
        _db.Chapters.AddRange(dataset.Chapters.Select(x => new Chapter
        {
            Id = x.Id,
            CourseId = x.CourseId,
            Title = x.Title,
            OrderIndex = x.OrderIndex,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // CourseContents (Polymorphic) - Xử lý theo Type
        foreach (var content in dataset.Contents)
        {
            switch (content.Type)
            {
                case ContentType.Lesson:
                    _db.Lessons.Add(new Lesson
                    {
                        Id = content.Id,
                        ChapterId = content.ChapterId,
                        Title = content.Title,
                        Type = content.Type,
                        OrderIndex = content.OrderIndex,
                        FileUrl = content.FileUrl,
                        FileType = content.FileType,
                        FileSize = content.FileSize ?? 0,
                        DurationSeconds = content.DurationSeconds ?? 0,
                        ContentHtml = content.ContentHtml,
                        CreatedAt = now,
                        UpdatedAt = null,
                        IsDeleted = false
                    });
                    break;

                case ContentType.Quiz:
                    _db.Quizzes.Add(new Quiz
                    {
                        Id = content.Id,
                        ChapterId = content.ChapterId,
                        Title = content.Title,
                        Type = content.Type,
                        OrderIndex = content.OrderIndex,
                        OpenTime = content.OpenTime,
                        CloseTime = content.CloseTime,
                        DurationMinutes = content.DurationMinutes ?? 0,
                        ShuffleQuestions = content.ShuffleQuestions ?? false,
                        ShuffleAnswers = content.ShuffleAnswers ?? false,
                        CreatedAt = now,
                        UpdatedAt = null,
                        IsDeleted = false
                    });
                    break;

                case ContentType.Assignment:
                    _db.Set<Assignment>().Add(new Assignment
                    {
                        Id = content.Id,
                        ChapterId = content.ChapterId,
                        Title = content.Title,
                        Type = content.Type,
                        OrderIndex = content.OrderIndex,
                        DueDate = content.DueDate,
                        MaxScore = content.MaxScore ?? 0,
                        Description = content.AssignmentDescription,
                        CreatedAt = now,
                        UpdatedAt = null,
                        IsDeleted = false
                    });
                    break;
            }
        }

        // Question bank
        _db.QuestionTopics.AddRange(dataset.Topics.Select(x => new QuestionTopic
        {
            Id = x.Id,
            Name = x.Name,
            LecturerId = x.LecturerId,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        _db.Questions.AddRange(dataset.Questions.Select(x => new Question
        {
            Id = x.Id,
            TopicId = x.TopicId,
            ContentText = x.ContentText,
            MediaUrl = x.MediaUrl,
            Type = x.Type,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        _db.Answers.AddRange(dataset.Answers.Select(x => new Answer
        {
            Id = x.Id,
            QuestionId = x.QuestionId,
            ContentText = x.ContentText,
            IsCorrect = x.IsCorrect,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        _db.QuizQuestions.AddRange(dataset.QuizQuestions.Select(x => new QuizQuestion
        {
            Id = x.Id,
            QuizId = x.QuizId,
            QuestionId = x.QuestionId,
            Points = x.Points,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        // CourseStudents
        _db.CourseStudents.AddRange(dataset.CourseStudents.Select(x => new CourseStudent
        {
            Id = x.Id,
            CourseId = x.CourseId,
            StudentId = x.StudentId,
            EnrolledDate = now,
            CreatedAt = now,
            UpdatedAt = null,
            IsDeleted = false
        }));

        Console.WriteLine($"[SEED] Saving to database...");
        await _db.SaveChangesAsync(ct);
        Console.WriteLine($"[SEED] Seed completed successfully!");
    }
}