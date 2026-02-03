using Microsoft.EntityFrameworkCore;
using LMS.Domain.Entities.System;
using LMS.Domain.Entities.Users;
using LMS.Domain.Entities.Courses;
using LMS.Domain.Entities.Content;
using LMS.Domain.Entities.Assessment;

namespace LMS.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // System
        public DbSet<Department> Departments { get; set; }
        public DbSet<Major> Majors { get; set; }
        public DbSet<AcademicYear> AcademicYears { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        public DbSet<SystemConfig> SystemConfigs { get; set; }
        
        // Logs
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        
        // Notifications
        public DbSet<EmailTemplate> EmailTemplates { get; set; }
        public DbSet<EmailQueue> EmailQueues { get; set; }
        public DbSet<EmailLog> EmailLogs { get; set; }

        // Users
        public DbSet<AppUser> AppUsers { get; set; } 
        public DbSet<AppRole> AppRoles { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        // Courses
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseStudent> CourseStudents { get; set; }
        public DbSet<CourseLecturer> CourseLecturers { get; set; }
        public DbSet<Chapter> Chapters { get; set; }

        // Content (TPT)
        public DbSet<CourseContent> CourseContents { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Announcement> Announcements { get; set; }

        // Assessment
        public DbSet<QuestionTopic> QuestionTopics { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<LessonProgress> LessonProgresses { get; set; }
        public DbSet<QuizSubmission> QuizSubmissions { get; set; }

        // Assignment - không cần thêm DbSet vì sử dụng EssaySubmission có sẵn
        // Sẽ sử dụng EssaySubmission để lưu bài nộp assignment
        public DbSet<AttemptQuestionSnapshot> AttemptQuestionSnapshots { get; set; }
        public DbSet<EssaySubmission> EssaySubmissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // TPT Configuration for CourseContent
            modelBuilder.Entity<CourseContent>().UseTptMappingStrategy();

            // CourseStudent Composite Key
            modelBuilder.Entity<CourseStudent>()
                .HasIndex(cs => new { cs.CourseId, cs.StudentId })
                .IsUnique();
            
            // CourseLecturer Composite Key
            modelBuilder.Entity<CourseLecturer>()
                .HasIndex(cl => new { cl.CourseId, cl.LecturerId })
                .IsUnique();

            // Relationships
            
            // Course - Lecturer Many-to-Many
            modelBuilder.Entity<CourseLecturer>()
                .HasOne(cl => cl.Course)
                .WithMany(c => c.Lecturers)
                .HasForeignKey(cl => cl.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CourseLecturer>()
                .HasOne(cl => cl.Lecturer)
                .WithMany(u => u.CoLecturedCourses)
                .HasForeignKey(cl => cl.LecturerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CourseStudent>()
                .HasOne(cs => cs.Student)
                .WithMany(u => u.EnrolledCourses)
                .HasForeignKey(cs => cs.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

             modelBuilder.Entity<LessonProgress>()
                .HasOne(lp => lp.User)
                .WithMany(u => u.LessonProgresses)
                .HasForeignKey(lp => lp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Assignment relationships - sử dụng EssaySubmission thay vì AssignmentSubmission
            // Không cần thêm relationship vì sử dụng bảng có sẵn
                
            modelBuilder.Entity<AttemptQuestionSnapshot>()
                .HasOne(s => s.QuizSubmission)
                .WithMany(qs => qs.Snapshots)
                .HasForeignKey(s => s.QuizSubmissionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
