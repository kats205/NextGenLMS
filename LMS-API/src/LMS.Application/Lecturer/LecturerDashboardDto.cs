using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Application.Lecturer
{
    public class LecturerDashboardDto
    {
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public int TotalLessons { get; set; }
        public int TotalQuizzes { get; set; }
        public int PendingGrading { get; set; }

        // Recent activity
        public List<CourseDto> RecentCourses { get; set; } = new();
        public List<QuizSubmissionDto> RecentSubmissions { get; set; } = new();
    }
}
