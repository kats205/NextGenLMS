using LMS.Application.Lecturer;
using LMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LMS.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize(Roles = "lecturer")]
    public class LecturerController : ControllerBase
    {
        private readonly ILecturerService _lecturerService;

        public LecturerController(ILecturerService lecturerService)
        {
            _lecturerService = lecturerService;
        }

        private Guid GetCurrentLecturerId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User ID not found in token");

            return Guid.Parse(userId);
        }

        // ========== DASHBOARD ==========

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var lecturerId = GetCurrentLecturerId();
                var dashboard = await _lecturerService.GetDashboardAsync(lecturerId);

                return Ok(new ApiResponse<LecturerDashboardDto>
                {
                    Success = true,
                    Message = "Dashboard loaded successfully",
                    Data = dashboard
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải dashboard",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("debug/claims")]
        public IActionResult DebugClaims()
        {
            return Ok(User.Claims.Select(c => new { c.Type, c.Value }));
        }

        // ========== COURSES ==========

        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses([FromQuery] CourseFilterDto filter)
        {
            try
            {
                var lecturerId = GetCurrentLecturerId();
                var result = await _lecturerService.GetCoursesAsync(lecturerId, filter);

                return Ok(new ApiResponse<PaginatedResponse<CourseDto>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách khóa học",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("courses/{id}")]
        public async Task<IActionResult> GetCourseById(Guid id)
        {
            try
            {
                var course = await _lecturerService.GetCourseByIdAsync(id);

                return Ok(new ApiResponse<CourseDto>
                {
                    Success = true,
                    Data = course
                });
            }
            catch (Exception ex)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDtoLecturer dto)
        {
            try
            {
                var lecturerId = GetCurrentLecturerId();
                var course = await _lecturerService.CreateCourseAsync(lecturerId, dto);

                return CreatedAtAction(nameof(GetCourseById), new { id = course.Id },
                    new ApiResponse<CourseDto>
                    {
                        Success = true,
                        Message = "Tạo khóa học thành công",
                        Data = course
                    });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tạo khóa học",
                    Errors = ex.Message
                });
            }
        }

        [HttpPut("courses/{id}")]
        public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] UpdateCourseDtoLecturer dto)
        {
            try
            {
                var course = await _lecturerService.UpdateCourseAsync(id, dto);

                return Ok(new ApiResponse<CourseDto>
                {
                    Success = true,
                    Message = "Cập nhật khóa học thành công",
                    Data = course
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi cập nhật khóa học",
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("courses/{id}")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            try
            {
                await _lecturerService.DeleteCourseAsync(id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa khóa học thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi xóa khóa học",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("courses/{id}/report")]
        public async Task<IActionResult> GetCourseReport(Guid id)
        {
            try
            {
                var report = await _lecturerService.GetCourseReportAsync(id);

                return Ok(new ApiResponse<CourseReportDto>
                {
                    Success = true,
                    Data = report
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải báo cáo",
                    Errors = ex.Message
                });
            }
        }

        // ========== CHAPTERS ==========

        [HttpGet("courses/{courseId}/chapters")]
        public async Task<IActionResult> GetChaptersByCourse(Guid courseId)
        {
            try
            {
                var chapters = await _lecturerService.GetChaptersByCourseAsync(courseId);

                return Ok(new ApiResponse<List<ChapterDto>>
                {
                    Success = true,
                    Data = chapters
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách chương",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("chapters/{id}")]
        public async Task<IActionResult> GetChapterById(Guid id)
        {
            try
            {
                var chapter = await _lecturerService.GetChapterByIdAsync(id);

                return Ok(new ApiResponse<ChapterDto>
                {
                    Success = true,
                    Data = chapter
                });
            }
            catch (Exception ex)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("chapters")]
        public async Task<IActionResult> CreateChapter([FromBody] CreateChapterDto dto)
        {
            try
            {
                var chapter = await _lecturerService.CreateChapterAsync(dto);

                return CreatedAtAction(nameof(GetChapterById), new { id = chapter.Id },
                    new ApiResponse<ChapterDto>
                    {
                        Success = true,
                        Message = "Tạo chương thành công",
                        Data = chapter
                    });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tạo chương",
                    Errors = ex.Message
                });
            }
        }

        [HttpPut("chapters/{id}")]
        public async Task<IActionResult> UpdateChapter(Guid id, [FromBody] UpdateChapterDto dto)
        {
            try
            {
                var chapter = await _lecturerService.UpdateChapterAsync(id, dto);

                return Ok(new ApiResponse<ChapterDto>
                {
                    Success = true,
                    Message = "Cập nhật chương thành công",
                    Data = chapter
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi cập nhật chương",
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("chapters/{id}")]
        public async Task<IActionResult> DeleteChapter(Guid id)
        {
            try
            {
                await _lecturerService.DeleteChapterAsync(id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa chương thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi xóa chương",
                    Errors = ex.Message
                });
            }
        }

        [HttpPut("courses/{courseId}/chapters/reorder")]
        public async Task<IActionResult> ReorderChapters(Guid courseId, [FromBody] ReorderDto dto)
        {
            try
            {
                await _lecturerService.ReorderChaptersAsync(courseId, dto.Ids);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Sắp xếp chương thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi sắp xếp chương",
                    Errors = ex.Message
                });
            }
        }

        // ========== LESSONS ==========

        [HttpGet("chapters/{chapterId}/lessons")]
        public async Task<IActionResult> GetLessonsByChapter(Guid chapterId)
        {
            try
            {
                var lessons = await _lecturerService.GetLessonsByChapterAsync(chapterId);

                return Ok(new ApiResponse<List<LessonDto>>
                {
                    Success = true,
                    Data = lessons
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách bài giảng",
                    Errors = ex.Message
                });
            }
        }

        //========== LESSONS ==========

        [HttpGet("lessons/{id}")]
        public async Task<IActionResult> GetLessonById(Guid id)
        {
            try
            {
                var lesson = await _lecturerService.GetLessonByIdAsync(id);

                return Ok(new ApiResponse<LessonDto>
                {
                    Success = true,
                    Data = lesson
                });
            }
            catch (Exception ex)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("lessons")]
        public async Task<IActionResult> CreateLesson([FromBody] CreateLessonDto dto)
        {
            try
            {
                var lesson = await _lecturerService.CreateLessonAsync(dto);

                return Ok(new ApiResponse<LessonDto>
                {
                    Success = true,
                    Message = "Tạo bài giảng thành công",
                    Data = lesson
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tạo bài giảng",
                    Errors = ex.Message
                });
            }
        }

        [HttpPut("lessons/{id}")]
        public async Task<IActionResult> UpdateLesson(Guid id, [FromBody] UpdateLessonDto dto)
        {
            try
            {
                var lesson = await _lecturerService.UpdateLessonAsync(id, dto);

                return Ok(new ApiResponse<LessonDto>
                {
                    Success = true,
                    Message = "Cập nhật bài giảng thành công",
                    Data = lesson
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi cập nhật bài giảng",
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("lessons/{id}")]
        public async Task<IActionResult> DeleteLesson(Guid id)
        {
            try
            {
                await _lecturerService.DeleteLessonAsync(id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa bài giảng thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi xóa bài giảng",
                    Errors = ex.Message
                });
            }
        }

        //========== QUIZZES ==========

        [HttpGet("quizzes/{id}")]
        public async Task<IActionResult> GetQuizById(Guid id)
        {
            try
            {
                var quiz = await _lecturerService.GetQuizByIdAsync(id);

                return Ok(new ApiResponse<QuizDto>
                {
                    Success = true,
                    Data = quiz
                });
            }
            catch (Exception ex)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("quizzes")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto dto)
        {
            try
            {
                var quiz = await _lecturerService.CreateQuizAsync(dto);

                return Ok(new ApiResponse<QuizDto>
                {
                    Success = true,
                    Message = "Tạo quiz thành công",
                    Data = quiz
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tạo quiz",
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("quizzes/{id}")]
        public async Task<IActionResult> DeleteQuiz(Guid id)
        {
            try
            {
                await _lecturerService.DeleteQuizAsync(id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa quiz thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi xóa quiz",
                    Errors = ex.Message
                });
            }
        }

        //========== QUESTION TOPICS & QUESTIONS ==========
        [HttpGet("question-topics")]
        public async Task<IActionResult> GetQuestionTopics()
        {
            try
            {
                var lecturerId = GetCurrentLecturerId();
                var topics = await _lecturerService.GetQuestionTopicsAsync(lecturerId);

                return Ok(new ApiResponse<List<QuestionTopicDto>>
                {
                    Success = true,
                    Data = topics
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPost("question-topics")]
        public async Task<IActionResult> CreateQuestionTopic([FromBody] CreateQuestionTopicDto dto)
        {
            try
            {
                var lecturerId = GetCurrentLecturerId();
                var topic = await _lecturerService.CreateQuestionTopicAsync(lecturerId, dto);

                return Ok(new ApiResponse<QuestionTopicDto>
                {
                    Success = true,
                    Message = "Tạo chủ đề câu hỏi thành công",
                    Data = topic
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("question-topics/{id}")]
        public async Task<IActionResult> DeleteQuestionTopic(Guid id)
        {
            try
            {
                await _lecturerService.DeleteQuestionTopicAsync(id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa chủ đề thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("question-topics/{topicId}/questions")]
        public async Task<IActionResult> GetQuestionsByTopic(Guid topicId)
        {
            var questions = await _lecturerService.GetQuestionsByTopicAsync(topicId);
            return Ok(new ApiResponse<List<QuestionDto>>
            {
                Success = true,
                Data = questions
            });
        }

        [HttpPost("questions")]
        public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionDto dto)
        {
            var question = await _lecturerService.CreateQuestionAsync(dto);
            return Ok(new ApiResponse<QuestionDto>
            {
                Success = true,
                Message = "Tạo câu hỏi thành công",
                Data = question
            });
        }

        //========== STUDENTS ==========
        [HttpPost("courses/{courseId}/students")]
        public async Task<IActionResult> EnrollStudent(Guid courseId, [FromBody] EnrollStudentDto dto)
        {
            await _lecturerService.EnrollStudentAsync(courseId, dto.StudentEmail);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Thêm sinh viên thành công"
            });
        }

        [HttpDelete("courses/{courseId}/students/{studentId}")]
        public async Task<IActionResult> RemoveStudent(Guid courseId, Guid studentId)
        {
            await _lecturerService.RemoveStudentAsync(courseId, studentId);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Xóa sinh viên khỏi khóa học thành công"
            });
        }


        // ========== FILE UPLOAD ==========

        //[HttpPost("upload")]
        //[Consumes("multipart/form-data")]
        //public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
        //{
        //    if (request.File == null || request.File.Length == 0)
        //        return BadRequest(new ApiResponse<object>
        //        {
        //            Success = false,
        //            Message = "File không hợp lệ"
        //        });

        //    var url = await _lecturerService.UploadFileAsync(request.File, request.Type);

        //    return Ok(new ApiResponse<object>
        //    {
        //        Success = true,
        //        Message = "Upload file thành công",
        //        Data = new { Url = url }
        //    });
        //}
    }
}
