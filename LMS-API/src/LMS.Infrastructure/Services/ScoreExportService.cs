using LMS.Application.DTOs.Export;
using LMS.Application.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;

namespace LMS.Infrastructure.Services
{
    public class ScoreExportService : IScoreExportService
    {
        private readonly AppDbContext _context;

        public ScoreExportService(AppDbContext context)
        {
            _context = context;
        }

        #region Helper: Safe Filename

        private string ToSafeFileName(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "file";

            string str = input;

            // Manual replacement for strict Vietnamese handling
            string[] patterns = new string[]
            {
                "a|á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ",
                "A|Á|À|Ả|Ã|Ạ|Ă|Ắ|Ằ|Ẳ|Ẵ|Ặ|Â|Ấ|Ầ|Ẩ|Ẫ|Ậ",
                "d|đ",
                "D|Đ",
                "e|é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ",
                "E|É|È|Ẻ|Ẽ|Ẹ|Ê|Ế|Ề|Ể|Ễ|Ệ",
                "i|í|ì|ỉ|ĩ|ị",
                "I|Í|Ì|Ỉ|Ĩ|Ị",
                "o|ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ",
                "O|Ó|Ò|Ỏ|Õ|Ọ|Ô|Ố|Ồ|Ổ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ở|Ỡ|Ợ",
                "u|ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự",
                "U|Ú|Ù|Ủ|Ũ|Ụ|Ư|Ứ|Ừ|Ử|Ữ|Ự",
                "y|ý|ỳ|ỷ|ỹ|ỵ",
                "Y|Ý|Ỳ|Ỷ|Ỹ|Ỵ"
            };

            // Corresponding replacements
            string[] replacements = new string[]
            {
                "a", "A", "d", "D", "e", "E", "i", "I", "o", "O", "u", "U", "y", "Y"
            };

            for (int i = 0; i < patterns.Length; i++)
            {
                str = Regex.Replace(str, patterns[i], replacements[i]);
            }

            // Remove invalid characters (keep alphanumeric, space, underscore, hyphen)
            str = Regex.Replace(str, @"[^a-zA-Z0-9\s\-_]", "");

            // Replace multiple spaces with single underscore
            str = Regex.Replace(str, @"\s+", "_");

            return str.Trim('_');
        }

        #endregion

        #region Quiz Export

        public async Task<ScoreExportDto> GetQuizScoreDataAsync(Guid quizId)
        {
            var quiz = await _context.Quizzes
                .Include(q => q.Chapter)
                    .ThenInclude(ch => ch!.Course)
                        .ThenInclude(c => c!.Semester)
                .Include(q => q.Chapter)
                    .ThenInclude(ch => ch!.Course)
                        .ThenInclude(c => c!.AcademicYear)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
                throw new InvalidOperationException($"Quiz with ID {quizId} not found.");

            var course = quiz.Chapter?.Course;
            var semester = course?.Semester;
            var academicYear = course?.AcademicYear;

            // Enrolled Students
            var enrolledStudents = await _context.CourseStudents
                .Where(cs => cs.CourseId == course!.Id)
                .Include(cs => cs.Student)
                .Select(cs => cs.Student)
                .ToListAsync();

            // Submissions
            var submissions = await _context.QuizSubmissions
                .Where(qs => qs.QuizId == quizId && qs.Status == "Graded")
                .ToListAsync();

            var submissionDict = submissions.ToDictionary(s => s.StudentId, s => s);

            var studentScores = new List<StudentScoreDto>();
            int rowNumber = 1;
            int completedCount = 0;

            foreach (var student in enrolledStudents)
            {
                if (student == null) continue;

                double score = 0;
                if (submissionDict.TryGetValue(student.Id, out var submission))
                {
                    score = submission.Score;
                    completedCount++;
                }

                studentScores.Add(new StudentScoreDto
                {
                    RowNumber = rowNumber++,
                    StudentCode = student.StudentCode ?? "",
                    FullName = student.FullName ?? "",
                    ClassName = course?.Name ?? "",
                    Score = score
                });
            }

            double completionRate = enrolledStudents.Count > 0
                ? Math.Round((double)completedCount / enrolledStudents.Count * 100, 0)
                : 0;

            return new ScoreExportDto
            {
                Header = new ScoreExportHeaderDto
                {
                    SystemName = "HỆ THỐNG HỌC TRỰC TUYẾN NEXTGENLMS",
                    ReportTitle = $"KẾT QUẢ {quiz.Title.ToUpper()} NĂM HỌC {academicYear?.Name ?? "2025-2026"}",
                    ContentTitle = quiz.Title,
                    Semester = $"{semester?.Name ?? "HKI"} {academicYear?.Name ?? "2025-2026"}",
                    CourseName = course?.Name ?? "",
                    CourseCode = course?.CourseCode ?? "",
                    GradingDate = DateTime.UtcNow,
                    TotalStudents = enrolledStudents.Count,
                    CompletionRate = completionRate
                },
                Students = studentScores
            };
        }

        public async Task<(byte[] FileContent, string FileName)> ExportQuizScoresAsync(Guid quizId)
        {
            var data = await GetQuizScoreDataAsync(quizId);
            var pdfBytes = GeneratePdf(data);
            var cleanTitle = ToSafeFileName(data.Header.ContentTitle);
            return (pdfBytes, $"Bang_diem_{cleanTitle}.pdf");
        }

        #endregion

        #region Assignment Export

        public async Task<ScoreExportDto> GetAssignmentScoreDataAsync(Guid assignmentId)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Chapter)
                    .ThenInclude(ch => ch!.Course)
                        .ThenInclude(c => c!.Semester)
                .Include(a => a.Chapter)
                    .ThenInclude(ch => ch!.Course)
                        .ThenInclude(c => c!.AcademicYear)
                .FirstOrDefaultAsync(a => a.Id == assignmentId);

            if (assignment == null)
                throw new InvalidOperationException($"Assignment with ID {assignmentId} not found.");

            var course = assignment.Chapter?.Course;
            var semester = course?.Semester;
            var academicYear = course?.AcademicYear;

            // Enrolled Students
            var enrolledStudents = await _context.CourseStudents
                .Where(cs => cs.CourseId == course!.Id)
                .Include(cs => cs.Student)
                .Select(cs => cs.Student)
                .ToListAsync();

            // Submissions
            var submissions = await _context.EssaySubmissions
                .Where(es => es.QuizSubmission != null)
                .ToListAsync();

            var studentScores = new List<StudentScoreDto>();
            int rowNumber = 1;
            int completedCount = 0;

            foreach (var student in enrolledStudents)
            {
                if (student == null) continue;

                double score = 0;
                // Add submission processing logic later when mapping is clear

                studentScores.Add(new StudentScoreDto
                {
                    RowNumber = rowNumber++,
                    StudentCode = student.StudentCode ?? "",
                    FullName = student.FullName ?? "",
                    ClassName = course?.Name ?? "",
                    Score = score
                });
            }

            double completionRate = enrolledStudents.Count > 0
                ? Math.Round((double)completedCount / enrolledStudents.Count * 100, 0)
                : 0;

            return new ScoreExportDto
            {
                Header = new ScoreExportHeaderDto
                {
                    SystemName = "HỆ THỐNG HỌC TRỰC TUYẾN NEXTGENLMS",
                    ReportTitle = $"KẾT QUẢ {assignment.Title.ToUpper()} NĂM HỌC {academicYear?.Name ?? "2025-2026"}",
                    ContentTitle = assignment.Title,
                    Semester = $"{semester?.Name ?? "HKI"} {academicYear?.Name ?? "2025-2026"}",
                    CourseName = course?.Name ?? "",
                    CourseCode = course?.CourseCode ?? "",
                    GradingDate = DateTime.UtcNow,
                    TotalStudents = enrolledStudents.Count,
                    CompletionRate = completionRate
                },
                Students = studentScores
            };
        }

        public async Task<(byte[] FileContent, string FileName)> ExportAssignmentScoresAsync(Guid assignmentId)
        {
            var data = await GetAssignmentScoreDataAsync(assignmentId);
            var pdfBytes = GeneratePdf(data);
            var cleanTitle = ToSafeFileName(data.Header.ContentTitle);
            return (pdfBytes, $"Bang_diem_{cleanTitle}.pdf");
        }

        #endregion

        #region PDF Generation

        private byte[] GeneratePdf(ScoreExportDto data)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontFamily(Fonts.TimesNewRoman).FontSize(11));

                    page.Header().Element(ComposeHeader);
                    page.Content().Element(ComposeContent);
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.CurrentPageNumber();
                        x.Span(" / ");
                        x.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();

            void ComposeHeader(IContainer container)
            {
                container.Column(column =>
                {
                    // Row 1: System Name & Report Title
                    column.Item().Row(row =>
                    {
                        // Left: System Name (Center alignment relative to itself, but left side of page)
                        row.RelativeItem().Column(col => 
                        {
                            col.Item().AlignCenter().Text(data.Header.SystemName).Bold();
                        });

                        // Right: Report Title & Semester
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().AlignCenter().Text(data.Header.ReportTitle).Bold();
                            col.Item().AlignCenter().Text(data.Header.Semester);
                        });
                    });

                    // Row 2: Course Info & Grading Date (Aligned Horizontally)
                    column.Item().PaddingTop(10).Row(row => 
                    {
                        // Left: Course Name
                        row.RelativeItem().Text($"Học phần: {data.Header.CourseName}");
                        
                        // Right: Grading Date
                        row.RelativeItem().AlignCenter().Text($"Ngày chấm điểm: {data.Header.GradingDate:d/M/yyyy}");
                    });

                    // Row 3: Class Code
                    column.Item().PaddingTop(2).Row(row =>
                    {
                        row.RelativeItem().Text($"Mã lớp học phần: {data.Header.CourseCode}");
                        row.RelativeItem(); // Empty spacer for right side
                    });

                    // Statistics
                    column.Item().PaddingTop(10).Text($"Trang: {data.Header.CurrentPage}");
                    column.Item().PaddingTop(5).Text($"Tổng số sinh viên: {data.Header.TotalStudents}");
                    column.Item().PaddingTop(5).Text($"Tiến độ hoàn thành: {data.Header.CompletionRate}%");
                });
            }

            void ComposeContent(IContainer container)
            {
                container.PaddingTop(10).Table(table =>
                {
                    // Define columns
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(40);  // TT
                        columns.ConstantColumn(100); // MSSV
                        columns.RelativeColumn();    // Ho Ten
                        columns.RelativeColumn();    // Lop
                        columns.ConstantColumn(60);  // Diem
                    });

                    // Header
                    table.Header(header =>
                    {
                        header.Cell().Border(1).Background(Colors.Grey.Lighten3).Padding(5).AlignCenter().Text("TT").Bold();
                        header.Cell().Border(1).Background(Colors.Grey.Lighten3).Padding(5).AlignCenter().Text("Mã số SV").Bold();
                        header.Cell().Border(1).Background(Colors.Grey.Lighten3).Padding(5).AlignCenter().Text("Họ và tên").Bold();
                        header.Cell().Border(1).Background(Colors.Grey.Lighten3).Padding(5).AlignCenter().Text("Lớp").Bold();
                        header.Cell().Border(1).Background(Colors.Grey.Lighten3).Padding(5).AlignCenter().Text("Điểm").Bold();
                    });

                    // Data
                    foreach (var student in data.Students)
                    {
                        table.Cell().Border(1).Padding(5).AlignCenter().Text(student.RowNumber);
                        table.Cell().Border(1).Padding(5).AlignCenter().Text(student.StudentCode);
                        table.Cell().Border(1).Padding(5).AlignLeft().Text(student.FullName);
                        table.Cell().Border(1).Padding(5).AlignLeft().Text(student.ClassName);
                        table.Cell().Border(1).Padding(5).AlignCenter().Text(student.Score.ToString());
                    }
                });
            }
        }

        #endregion
    }
}
