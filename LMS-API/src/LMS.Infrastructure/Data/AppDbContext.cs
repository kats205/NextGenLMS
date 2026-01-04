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

        // Users
        public DbSet<AppUser> AppUsers { get; set; } // Renamed to avoid reserved keyword Users collision if needed
        public DbSet<AppRole> AppRoles { get; set; }

        // Courses
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseStudent> CourseStudents { get; set; }
        public DbSet<Chapter> Chapters { get; set; }

        // Content (TPT)
        public DbSet<CourseContent> CourseContents { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Assignment> Assignments { get; set; }

        // Assessment
        public DbSet<QuestionTopic> QuestionTopics { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<QuizQuestion> QuizQuestions { get; set; }
        public DbSet<LessonProgress> LessonProgresses { get; set; }
        public DbSet<QuizSubmission> QuizSubmissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // TPT Configuration for CourseContent
            modelBuilder.Entity<CourseContent>().UseTptMappingStrategy();

            // CourseStudent Composite Key or Index configuration if needed
            // But we used BaseEntity which has Id, so it's fine. 
            // Better to enforce uniqueness:
            modelBuilder.Entity<CourseStudent>()
                .HasIndex(cs => new { cs.CourseId, cs.StudentId })
                .IsUnique();
            
            // Relationships
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Lecturer)
                .WithMany(u => u.ManagedCourses)
                .HasForeignKey(c => c.LecturerId)
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
        }
    }
}
