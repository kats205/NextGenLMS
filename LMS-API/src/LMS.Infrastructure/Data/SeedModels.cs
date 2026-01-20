using LMS.Domain.Entities.Assessment;
using LMS.Domain.Entities.Content;

public sealed class SeedDataset
{
    public List<RoleSeed> Roles { get; set; } = new();
    public List<DepartmentSeed> Departments { get; set; } = new();
    public List<MajorSeed> Majors { get; set; } = new();
    public List<AcademicYearSeed> AcademicYears { get; set; } = new();
    public List<SemesterSeed> Semesters { get; set; } = new();
    public List<SystemConfigSeed> SystemConfigs { get; set; } = new();
    public List<UserSeed> Users { get; set; } = new();
    public List<CourseSeed> Courses { get; set; } = new();
    public List<ChapterSeed> Chapters { get; set; } = new();
    public List<ContentSeed> Contents { get; set; } = new();
    public List<QuestionTopicSeed> Topics { get; set; } = new();
    public List<QuestionSeed> Questions { get; set; } = new();
    public List<AnswerSeed> Answers { get; set; } = new();
    public List<QuizQuestionSeed> QuizQuestions { get; set; } = new();
    public List<CourseStudentSeed> CourseStudents { get; set; } = new();
}

// Seed Records
public record RoleSeed(Guid Id, string RoleName, string Description);

public record DepartmentSeed(Guid Id, string Name, string Code);

public record MajorSeed(Guid Id, string Name, Guid DepartmentId);

public record AcademicYearSeed(Guid Id, string Name, DateTime StartDate, DateTime EndDate);

public record SemesterSeed(Guid Id, string Name);

public record SystemConfigSeed(Guid Id, string ConfigKey, string ConfigValue);

public record UserSeed(
    Guid Id,
    string Email,
    string FullName,
    string? Phone,
    Guid RoleId,
    Guid? DepartmentId,
    bool IsFirstLogin,
    bool IsActive,
    string PlainPassword,
    string? StudentCode
);

public record CourseSeed(
    Guid Id,
    string CourseCode,
    string Name,
    string? Description,
    string? ThumbnailUrl,
    Guid SemesterId,
    Guid AcademicYearId,
    Guid MajorId,
    Guid LecturerId
);

public record ChapterSeed(Guid Id, Guid CourseId, string Title, int OrderIndex);

// Content Seed - Base properties for all content types
public record ContentSeed(
    Guid Id,
    Guid ChapterId,
    string Title,
    ContentType Type,
    int OrderIndex,
    // Lesson properties (nullable)
    string? FileUrl,
    string? FileType,
    long? FileSize,
    int? DurationSeconds,
    string? ContentHtml,
    // Quiz properties (nullable)
    DateTime? OpenTime,
    DateTime? CloseTime,
    int? DurationMinutes,
    bool? ShuffleQuestions,
    bool? ShuffleAnswers,
    // Assignment properties (nullable)
    DateTime? DueDate,
    int? MaxScore,
    string? AssignmentDescription
);

public record QuestionTopicSeed(Guid Id, string Name, Guid LecturerId);

public record QuestionSeed(Guid Id, Guid TopicId, string ContentText, string? MediaUrl, QuestionType Type);

public record AnswerSeed(Guid Id, Guid QuestionId, string ContentText, bool IsCorrect);

public record QuizQuestionSeed(Guid Id, Guid QuizId, Guid QuestionId, int Points);

public record CourseStudentSeed(Guid Id, Guid CourseId, Guid StudentId);