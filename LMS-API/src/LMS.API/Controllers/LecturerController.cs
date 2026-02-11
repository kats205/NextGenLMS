using LMS.Application.Lecturer;
using LMS.Application.Interfaces;
using LMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LMS.Application.Common;

namespace LMS.API.Controllers
{
    [Route("api/lecturer")]
    [ApiController] 
    [Authorize(Roles = "Lecturer")]
    public class LecturerController : ControllerBase
    {
        private readonly ILecturerService _lecturerService;
        private readonly IFileStorageService _fileStorageService;

        public LecturerController(ILecturerService lecturerService, IFileStorageService fileStorageService)
        {
            _lecturerService = lecturerService;
            _fileStorageService = fileStorageService;
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

                return Ok(new ApiResponse<PaginatedResponse<Application.Lecturer.CourseDto>>
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

                return Ok(new ApiResponse<Application.Lecturer.CourseDto>
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
                    new ApiResponse<Application.Lecturer.CourseDto>
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

                return Ok(new ApiResponse<Application.Lecturer.CourseDto>
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
        // ========== CHAPTERS ==========

        [HttpGet("courses/{courseId}/chapters")]
        public async Task<IActionResult> GetChaptersByCourse(Guid courseId)
        {
            try
            {
                var chapters = await _lecturerService.GetChaptersByCourseAsync(courseId);

                return Ok(new ApiResponse<List<Application.Lecturer.ChapterDto>>
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

                return Ok(new ApiResponse<Application.Lecturer.ChapterDto>
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
                    new ApiResponse<Application.Lecturer.ChapterDto>
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

                return Ok(new ApiResponse<Application.Lecturer.ChapterDto>
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

        [HttpGet("chapters/{chapterId}/quizzes")]
        public async Task<IActionResult> GetQuizzesByChapter(Guid chapterId)
        {
            try
            {
                var quizzes = await _lecturerService.GetQuizzesByChapterAsync(chapterId);

                return Ok(new ApiResponse<List<Application.Lecturer.QuizDto>>
                {
                    Success = true,
                    Data = quizzes
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách bài kiểm tra",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("courses/{courseId}/quizzes")]
        public async Task<IActionResult> GetQuizzesByCourse(Guid courseId)
        {
            try
            {
                var quizzes = await _lecturerService.GetQuizzesByCourseAsync(courseId);

                return Ok(new ApiResponse<List<Application.Lecturer.QuizDto>>
                {
                    Success = true,
                    Data = quizzes
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách bài kiểm tra của khóa học",
                    Errors = ex.Message
                });
            }
        }
            [HttpGet("courses/{courseId}/submissions")]
            public async Task<IActionResult> GetSubmissionsByCourse(Guid courseId)
            {
                try
                {
                    var submissions = await _lecturerService.GetSubmissionsByCourseAsync(courseId);

                    return Ok(new ApiResponse<List<Application.Lecturer.QuizSubmissionDto>>
                    {
                        Success = true,
                        Data = submissions
                    });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Lỗi khi tải danh sách bài nộp",
                        Errors = ex.Message
                    });
                }
            }

            [HttpGet("courses/{courseId}/report")]
            public async Task<IActionResult> GetCourseReport(Guid courseId)
            {
                try
                {
                    var report = await _lecturerService.GetCourseReportAsync(courseId);

                    return Ok(new ApiResponse<LecturerCourseReportDto>
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
                        Message = "Lỗi khi tải báo cáo khóa học",
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

                return Ok(new ApiResponse<Application.Lecturer.QuizDto>
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

                return Ok(new ApiResponse<Application.Lecturer.QuizDto>
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

        [HttpPut("quizzes/{id}")]
        public async Task<IActionResult> UpdateQuiz(Guid id, [FromBody] UpdateQuizDto dto)
        {
            try
            {
                var quiz = await _lecturerService.UpdateQuizAsync(id, dto);

                return Ok(new ApiResponse<Application.Lecturer.QuizDto>
                {
                    Success = true,
                    Message = "Cập nhật quiz thành công",
                    Data = quiz
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi cập nhật quiz",
                    Errors = ex.Message
                });
            }
        }

        [HttpPost("quizzes/{quizId}/add-questions")]
        public async Task<IActionResult> AddQuestionsToQuiz(Guid quizId, [FromBody] AddQuestionsToQuizDto dto)
        {
            try
            {
                // Ensure quizId matches
                if (quizId != dto.QuizId && dto.QuizId != Guid.Empty)
                {
                    return BadRequest(new ApiResponse<object> { Success = false, Message = "Quiz ID mismatch" });
                }

                await _lecturerService.AddQuestionsToQuizAsync(quizId, dto.Questions);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Thêm câu hỏi vào đề thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi thêm câu hỏi",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("quizzes/{quizId}/questions")]
        public async Task<IActionResult> GetQuestionsByQuiz(Guid quizId)
        {
            try
            {
                var questions = await _lecturerService.GetQuestionsByQuizAsync(quizId);
                return Ok(new ApiResponse<List<Application.Lecturer.QuizQuestionDto>>
                {
                    Success = true,
                    Data = questions
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách câu hỏi",
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

        [HttpPut("questions/{id}")]
        public async Task<IActionResult> UpdateQuestion(Guid id, [FromBody] UpdateQuestionDto dto)
        {
            try 
            {
                var question = await _lecturerService.UpdateQuestionAsync(id, dto);
                return Ok(new ApiResponse<QuestionDto>
                {
                    Success = true,
                    Message = "Cập nhật câu hỏi thành công",
                    Data = question
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi cập nhật câu hỏi",
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("questions/{id}")]
        public async Task<IActionResult> DeleteQuestion(Guid id)
        {
            try
            {
                await _lecturerService.DeleteQuestionAsync(id);
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa câu hỏi thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi xóa câu hỏi",
                    Errors = ex.Message
                });
            }
        }

        //========== STUDENTS ==========
        [HttpGet("courses/{courseId}/students")]
        public async Task<IActionResult> GetStudentsByCourse(Guid courseId, [FromQuery] int page = 1, [FromQuery] int limit = 100)
        {
            try
            {
                var pagination = new PaginationDto { Page = page, Limit = limit };
                var result = await _lecturerService.GetStudentsByCourseAsync(courseId, pagination);

                return Ok(new ApiResponse<PaginatedResponse<StudentDto>>
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
                    Message = "Lỗi khi tải danh sách sinh viên",
                    Errors = ex.Message
                });
            }
        }
        [HttpGet("courses/{courseId}/students/{studentId}/detail")]
        public async Task<IActionResult> GetStudentDetail(Guid courseId, Guid studentId)
        {
            try
            {
                var result = await _lecturerService.GetStudentCourseDetailAsync(courseId, studentId);

                return Ok(new ApiResponse<StudentDetailReportDto>
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
                    Message = "Lỗi khi tải chi tiết sinh viên",
                    Errors = ex.Message
                });
            }
        }

        [HttpPost("courses/{courseId}/students")]
        public async Task<IActionResult> EnrollStudent(Guid courseId, [FromBody] Application.Lecturer.EnrollStudentDto dto)
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
        //========== ASSIGNMENTS ==========

        [HttpGet("chapters/{chapterId}/assignments")]
        public async Task<IActionResult> GetAssignmentsByChapter(Guid chapterId)
        {
            try
            {
                var assignments = await _lecturerService.GetAssignmentsByChapterAsync(chapterId);

                return Ok(new ApiResponse<List<AssignmentDto>>
                {
                    Success = true,
                    Data = assignments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách bài tập",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("courses/{courseId}/assignments")]
        public async Task<IActionResult> GetAssignmentsByCourse(Guid courseId)
        {
            try
            {
                var assignments = await _lecturerService.GetAssignmentsByCourseAsync(courseId);

                return Ok(new ApiResponse<List<AssignmentDto>>
                {
                    Success = true,
                    Data = assignments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách bài tập của khóa học",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("assignments/{id}")]
        public async Task<IActionResult> GetAssignmentById(Guid id)
        {
            try
            {
                var assignment = await _lecturerService.GetAssignmentByIdAsync(id);

                return Ok(new ApiResponse<AssignmentDto>
                {
                    Success = true,
                    Data = assignment
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

        [HttpPost("assignments")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            try
            {
                var assignment = await _lecturerService.CreateAssignmentAsync(dto);

                return Ok(new ApiResponse<AssignmentDto>
                {
                    Success = true,
                    Message = "Tạo bài tập thành công",
                    Data = assignment
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tạo bài tập",
                    Errors = ex.Message
                });
            }
        }

        [HttpPut("assignments/{id}")]
        public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
        {
            try
            {
                var assignment = await _lecturerService.UpdateAssignmentAsync(id, dto);

                return Ok(new ApiResponse<AssignmentDto>
                {
                    Success = true,
                    Message = "Cập nhật bài tập thành công",
                    Data = assignment
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi cập nhật bài tập",
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("assignments/{id}")]
        public async Task<IActionResult> DeleteAssignment(Guid id)
        {
            try
            {
                await _lecturerService.DeleteAssignmentAsync(id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa bài tập thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi xóa bài tập",
                    Errors = ex.Message
                });
            }
        }

        //========== ANNOUNCEMENTS ==========

        [HttpGet("chapters/{chapterId}/announcements")]
        public async Task<IActionResult> GetAnnouncementsByChapter(Guid chapterId)
        {
            try
            {
                var announcements = await _lecturerService.GetAnnouncementsByChapterAsync(chapterId);

                return Ok(new ApiResponse<List<AnnouncementDto>>
                {
                    Success = true,
                    Data = announcements
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách thông báo",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("courses/{courseId}/announcements")]
        public async Task<IActionResult> GetAnnouncementsByCourse(Guid courseId)
        {
            try
            {
                var announcements = await _lecturerService.GetAnnouncementsByCourseAsync(courseId);

                return Ok(new ApiResponse<List<AnnouncementDto>>
                {
                    Success = true,
                    Data = announcements
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tải danh sách thông báo của khóa học",
                    Errors = ex.Message
                });
            }
        }

        [HttpGet("announcements/{id}")]
        public async Task<IActionResult> GetAnnouncementById(Guid id)
        {
            try
            {
                var announcement = await _lecturerService.GetAnnouncementByIdAsync(id);

                return Ok(new ApiResponse<AnnouncementDto>
                {
                    Success = true,
                    Data = announcement
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

        [HttpPost("announcements")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementDto dto)
        {
            try
            {
                var announcement = await _lecturerService.CreateAnnouncementAsync(dto);

                return Ok(new ApiResponse<AnnouncementDto>
                {
                    Success = true,
                    Message = "Tạo thông báo thành công",
                    Data = announcement
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi tạo thông báo",
                    Errors = ex.Message
                });
            }
        }

        [HttpPut("announcements/{id}")]
        public async Task<IActionResult> UpdateAnnouncement(Guid id, [FromBody] UpdateAnnouncementDto dto)
        {
            try
            {
                var announcement = await _lecturerService.UpdateAnnouncementAsync(id, dto);

                return Ok(new ApiResponse<AnnouncementDto>
                {
                    Success = true,
                    Message = "Cập nhật thông báo thành công",
                    Data = announcement
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi cập nhật thông báo",
                    Errors = ex.Message
                });
            }
        }

        [HttpDelete("announcements/{id}")]
        public async Task<IActionResult> DeleteAnnouncement(Guid id)
        {
            try
            {
                await _lecturerService.DeleteAnnouncementAsync(id);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Xóa thông báo thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi xóa thông báo",
                    Errors = ex.Message
                });
            }
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFile([FromForm] UploadFileRequest request)
        {
            try
            {
                var file = request.File;
                var type = request.Type;

                if (file == null || file.Length == 0)
                    return BadRequest("Vui lòng chọn file");

                var extension = Path.GetExtension(file.FileName).ToLower();
                string folderName = "documents/other";

                if (extension == ".pdf")
                    folderName = "documents/pdf";
                else if (new[] { ".doc", ".docx" }.Contains(extension))
                    folderName = "documents/word";
                else if (new[] { ".xls", ".xlsx" }.Contains(extension))
                    folderName = "documents/excel";
                else if (new[] { ".ppt", ".pptx" }.Contains(extension))
                    folderName = "documents/ppt";
                else if (new[] { ".mp4", ".mov", ".avi", ".mkv", ".webm" }.Contains(extension))
                    folderName = "video";
                else if (new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" }.Contains(extension))
                    folderName = "image";
                else if (new[] { ".zip", ".rar", ".7z" }.Contains(extension))
                    folderName = "documents/archive";

                var fileUrl = await _fileStorageService.UploadFileAsync(file, folderName);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Upload file thành công",
                    Data = new { url = fileUrl }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi khi upload file",
                    Errors = ex.Message
                });
            }
        }
    }
}
