using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Constant;
using LMS.Domain.Entities.Courses;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using static LMS.Application.Common.ServiceResult;

namespace LMS.Infrastructure.Services
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<CourseDto>> CreateCourseAsync(CreateCourseDto createDto, Guid currentUserId)
        {
            try
            {
                // Kiểm tra quyền: chỉ Admin hoặc Lecturer được tạo khóa học
                var currentUser = await _context.AppUsers
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == currentUserId);

                if (currentUser?.Role?.RoleName != UserRoles.Admin && currentUser?.Role?.RoleName != UserRoles.Lecturer)
                {
                    return ServiceResult<CourseDto>.Failure("Bạn không có quyền tạo khóa học");
                }

                // Kiểm tra mã khóa học đã tồn tại
                var existingCourse = await _context.Courses
                    .FirstOrDefaultAsync(c => c.CourseCode == createDto.CourseCode && !c.IsDeleted);

                if (existingCourse != null)
                {
                    return ServiceResult<CourseDto>.Failure("Mã khóa học đã tồn tại");
                }

                // Kiểm tra các foreign key có tồn tại
                var semester = await _context.Semesters.FindAsync(createDto.SemesterId);
                var academicYear = await _context.AcademicYears.FindAsync(createDto.AcademicYearId);
                var major = await _context.Majors.FindAsync(createDto.MajorId);
                var lecturer = await _context.AppUsers
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == createDto.LecturerId && u.Role!.RoleName == UserRoles.Lecturer);

                if (semester == null || academicYear == null || major == null || lecturer == null)
                {
                    return ServiceResult<CourseDto>.Failure("Thông tin học kỳ, năm học, chuyên ngành hoặc giảng viên không hợp lệ");
                }

                var course = new Course
                {
                    CourseCode = createDto.CourseCode,
                    Name = createDto.Name,
                    Description = createDto.Description,
                    ThumbnailUrl = createDto.ThumbnailUrl,
                    SemesterId = createDto.SemesterId,
                    AcademicYearId = createDto.AcademicYearId,
                    MajorId = createDto.MajorId,
                    LecturerId = createDto.LecturerId
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

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

                // Kiểm tra quyền
                if (!await CanUserManageCourseAsync(courseId, currentUserId))
                {
                    return ServiceResult<CourseDto>.Failure("Bạn không có quyền chỉnh sửa khóa học này");
                }

                // Kiểm tra mã khóa học trùng (trừ chính nó)
                var existingCourse = await _context.Courses
                    .FirstOrDefaultAsync(c => c.CourseCode == updateDto.CourseCode && c.Id != courseId && !c.IsDeleted);

                if (existingCourse != null)
                {
                    return ServiceResult<CourseDto>.Failure("Mã khóa học đã tồn tại");
                }

                // Kiểm tra các foreign key
                var semester = await _context.Semesters.FindAsync(updateDto.SemesterId);
                var academicYear = await _context.AcademicYears.FindAsync(updateDto.AcademicYearId);
                var major = await _context.Majors.FindAsync(updateDto.MajorId);
                var lecturer = await _context.AppUsers
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == updateDto.LecturerId && u.Role!.RoleName == UserRoles.Lecturer);

                if (semester == null || academicYear == null || major == null || lecturer == null)
                {
                    return ServiceResult<CourseDto>.Failure("Thông tin học kỳ, năm học, chuyên ngành hoặc giảng viên không hợp lệ");
                }

                // Cập nhật thông tin
                course.CourseCode = updateDto.CourseCode;
                course.Name = updateDto.Name;
                course.Description = updateDto.Description;
                course.ThumbnailUrl = updateDto.ThumbnailUrl;
                course.SemesterId = updateDto.SemesterId;
                course.AcademicYearId = updateDto.AcademicYearId;
                course.MajorId = updateDto.MajorId;
                course.LecturerId = updateDto.LecturerId;
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

                // Kiểm tra quyền
                if (!await CanUserManageCourseAsync(courseId, currentUserId))
                {
                    return ServiceResult<bool>.Failure("Bạn không có quyền xóa khóa học này");
                }

                // Soft delete
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

                // Kiểm tra quyền truy cập
                if (!await CanUserAccessCourseAsync(courseId, currentUserId, currentUser.Role!.RoleName))
                {
                    return ServiceResult<CourseDetailDto>.Failure("Bạn không có quyền truy cập khóa học này");
                }

                var course = await _context.Courses
                    .Include(c => c.Semester)
                    .Include(c => c.AcademicYear)
                    .Include(c => c.Major)
                    .Include(c => c.Lecturer)
                    .Include(c => c.Students).ThenInclude(cs => cs.Student)
                    .Include(c => c.Chapters)
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

                if (course == null)
                {
                    return ServiceResult<CourseDetailDto>.Failure("Không tìm thấy khóa học");
                }

                var courseDetailDto = MapToCourseDetailDto(course);
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
                    .Include(c => c.Lecturer)
                    .Include(c => c.Students)
                    .Include(c => c.Chapters)
                    .Where(c => !c.IsDeleted)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var courseDtos = courses.Select(MapToCourseDto).ToList();
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

                // Admin có thể xem khóa học của bất kỳ giảng viên nào
                // Lecturer chỉ có thể xem khóa học của chính mình
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
                    .Include(c => c.Lecturer)
                    .Include(c => c.Students)
                    .Include(c => c.Chapters)
                    .Where(c => c.LecturerId == lecturerId && !c.IsDeleted)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var courseDtos = courses.Select(MapToCourseDto).ToList();
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
                    .Include(cs => cs.Course).ThenInclude(c => c!.Lecturer)
                    .Include(cs => cs.Course).ThenInclude(c => c!.Students)
                    .Include(cs => cs.Course).ThenInclude(c => c!.Chapters)
                    .Where(cs => cs.StudentId == studentId && !cs.Course!.IsDeleted && !cs.IsDeleted)
                    .Select(cs => cs.Course!)
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();

                var courseDtos = courses.Select(MapToCourseDto).ToList();
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
                // Kiểm tra quyền
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

                // Kiểm tra các sinh viên có tồn tại và có role Student
                var students = await _context.AppUsers
                    .Include(u => u.Role)
                    .Where(u => enrollDto.StudentIds.Contains(u.Id) && u.Role!.RoleName == UserRoles.Student)
                    .ToListAsync();

                if (students.Count != enrollDto.StudentIds.Count)
                {
                    return ServiceResult<bool>.Failure("Một số sinh viên không tồn tại hoặc không có quyền sinh viên");
                }

                // Lấy danh sách sinh viên đã đăng ký
                var existingEnrollments = await _context.CourseStudents
                    .Where(cs => cs.CourseId == courseId && enrollDto.StudentIds.Contains(cs.StudentId) && !cs.IsDeleted)
                    .Select(cs => cs.StudentId)
                    .ToListAsync();

                // Chỉ thêm sinh viên chưa đăng ký
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
                // Kiểm tra quyền
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

                // Soft delete
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
                    return await _context.Courses
                        .AnyAsync(c => c.Id == courseId && c.LecturerId == userId && !c.IsDeleted);

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
                return await _context.Courses
                    .AnyAsync(c => c.Id == courseId && c.LecturerId == userId && !c.IsDeleted);
            }

            return false;
        }

        private async Task<CourseDto> GetCourseDtoAsync(Guid courseId)
        {
            var course = await _context.Courses
                .Include(c => c.Semester)
                .Include(c => c.AcademicYear)
                .Include(c => c.Major)
                .Include(c => c.Lecturer)
                .Include(c => c.Students)
                .Include(c => c.Chapters)
                .FirstAsync(c => c.Id == courseId);

            return MapToCourseDto(course);
        }

        private static CourseDto MapToCourseDto(Course course)
        {
            return new CourseDto
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
                LecturerId = course.LecturerId,
                LecturerName = course.Lecturer?.FullName,
                StudentCount = course.Students?.Count(s => !s.IsDeleted) ?? 0,
                ChapterCount = course.Chapters?.Count(c => !c.IsDeleted) ?? 0
            };
        }

        private static CourseDetailDto MapToCourseDetailDto(Course course)
        {
            return new CourseDetailDto
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
                LecturerId = course.LecturerId,
                LecturerName = course.Lecturer?.FullName,
                StudentCount = course.Students?.Count(s => !s.IsDeleted) ?? 0,
                ChapterCount = course.Chapters?.Count(c => !c.IsDeleted) ?? 0,
                Students = course.Students?
                    .Where(cs => !cs.IsDeleted)
                    .Select(cs => new StudentInCourseDto
                    {
                        StudentId = cs.StudentId,
                        StudentCode = cs.Student?.StudentCode ?? "",
                        FullName = cs.Student?.FullName ?? "",
                        Email = cs.Student?.Email ?? "",
                        EnrolledDate = cs.EnrolledDate
                    }).ToList() ?? new List<StudentInCourseDto>(),
                Chapters = course.Chapters?
                    .Where(c => !c.IsDeleted)
                    .OrderBy(c => c.OrderIndex)
                    .Select(c => new ChapterDto
                    {
                        Id = c.Id,
                        Title = c.Title,
                        OrderIndex = c.OrderIndex,
                        ContentCount = c.Contents?.Count(content => !content.IsDeleted) ?? 0
                    }).ToList() ?? new List<ChapterDto>()
            };
        }
    }
}