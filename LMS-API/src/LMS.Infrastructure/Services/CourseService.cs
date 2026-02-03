using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Constant;
using LMS.Domain.Entities.Courses;
using LMS.Domain.Entities.Content;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using static LMS.Application.Common.ServiceResult;

namespace LMS.Infrastructure.Services
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;
        private readonly IFileStorageService _fileStorageService;

        public CourseService(AppDbContext context, IFileStorageService fileStorageService)
        {
            _context = context;
            _fileStorageService = fileStorageService;
        }

        public async Task<ServiceResult<CourseDto>> CreateCourseAsync(CreateCourseDto createDto, Guid currentUserId)
        {
            try
            {
                var currentUser = await _context.AppUsers
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == currentUserId);

                if (currentUser?.Role?.RoleName != UserRoles.Admin && currentUser?.Role?.RoleName != UserRoles.Lecturer)
                {
                    return ServiceResult<CourseDto>.Failure("Bạn không có quyền tạo khóa học");
                }

                var existingCourse = await _context.Courses
                    .FirstOrDefaultAsync(c => c.CourseCode == createDto.CourseCode && !c.IsDeleted);

                if (existingCourse != null)
                {
                    return ServiceResult<CourseDto>.Failure("Mã khóa học đã tồn tại");
                }

                var course = new Course
                {
                    CourseCode = createDto.CourseCode,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    ThumbnailUrl = createDto.ThumbnailUrl,
                    SemesterId = createDto.SemesterId,
                    AcademicYearId = createDto.AcademicYearId,
                    MajorId = createDto.MajorId
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                if (createDto.LecturerIds?.Any() == true)
                {
                    var lecturers = await _context.AppUsers
                        .Include(u => u.Role)
                        .Where(u => createDto.LecturerIds.Contains(u.Id) && u.Role!.RoleName == UserRoles.Lecturer)
                        .ToListAsync();

                    var courseLecturers = lecturers.Select((lecturer, index) => new CourseLecturer
                    {
                        CourseId = course.Id,
                        LecturerId = lecturer.Id,
                        IsPrimary = index == 0
                    }).ToList();

                    _context.Set<CourseLecturer>().AddRange(courseLecturers);
                    await _context.SaveChangesAsync();
                }

                var courseDto = await GetCourseDtoAsync(course.Id);
                return ServiceResult<CourseDto>.Success(courseDto, "Tạo khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDto>.Failure("Có lỗi xảy ra khi tạo khóa học", ex.Message);
            }
        }

        public async Task<ServiceResult<CourseDto>> UpdateCourseAsync(Guid courseId, UpdateCourseDto updateDto, Guid currentUserId)
        {
            try
            {
                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

                if (course == null)
                {
                    return ServiceResult<CourseDto>.Failure("Không tìm thấy khóa học");
                }

                if (!await CanUserManageCourseAsync(courseId, currentUserId))
                {
                    return ServiceResult<CourseDto>.Failure("Bạn không có quyền chỉnh sửa khóa học này");
                }

                course.CourseCode = updateDto.CourseCode;
                course.Name = updateDto.Name;
                course.Description = updateDto.Description;
                course.ThumbnailUrl = updateDto.ThumbnailUrl;
                course.SemesterId = updateDto.SemesterId;
                course.AcademicYearId = updateDto.AcademicYearId;
                course.MajorId = updateDto.MajorId;
                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var courseDto = await GetCourseDtoAsync(course.Id);
                return ServiceResult<CourseDto>.Success(courseDto, "Cập nhật khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDto>.Failure("Có lỗi xảy ra khi cập nhật khóa học", ex.Message);
            }
        }

        public async Task<ServiceResult<bool>> DeleteCourseAsync(Guid courseId, Guid currentUserId)
        {
            try
            {
                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

                if (course == null)
                {
                    return ServiceResult<bool>.Failure("Không tìm thấy khóa học");
                }

                if (!await CanUserManageCourseAsync(courseId, currentUserId))
                {
                    return ServiceResult<bool>.Failure("Bạn không có quyền xóa khóa học này");
                }

                course.IsDeleted = true;
                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.Success(true, "Xóa khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.Failure("Có lỗi xảy ra khi xóa khóa học", ex.Message);
            }
        }

        public async Task<ServiceResult<CourseDetailDto>> GetCourseByIdAsync(Guid courseId, Guid currentUserId)
        {
            try
            {
                var currentUser = await _context.AppUsers
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == currentUserId);

                if (currentUser == null)
                {
                    return ServiceResult<CourseDetailDto>.Failure("Người dùng không tồn tại");
                }

                if (!await CanUserAccessCourseAsync(courseId, currentUserId, currentUser.Role!.RoleName))
                {
                    return ServiceResult<CourseDetailDto>.Failure("Bạn không có quyền truy cập khóa học này");
                }

                var course = await _context.Courses
                    .Include(c => c.Semester)
                    .Include(c => c.AcademicYear)
                    .Include(c => c.Major)
                    .Include(c => c.Lecturers).ThenInclude(cl => cl.Lecturer)
                    .Include(c => c.Students).ThenInclude(cs => cs.Student)
                    .Include(c => c.Chapters.OrderBy(ch => ch.OrderIndex))
                        .ThenInclude(ch => ch.Contents.OrderBy(co => co.OrderIndex))
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

                if (course == null)
                {
                    return ServiceResult<CourseDetailDto>.Failure("Không tìm thấy khóa học");
                }

                var courseDetailDto = await MapToCourseDetailDtoAsync(course);
                return ServiceResult<CourseDetailDto>.Success(courseDetailDto);
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDetailDto>.Failure("Có lỗi xảy ra khi lấy thông tin khóa học", ex.Message);
            }
        }
        public async Task<ServiceResult<List<CourseDto>>> GetAllCoursesAsync(Guid currentUserId)
        {
            try
            {
                var currentUser = await _context.AppUsers
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == currentUserId);

                if (currentUser?.Role?.RoleName != UserRoles.Admin)
                {
                    return ServiceResult<List<CourseDto>>.Failure("Bạn không có quyền xem tất cả khóa học");
                }

                var courses = await _context.Courses
                    .Include(c => c.Semester)
                    .Include(c => c.AcademicYear)
                    .Include(c => c.Major)
                    .Include(c => c.Lecturers).ThenInclude(cl => cl.Lecturer)
                    .Include(c => c.Students)
                    .Include(c => c.Chapters)
                    .Where(c => !c.IsDeleted)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var courseDtos = new List<CourseDto>();
                foreach (var course in courses)
                {
                    courseDtos.Add(await MapToCourseDtoAsync(course));
                }

                return ServiceResult<List<CourseDto>>.Success(courseDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDto>>.Failure("Có lỗi xảy ra khi lấy danh sách khóa học", ex.Message);
            }
        }

        public async Task<ServiceResult<List<CourseDto>>> GetCoursesByLecturerAsync(Guid lecturerId, Guid currentUserId)
        {
            try
            {
                var currentUser = await _context.AppUsers
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == currentUserId);

                if (currentUser?.Role?.RoleName == UserRoles.Lecturer && currentUserId != lecturerId)
                {
                    return ServiceResult<List<CourseDto>>.Failure("Bạn chỉ có thể xem khóa học của chính mình");
                }

                if (currentUser?.Role?.RoleName != UserRoles.Admin && currentUser?.Role?.RoleName != UserRoles.Lecturer)
                {
                    return ServiceResult<List<CourseDto>>.Failure("Bạn không có quyền xem khóa học của giảng viên");
                }

                var courses = await _context.Courses
                    .Include(c => c.Semester)
                    .Include(c => c.AcademicYear)
                    .Include(c => c.Major)
                    .Include(c => c.Lecturers).ThenInclude(cl => cl.Lecturer)
                    .Include(c => c.Students)
                    .Include(c => c.Chapters)
                    .Where(c => c.Lecturers.Any(cl => cl.LecturerId == lecturerId) && !c.IsDeleted)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var courseDtos = new List<CourseDto>();
                foreach (var course in courses)
                {
                    courseDtos.Add(await MapToCourseDtoAsync(course));
                }

                return ServiceResult<List<CourseDto>>.Success(courseDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDto>>.Failure("Có lỗi xảy ra khi lấy danh sách khóa học của giảng viên", ex.Message);
            }
        }

        public async Task<ServiceResult<List<CourseDto>>> GetCoursesByStudentAsync(Guid studentId)
        {
            try
            {
                var courses = await _context.CourseStudents
                    .Include(cs => cs.Course).ThenInclude(c => c!.Semester)
                    .Include(cs => cs.Course).ThenInclude(c => c!.AcademicYear)
                    .Include(cs => cs.Course).ThenInclude(c => c!.Major)
                    .Include(cs => cs.Course).ThenInclude(c => c!.Lecturers).ThenInclude(cl => cl.Lecturer)
                    .Include(cs => cs.Course).ThenInclude(c => c!.Students)
                    .Include(cs => cs.Course).ThenInclude(c => c!.Chapters)
                    .Where(cs => cs.StudentId == studentId && !cs.Course!.IsDeleted && !cs.IsDeleted)
                    .Select(cs => cs.Course!)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var courseDtos = new List<CourseDto>();
                foreach (var course in courses)
                {
                    courseDtos.Add(await MapToCourseDtoAsync(course));
                }

                return ServiceResult<List<CourseDto>>.Success(courseDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<CourseDto>>.Failure("Có lỗi xảy ra khi lấy danh sách khóa học của sinh viên", ex.Message);
            }
        }

        public async Task<ServiceResult<bool>> EnrollStudentsAsync(Guid courseId, EnrollStudentDto enrollDto, Guid currentUserId)
        {
            try
            {
                if (!await CanUserManageCourseAsync(courseId, currentUserId))
                {
                    return ServiceResult<bool>.Failure("Bạn không có quyền quản lý sinh viên trong khóa học này");
                }

                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

                if (course == null)
                {
                    return ServiceResult<bool>.Failure("Không tìm thấy khóa học");
                }

                var students = await _context.AppUsers
                    .Include(u => u.Role)
                    .Where(u => enrollDto.StudentIds.Contains(u.Id) && u.Role!.RoleName == UserRoles.Student)
                    .ToListAsync();

                if (students.Count != enrollDto.StudentIds.Count)
                {
                    return ServiceResult<bool>.Failure("Một số sinh viên không tồn tại hoặc không có quyền sinh viên");
                }

                var existingEnrollments = await _context.CourseStudents
                    .Where(cs => cs.CourseId == courseId && enrollDto.StudentIds.Contains(cs.StudentId) && !cs.IsDeleted)
                    .Select(cs => cs.StudentId)
                    .ToListAsync();

                var newStudentIds = enrollDto.StudentIds.Except(existingEnrollments).ToList();

                if (newStudentIds.Count == 0)
                {
                    return ServiceResult<bool>.Success(true, "Tất cả sinh viên đã được đăng ký vào khóa học");
                }

                var newEnrollments = newStudentIds.Select(studentId => new CourseStudent
                {
                    CourseId = courseId,
                    StudentId = studentId,
                    EnrolledDate = DateTime.UtcNow
                }).ToList();

                _context.CourseStudents.AddRange(newEnrollments);
                await _context.SaveChangesAsync();

                return ServiceResult<bool>.Success(true, $"Đã đăng ký {newEnrollments.Count} sinh viên vào khóa học");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.Failure("Có lỗi xảy ra khi đăng ký sinh viên", ex.Message);
            }
        }

        public async Task<ServiceResult<bool>> RemoveStudentFromCourseAsync(Guid courseId, Guid studentId, Guid currentUserId)
        {
            try
            {
                if (!await CanUserManageCourseAsync(courseId, currentUserId))
                {
                    return ServiceResult<bool>.Failure("Bạn không có quyền quản lý sinh viên trong khóa học này");
                }

                var enrollment = await _context.CourseStudents
                    .FirstOrDefaultAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId && !cs.IsDeleted);

                if (enrollment == null)
                {
                    return ServiceResult<bool>.Failure("Sinh viên không có trong khóa học này");
                }

                enrollment.IsDeleted = true;
                enrollment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ServiceResult<bool>.Success(true, "Đã xóa sinh viên khỏi khóa học");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.Failure("Có lỗi xảy ra khi xóa sinh viên khỏi khóa học", ex.Message);
            }
        }

        public async Task<bool> IsCourseExistsAsync(Guid courseId)
        {
            return await _context.Courses.AnyAsync(c => c.Id == courseId && !c.IsDeleted);
        }

        public async Task<bool> IsUserEnrolledInCourseAsync(Guid courseId, Guid studentId)
        {
            return await _context.CourseStudents
                .AnyAsync(cs => cs.CourseId == courseId && cs.StudentId == studentId && !cs.IsDeleted);
        }

        public async Task<bool> CanUserAccessCourseAsync(Guid courseId, Guid userId, string userRole)
        {
            switch (userRole)
            {
                case UserRoles.Admin:
                    return true;

                case UserRoles.Lecturer:
                    return await _context.Set<CourseLecturer>()
                        .AnyAsync(cl => cl.CourseId == courseId && cl.LecturerId == userId && !cl.IsDeleted);

                case UserRoles.Student:
                    return await _context.CourseStudents
                        .AnyAsync(cs => cs.CourseId == courseId && cs.StudentId == userId && !cs.IsDeleted);

                default:
                    return false;
            }
        }

        // Private helper methods
        private async Task<bool> CanUserManageCourseAsync(Guid courseId, Guid userId)
        {
            var user = await _context.AppUsers
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Role?.RoleName == UserRoles.Admin)
                return true;

            if (user?.Role?.RoleName == UserRoles.Lecturer)
            {
                return await _context.Set<CourseLecturer>()
                    .AnyAsync(cl => cl.CourseId == courseId && cl.LecturerId == userId && !cl.IsDeleted);
            }

            return false;
        }

        private async Task<CourseDto> GetCourseDtoAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Semester)
                .Include(c => c.AcademicYear)
                .Include(c => c.Major)
                .Include(c => c.Lecturers).ThenInclude(cl => cl.Lecturer)
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                .FirstAsync(c => c.Id == courseId);

            return await MapToCourseDtoAsync(course);
        }

        private async Task<CourseDto> MapToCourseDtoAsync(Course course)
        {
            var dto = new CourseDto
            {
                Id = course.Id,
                CourseCode = course.CourseCode,
                Name = course.Name,
                Description = course.Description,
                ThumbnailUrl = course.ThumbnailUrl,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
                SemesterId = course.SemesterId,
                SemesterName = course.Semester?.Name,
                AcademicYearId = course.AcademicYearId,
                AcademicYearName = course.AcademicYear?.Name,
                MajorId = course.MajorId,
                MajorName = course.Major?.Name,
                StudentCount = course.Students?.Count(s => !s.IsDeleted) ?? 0,
                ChapterCount = course.Chapters?.Count(c => !c.IsDeleted) ?? 0,
                Lecturers = course.Lecturers?
                    .Where(cl => !cl.IsDeleted)
                    .Select(cl => new LecturerInCourseDto
                    {
                        LecturerId = cl.LecturerId,
                        FullName = cl.Lecturer?.FullName ?? "",
                        Email = cl.Lecturer?.Email ?? "",
                        IsPrimary = cl.IsPrimary
                    }).ToList() ?? new List<LecturerInCourseDto>()
            };

            // Process thumbnail URL through Cloudinary if needed
            if (!string.IsNullOrEmpty(dto.ThumbnailUrl))
            {
                dto.ThumbnailUrl = await _fileStorageService.GetOptimizedUrlAsync(dto.ThumbnailUrl, 400, 300);
            }

            return dto;
        }

        private async Task<CourseDetailDto> MapToCourseDetailDtoAsync(Course course)
        {
            var baseDto = await MapToCourseDtoAsync(course);
            
            return new CourseDetailDto
            {
                Id = baseDto.Id,
                CourseCode = baseDto.CourseCode,
                Name = baseDto.Name,
                Description = baseDto.Description,
                ThumbnailUrl = baseDto.ThumbnailUrl,
                CreatedAt = baseDto.CreatedAt,
                UpdatedAt = baseDto.UpdatedAt,
                SemesterId = baseDto.SemesterId,
                SemesterName = baseDto.SemesterName,
                AcademicYearId = baseDto.AcademicYearId,
                AcademicYearName = baseDto.AcademicYearName,
                MajorId = baseDto.MajorId,
                MajorName = baseDto.MajorName,
                StudentCount = baseDto.StudentCount,
                ChapterCount = baseDto.ChapterCount,
                Lecturers = baseDto.Lecturers,
                Students = course.Students?
                    .Where(cs => !cs.IsDeleted)
                    .Select(cs => new StudentInCourseDto
                    {
                        StudentId = cs.StudentId,
                        StudentCode = cs.Student?.StudentCode ?? "",
                        FullName = cs.Student?.FullName ?? "",
                        Email = cs.Student?.Email ?? "",
                        EnrolledDate = cs.EnrolledDate,
                        Source = cs.Source
                    }).ToList() ?? new List<StudentInCourseDto>(),
                Chapters = await MapToChapterDetailDtosAsync(course.Chapters?.Where(c => !c.IsDeleted).OrderBy(c => c.OrderIndex).ToList() ?? new List<Chapter>())
            };
        }

        private async Task<List<ChapterDetailDto>> MapToChapterDetailDtosAsync(List<Chapter> chapters)
        {
            var result = new List<ChapterDetailDto>();
            
            foreach (var chapter in chapters)
            {
                var chapterDto = new ChapterDetailDto
                {
                    Id = chapter.Id,
                    Title = chapter.Title,
                    OrderIndex = chapter.OrderIndex,
                    Contents = await MapToCourseContentDtosAsync(chapter.Contents?.Where(c => !c.IsDeleted).OrderBy(c => c.OrderIndex).ToList() ?? new List<CourseContent>())
                };
                result.Add(chapterDto);
            }
            
            return result;
        }

        private async Task<List<CourseContentDto>> MapToCourseContentDtosAsync(List<CourseContent> contents)
        {
            var result = new List<CourseContentDto>();
            
            foreach (var content in contents)
            {
                var contentDto = new CourseContentDto
                {
                    Id = content.Id,
                    Title = content.Title,
                    Type = content.Type.ToString(),
                    OrderIndex = content.OrderIndex,
                    CreatedAt = content.CreatedAt
                };

                // Map specific content type properties
                switch (content)
                {
                    case Lesson lesson:
                        contentDto.FileUrl = lesson.FileUrl;
                        contentDto.FileType = lesson.FileType;
                        contentDto.FileSize = lesson.FileSize;
                        contentDto.DurationSeconds = lesson.DurationSeconds;
                        contentDto.ContentHtml = lesson.ContentHtml;
                        
                        // Process file URL through Cloudinary if it's a media file
                        if (!string.IsNullOrEmpty(lesson.FileUrl) && (lesson.FileType == "Video" || lesson.FileType == "Image"))
                        {
                            contentDto.FileUrl = await _fileStorageService.GetOptimizedUrlAsync(lesson.FileUrl);
                        }
                        break;

                    case Quiz quiz:
                        contentDto.OpenTime = quiz.OpenTime;
                        contentDto.CloseTime = quiz.CloseTime;
                        contentDto.DurationMinutes = quiz.DurationMinutes;
                        contentDto.ShuffleQuestions = quiz.ShuffleQuestions;
                        contentDto.ShuffleAnswers = quiz.ShuffleAnswers;
                        break;

                    case Assignment assignment:
                        contentDto.DueDate = assignment.DueDate;
                        contentDto.MaxScore = assignment.MaxScore;
                        contentDto.Description = assignment.Description;
                        break;

                    case Announcement announcement:
                        contentDto.ContentHtml = announcement.ContentHtml;
                        contentDto.AttachmentsJson = announcement.AttachmentsJson;
                        break;
                }

                result.Add(contentDto);
            }
            
            return result;
        }
    }
}