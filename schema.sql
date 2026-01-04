
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [AcademicYears] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_AcademicYears] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [AppRoles] (
        [Id] uniqueidentifier NOT NULL,
        [RoleName] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_AppRoles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Departments] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Code] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_Departments] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Questions] (
        [Id] uniqueidentifier NOT NULL,
        [TopicId] uniqueidentifier NOT NULL,
        [ContentText] nvarchar(max) NOT NULL,
        [MediaUrl] nvarchar(max) NULL,
        [Type] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_Questions] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [QuestionTopics] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [LecturerId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_QuestionTopics] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Semesters] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_Semesters] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [SystemConfigs] (
        [Id] uniqueidentifier NOT NULL,
        [ConfigKey] nvarchar(max) NOT NULL,
        [ConfigValue] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_SystemConfigs] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [AppUsers] (
        [Id] uniqueidentifier NOT NULL,
        [Email] nvarchar(max) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [FullName] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NULL,
        [AvatarUrl] nvarchar(max) NULL,
        [Bio] nvarchar(max) NULL,
        [StudentCode] nvarchar(max) NULL,
        [IsFirstLogin] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [RoleId] uniqueidentifier NOT NULL,
        [DepartmentId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_AppUsers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AppUsers_AppRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AppRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AppUsers_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Majors] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [DepartmentId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_Majors] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Majors_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Answers] (
        [Id] uniqueidentifier NOT NULL,
        [QuestionId] uniqueidentifier NOT NULL,
        [ContentText] nvarchar(max) NOT NULL,
        [IsCorrect] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_Answers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Answers_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Courses] (
        [Id] uniqueidentifier NOT NULL,
        [CourseCode] nvarchar(max) NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [ThumbnailUrl] nvarchar(max) NULL,
        [SemesterId] uniqueidentifier NOT NULL,
        [AcademicYearId] uniqueidentifier NOT NULL,
        [MajorId] uniqueidentifier NOT NULL,
        [LecturerId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_Courses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Courses_AcademicYears_AcademicYearId] FOREIGN KEY ([AcademicYearId]) REFERENCES [AcademicYears] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Courses_AppUsers_LecturerId] FOREIGN KEY ([LecturerId]) REFERENCES [AppUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Courses_Majors_MajorId] FOREIGN KEY ([MajorId]) REFERENCES [Majors] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Courses_Semesters_SemesterId] FOREIGN KEY ([SemesterId]) REFERENCES [Semesters] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Chapters] (
        [Id] uniqueidentifier NOT NULL,
        [CourseId] uniqueidentifier NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [OrderIndex] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_Chapters] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Chapters_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [CourseStudents] (
        [Id] uniqueidentifier NOT NULL,
        [CourseId] uniqueidentifier NOT NULL,
        [StudentId] uniqueidentifier NOT NULL,
        [EnrolledDate] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_CourseStudents] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CourseStudents_AppUsers_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [AppUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CourseStudents_Courses_CourseId] FOREIGN KEY ([CourseId]) REFERENCES [Courses] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [CourseContents] (
        [Id] uniqueidentifier NOT NULL,
        [ChapterId] uniqueidentifier NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [Type] int NOT NULL,
        [OrderIndex] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_CourseContents] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CourseContents_Chapters_ChapterId] FOREIGN KEY ([ChapterId]) REFERENCES [Chapters] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Assignments] (
        [Id] uniqueidentifier NOT NULL,
        [DueDate] datetime2 NULL,
        [MaxScore] int NOT NULL,
        [Description] nvarchar(max) NULL,
        CONSTRAINT [PK_Assignments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Assignments_CourseContents_Id] FOREIGN KEY ([Id]) REFERENCES [CourseContents] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Lessons] (
        [Id] uniqueidentifier NOT NULL,
        [FileUrl] nvarchar(max) NULL,
        [FileType] nvarchar(max) NULL,
        [FileSize] bigint NOT NULL,
        [DurationSeconds] int NOT NULL,
        [ContentHtml] nvarchar(max) NULL,
        CONSTRAINT [PK_Lessons] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Lessons_CourseContents_Id] FOREIGN KEY ([Id]) REFERENCES [CourseContents] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [Quizzes] (
        [Id] uniqueidentifier NOT NULL,
        [OpenTime] datetime2 NULL,
        [CloseTime] datetime2 NULL,
        [DurationMinutes] int NOT NULL,
        [ShuffleQuestions] bit NOT NULL,
        CONSTRAINT [PK_Quizzes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Quizzes_CourseContents_Id] FOREIGN KEY ([Id]) REFERENCES [CourseContents] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [LessonProgresses] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [LessonId] uniqueidentifier NOT NULL,
        [IsCompleted] bit NOT NULL,
        [LastAccess] datetime2 NOT NULL,
        [VideoProgressSeconds] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_LessonProgresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LessonProgresses_AppUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AppUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_LessonProgresses_Lessons_LessonId] FOREIGN KEY ([LessonId]) REFERENCES [Lessons] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [QuizQuestions] (
        [Id] uniqueidentifier NOT NULL,
        [QuizId] uniqueidentifier NOT NULL,
        [QuestionId] uniqueidentifier NOT NULL,
        [Points] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_QuizQuestions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_QuizQuestions_Questions_QuestionId] FOREIGN KEY ([QuestionId]) REFERENCES [Questions] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_QuizQuestions_Quizzes_QuizId] FOREIGN KEY ([QuizId]) REFERENCES [Quizzes] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE TABLE [QuizSubmissions] (
        [Id] uniqueidentifier NOT NULL,
        [QuizId] uniqueidentifier NOT NULL,
        [StudentId] uniqueidentifier NOT NULL,
        [StartTime] datetime2 NOT NULL,
        [EndTime] datetime2 NULL,
        [Score] float NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [TempData] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsDeleted] bit NOT NULL,
        CONSTRAINT [PK_QuizSubmissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_QuizSubmissions_AppUsers_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [AppUsers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_QuizSubmissions_Quizzes_QuizId] FOREIGN KEY ([QuizId]) REFERENCES [Quizzes] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Answers_QuestionId] ON [Answers] ([QuestionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AppUsers_DepartmentId] ON [AppUsers] ([DepartmentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AppUsers_RoleId] ON [AppUsers] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Chapters_CourseId] ON [Chapters] ([CourseId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CourseContents_ChapterId] ON [CourseContents] ([ChapterId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Courses_AcademicYearId] ON [Courses] ([AcademicYearId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Courses_LecturerId] ON [Courses] ([LecturerId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Courses_MajorId] ON [Courses] ([MajorId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Courses_SemesterId] ON [Courses] ([SemesterId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_CourseStudents_CourseId_StudentId] ON [CourseStudents] ([CourseId], [StudentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CourseStudents_StudentId] ON [CourseStudents] ([StudentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_LessonProgresses_LessonId] ON [LessonProgresses] ([LessonId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_LessonProgresses_UserId] ON [LessonProgresses] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Majors_DepartmentId] ON [Majors] ([DepartmentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_QuizQuestions_QuestionId] ON [QuizQuestions] ([QuestionId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_QuizQuestions_QuizId] ON [QuizQuestions] ([QuizId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_QuizSubmissions_QuizId] ON [QuizSubmissions] ([QuizId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_QuizSubmissions_StudentId] ON [QuizSubmissions] ([StudentId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104152034_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260104152034_InitialCreate', N'8.0.22');
END;
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104154346_UpdateQuizSchema'
)
BEGIN
    ALTER TABLE [Quizzes] ADD [ShuffleAnswers] bit NOT NULL DEFAULT CAST(0 AS bit);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260104154346_UpdateQuizSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260104154346_UpdateQuizSchema', N'8.0.22');
END;
GO

COMMIT;
GO

