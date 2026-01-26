using Azure;
using LMS.Application.DTOs.Admin;
using LMS.Application.DTOs.Common;
using LMS.Domain.Entities.Courses;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LMS.Infrastructure.Services
{
    public class AdminCourseService : IAdminCourseService
    {
        private readonly AppDbContext _context;

        public AdminCourseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceResult<PagedResultDto<CourseDto>>> GetCoursesAsync(CourseFilterDto filter)
        {
            try
            {
                var query = _context.Courses
                    .Include(c => c.Semester)
                    .Include(c => c.AcademicYear)
                    .Include(c => c.Major)
                    .Include(c => c.Lecturer)
                    .Include(c => c.Students)
                    .Where(c => !c.IsDeleted)
                    .AsQueryable();

                // Search
                if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                {
                    var searchLower = filter.SearchTerm.ToLower();
                    query = query.Where(c =>
                        c.Name.ToLower().Contains(searchLower) ||
                        c.CourseCode.ToLower().Contains(searchLower));
                }

                // Filters
                if (filter.SemesterId.HasValue)
                    query = query.Where(c => c.SemesterId == filter.SemesterId.Value);

                if (filter.AcademicYearId.HasValue)
                    query = query.Where(c => c.AcademicYearId == filter.AcademicYearId.Value);

                if (filter.MajorId.HasValue)
                    query = query.Where(c => c.MajorId == filter.MajorId.Value);

                if (filter.LecturerId.HasValue)
                    query = query.Where(c => c.LecturerId == filter.LecturerId.Value);

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .Select(c => new CourseDto
                    {
                        Id = c.Id,
                        CourseCode = c.CourseCode,
                        Name = c.Name,
                        Description = c.Description,
                        ThumbnailUrl = c.ThumbnailUrl,
                        SemesterId = c.SemesterId,
                        SemesterName = c.Semester!.Name,
                        AcademicYearId = c.AcademicYearId,
                        AcademicYearName = c.AcademicYear!.Name,
                        MajorId = c.MajorId,
                        MajorName = c.Major!.Name,
                        LecturerId = c.LecturerId,
                        LecturerName = c.Lecturer!.FullName,
                        StudentCount = c.Students.Count(s => !s.IsDeleted),
                        CreatedAt = c.CreatedAt
                    })
                    .ToListAsync();

                var result = new PagedResultDto<CourseDto>
                {
                    Items = items,
                    Page = filter.PageNumber,
                    PageSize = filter.PageNumber,
                    TotalItems = totalCount
                };

                return ServiceResult<PagedResultDto<CourseDto>>.Success(result, "Lấy danh sách khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<PagedResultDto<CourseDto>>.Failure(
                    "Lỗi khi lấy danh sách khóa học",
                    ex.Message
                );
            }
        }

        public async Task<ServiceResult<CourseDetailDto>> GetCourseByIdAsync(Guid id)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Semester)
                    .Include(c => c.AcademicYear)
                    .Include(c => c.Major)
                    .Include(c => c.Lecturer)
                    .Include(c => c.Students)
                        .ThenInclude(cs => cs.Student)
                    .Include(c => c.Chapters)
                        .ThenInclude(ch => ch.Contents)
                    .Where(c => c.Id == id && !c.IsDeleted)
                    .FirstOrDefaultAsync();

                if (course == null)
                {
                    return ServiceResult<CourseDetailDto>.Failure("Không tìm thấy khóa học");
                }

                var courseDetail = new CourseDetailDto
                {
                    Id = course.Id,
                    CourseCode = course.CourseCode,
                    Name = course.Name,
                    Description = course.Description,
                    ThumbnailUrl = course.ThumbnailUrl,
                    SemesterId = course.SemesterId,
                    SemesterName = course.Semester!.Name,
                    AcademicYearId = course.AcademicYearId,
                    AcademicYearName = course.AcademicYear!.Name,
                    MajorId = course.MajorId,
                    MajorName = course.Major!.Name,
                    LecturerId = course.LecturerId,
                    LecturerName = course.Lecturer!.FullName,
                    LecturerEmail = course.Lecturer.Email,
                    LecturerPhone = course.Lecturer.Phone,
                    LecturerAvatarUrl = course.Lecturer.AvatarUrl,
                    StudentCount = course.Students.Count(s => !s.IsDeleted),
                    CreatedAt = course.CreatedAt,
                    Students = course.Students
                        .Where(cs => !cs.IsDeleted)
                        .Select(cs => new StudentDto
                        {
                            Id = cs.StudentId,
                            FullName = cs.Student!.FullName,
                            Email = cs.Student.Email,
                            StudentCode = cs.Student.StudentCode,
                            EnrolledDate = cs.EnrolledDate
                        }).ToList(),
                    ChapterCount = course.Chapters.Count(ch => !ch.IsDeleted),
                    ContentCount = course.Chapters
                        .Where(ch => !ch.IsDeleted)
                        .SelectMany(ch => ch.Contents)
                        .Count(c => !c.IsDeleted)
                };

                return ServiceResult<CourseDetailDto>.Success(courseDetail, "Lấy thông tin khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDetailDto>.Failure(
                    "Lỗi khi lấy thông tin khóa học",
                    ex.Message
                );
            }
        }

        public async Task<ServiceResult<CourseDto>> CreateCourseAsync(CreateCourseDto dto)
        {
            try
            {
                // Validate course code uniqueness
                var existingCourse = await _context.Courses
                    .AnyAsync(c => c.CourseCode == dto.CourseCode && !c.IsDeleted);

                if (existingCourse)
                {
                    return ServiceResult<CourseDto>.Failure("Mã khóa học đã tồn tại");
                }

                // Validate foreign keys
                var semester = await _context.Semesters.FindAsync(dto.SemesterId);
                if (semester == null || semester.IsDeleted)
                {
                    return ServiceResult<CourseDto>.Failure("Học kỳ không tồn tại");
                }

                var academicYear = await _context.AcademicYears.FindAsync(dto.AcademicYearId);
                if (academicYear == null || academicYear.IsDeleted)
                {
                    return ServiceResult<CourseDto>.Failure("Năm học không tồn tại");
                }

                var major = await _context.Majors.FindAsync(dto.MajorId);
                if (major == null || major.IsDeleted)
                {
                    return ServiceResult<CourseDto>.Failure("Ngành học không tồn tại");
                }

                if (dto.LecturerId.HasValue)
                {
                    var lecturer = await _context.AppUsers.FindAsync(dto.LecturerId.Value);
                    if (lecturer == null || lecturer.IsDeleted)
                    {
                        return ServiceResult<CourseDto>.Failure("Giảng viên không tồn tại");
                    }
                }

                var course = new Course
                {
                    CourseCode = dto.CourseCode,
                    Name = dto.Name,
                    Description = dto.Description,
                    SemesterId = dto.SemesterId,
                    AcademicYearId = dto.AcademicYearId,
                    MajorId = dto.MajorId,
                    LecturerId = dto.LecturerId ?? Guid.Empty
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                var createdCourse = await GetCourseDtoAsync(course.Id);
                return ServiceResult<CourseDto>.Success(createdCourse, "Tạo khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDto>.Failure(
                    "Lỗi khi tạo khóa học",
                    ex.Message
                );
            }
        }

        public async Task<ServiceResult<CourseDto>> UpdateCourseAsync(Guid id, UpdateCourseDto dto)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null || course.IsDeleted)
                {
                    return ServiceResult<CourseDto>.Failure("Không tìm thấy khóa học");
                }

                // Validate foreign keys if provided
                if (dto.SemesterId.HasValue)
                {
                    var semester = await _context.Semesters.FindAsync(dto.SemesterId.Value);
                    if (semester == null || semester.IsDeleted)
                    {
                        return ServiceResult<CourseDto>.Failure("Học kỳ không tồn tại");
                    }
                    course.SemesterId = dto.SemesterId.Value;
                }

                if (dto.AcademicYearId.HasValue)
                {
                    var academicYear = await _context.AcademicYears.FindAsync(dto.AcademicYearId.Value);
                    if (academicYear == null || academicYear.IsDeleted)
                    {
                        return ServiceResult<CourseDto>.Failure("Năm học không tồn tại");
                    }
                    course.AcademicYearId = dto.AcademicYearId.Value;
                }

                if (dto.MajorId.HasValue)
                {
                    var major = await _context.Majors.FindAsync(dto.MajorId.Value);
                    if (major == null || major.IsDeleted)
                    {
                        return ServiceResult<CourseDto>.Failure("Ngành học không tồn tại");
                    }
                    course.MajorId = dto.MajorId.Value;
                }

                if (!string.IsNullOrWhiteSpace(dto.Name))
                    course.Name = dto.Name;

                if (dto.Description != null)
                    course.Description = dto.Description;

                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updatedCourse = await GetCourseDtoAsync(course.Id);
                return ServiceResult<CourseDto>.Success(updatedCourse, "Cập nhật khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseDto>.Failure(
                    "Lỗi khi cập nhật khóa học",
                    ex.Message
                );
            }
        }

        public async Task<ServiceResult> DeleteCourseAsync(Guid id)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null || course.IsDeleted)
                {
                    return ServiceResult.Failure("Không tìm thấy khóa học");
                }

                course.IsDeleted = true;
                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ServiceResult.Success("Xóa khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult.Failure("Lỗi khi xóa khóa học", ex.Message);
            }
        }

        public async Task<ServiceResult> AssignLecturerAsync(Guid courseId, Guid lecturerId)
        {
            try
            {
                var course = await _context.Courses.FindAsync(courseId);
                if (course == null || course.IsDeleted)
                {
                    return ServiceResult.Failure("Không tìm thấy khóa học");
                }

                var lecturer = await _context.AppUsers.FindAsync(lecturerId);
                if (lecturer == null || lecturer.IsDeleted)
                {
                    return ServiceResult.Failure("Không tìm thấy giảng viên");
                }

                // Validate lecturer role (optional)
                var lecturerRole = await _context.AppRoles.FindAsync(lecturer.RoleId);
                if (lecturerRole?.RoleName != "Lecturer" && lecturerRole?.RoleName != "Admin")
                {
                    return ServiceResult.Failure("Người dùng không phải là giảng viên");
                }

                course.LecturerId = lecturerId;
                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ServiceResult.Success("Phân quyền giảng viên thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult.Failure("Lỗi khi phân quyền giảng viên", ex.Message);
            }
        }

        public async Task<ServiceResult<CourseStatisticsDto>> GetCourseStatisticsAsync(Guid courseId)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Students)
                    .Include(c => c.Chapters)
                        .ThenInclude(ch => ch.Contents)
                    .Where(c => c.Id == courseId && !c.IsDeleted)
                    .FirstOrDefaultAsync();

                if (course == null)
                {
                    return ServiceResult<CourseStatisticsDto>.Failure("Không tìm thấy khóa học");
                }

                var contents = course.Chapters
                    .Where(ch => !ch.IsDeleted)
                    .SelectMany(ch => ch.Contents)
                    .Where(c => !c.IsDeleted)
                    .ToList();

                var statistics = new CourseStatisticsDto
                {
                    CourseId = course.Id,
                    CourseName = course.Name,
                    TotalStudents = course.Students.Count(s => !s.IsDeleted),
                    TotalChapters = course.Chapters.Count(ch => !ch.IsDeleted),
                    TotalLessons = contents.Count(c => c.Type == Domain.Entities.Content.ContentType.Lesson),
                    TotalQuizzes = contents.Count(c => c.Type == Domain.Entities.Content.ContentType.Quiz),
                    TotalAssignments = contents.Count(c => c.Type == Domain.Entities.Content.ContentType.Assignment),
                    AverageProgress = 0, // TODO: Calculate from LessonProgress
                    CompletedStudents = 0 // TODO: Calculate based on completion criteria
                };

                return ServiceResult<CourseStatisticsDto>.Success(statistics, "Lấy thống kê khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<CourseStatisticsDto>.Failure(
                    "Lỗi khi lấy thống kê khóa học",
                    ex.Message
                );
            }
        }

        private async Task<CourseDto> GetCourseDtoAsync(Guid id)
        {
            return await _context.Courses
                .Include(c => c.Semester)
                .Include(c => c.AcademicYear)
                .Include(c => c.Major)
                .Include(c => c.Lecturer)
                .Include(c => c.Students)
                .Where(c => c.Id == id && !c.IsDeleted)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    CourseCode = c.CourseCode,
                    Name = c.Name,
                    Description = c.Description,
                    ThumbnailUrl = c.ThumbnailUrl,
                    SemesterId = c.SemesterId,
                    SemesterName = c.Semester!.Name,
                    AcademicYearId = c.AcademicYearId,
                    AcademicYearName = c.AcademicYear!.Name,
                    MajorId = c.MajorId,
                    MajorName = c.Major!.Name,
                    LecturerId = c.LecturerId,
                    LecturerName = c.Lecturer!.FullName,
                    StudentCount = c.Students.Count(s => !s.IsDeleted),
                    CreatedAt = c.CreatedAt
                })
                .FirstAsync();
        }
    }
}
