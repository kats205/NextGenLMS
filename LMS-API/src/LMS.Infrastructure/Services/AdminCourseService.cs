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
                    .Include(c => c.Lecturers)
                        .ThenInclude(cl => cl.Lecturer)
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

                if (filter.LecturerId != null && filter.LecturerId.Any())
                    query = query.Where(c => c.Lecturers.Any(cl => filter.LecturerId.Contains(cl.LecturerId) && !cl.IsDeleted));

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
                        PrimaryLecturerId = c.Lecturers
                            .Where(cl => !cl.IsDeleted)
                            .OrderByDescending(cl => cl.IsPrimary)
                            .Select(cl => (Guid?)cl.LecturerId)
                            .FirstOrDefault(),
                        PrimaryLecturerName = c.Lecturers
                            .Where(cl => !cl.IsDeleted)
                            .OrderByDescending(cl => cl.IsPrimary)
                            .Select(cl => cl.Lecturer!.FullName)
                            .FirstOrDefault(),
                        Lecturers = c.Lecturers
                            .Where(cl => !cl.IsDeleted)
                            .OrderByDescending(cl => cl.IsPrimary)
                            .Select(cl => new CourseLecturerDto
                            {
                                Id = cl.LecturerId,
                                FullName = cl.Lecturer!.FullName,
                                Email = cl.Lecturer.Email,
                                Phone = cl.Lecturer.Phone,
                                AvatarUrl = cl.Lecturer.AvatarUrl,
                                IsPrimary = cl.IsPrimary
                            })
                            .ToList(),
                        StudentCount = c.Students.Count(s => !s.IsDeleted),
                        CreatedAt = c.CreatedAt
                    })
                    .ToListAsync();

                var result = new PagedResultDto<CourseDto>
                {
                    Items = items,
                    Page = filter.PageNumber,
                    PageSize = filter.PageSize,
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
                    .Include(c => c.Lecturers)
                        .ThenInclude(cl => cl.Lecturer)
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
                    PrimaryLecturerId = course.Lecturers
                        .Where(cl => !cl.IsDeleted)
                        .OrderByDescending(cl => cl.IsPrimary)
                        .Select(cl => (Guid?)cl.LecturerId)
                        .FirstOrDefault(),
                    PrimaryLecturerName = course.Lecturers
                        .Where(cl => !cl.IsDeleted)
                        .OrderByDescending(cl => cl.IsPrimary)
                        .Select(cl => cl.Lecturer!.FullName)
                        .FirstOrDefault(),
                    Lecturers = course.Lecturers
                        .Where(cl => !cl.IsDeleted)
                        .OrderByDescending(cl => cl.IsPrimary)
                        .Select(cl => new CourseLecturerDto
                        {
                            Id = cl.LecturerId,
                            FullName = cl.Lecturer!.FullName,
                            Email = cl.Lecturer.Email,
                            Phone = cl.Lecturer.Phone,
                            AvatarUrl = cl.Lecturer.AvatarUrl,
                            IsPrimary = cl.IsPrimary
                        }).ToList(),
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

                if (dto.LecturerId != null && dto.LecturerId.Any())
                {
                    var distinctLecturerIds = dto.LecturerId.Distinct().ToList();
                    var lecturers = await _context.AppUsers
                        .Where(u => distinctLecturerIds.Contains(u.Id) && !u.IsDeleted)
                        .Select(u => new { u.Id, u.RoleId })
                        .ToListAsync();

                    if (lecturers.Count != distinctLecturerIds.Count)
                    {
                        return ServiceResult<CourseDto>.Failure("Giảng viên không tồn tại");
                    }

                    var roleIds = lecturers.Select(l => l.RoleId).Distinct().ToList();
                    var roleMap = await _context.AppRoles
                        .Where(r => roleIds.Contains(r.Id))
                        .Select(r => new { r.Id, r.RoleName })
                        .ToDictionaryAsync(r => r.Id, r => r.RoleName);

                    var invalid = lecturers
                        .Where(l => !roleMap.TryGetValue(l.RoleId, out var roleName) || (roleName != "Lecturer" && roleName != "Admin"))
                        .Select(l => l.Id)
                        .ToList();

                    if (invalid.Any())
                    {
                        return ServiceResult<CourseDto>.Failure("Danh sách giảng viên không hợp lệ (chỉ chấp nhận Lecturer/Admin)");
                    }
                }

                var course = new Course
                {
                    CourseCode = dto.CourseCode,
                    Name = dto.Name,
                    Description = dto.Description,
                    SemesterId = dto.SemesterId,
                    AcademicYearId = dto.AcademicYearId,
                    MajorId = dto.MajorId
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                if (dto.LecturerId != null && dto.LecturerId.Any())
                {
                    var lecturerIds = dto.LecturerId.Distinct().ToList();
                    for (var i = 0; i < lecturerIds.Count; i++)
                    {
                        _context.CourseLecturers.Add(new CourseLecturer
                        {
                            CourseId = course.Id,
                            LecturerId = lecturerIds[i],
                            IsPrimary = i == 0
                        });
                    }

                    await _context.SaveChangesAsync();
                }

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
                var course = await _context.Courses
                    .Include(c => c.Lecturers)
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

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

                var existing = course.Lecturers.FirstOrDefault(cl => cl.LecturerId == lecturerId && !cl.IsDeleted);
                if (existing != null)
                {
                    return ServiceResult.Success("Giảng viên đã được phân quyền cho khóa học");
                }

                var hasPrimary = course.Lecturers.Any(cl => !cl.IsDeleted && cl.IsPrimary);

                _context.CourseLecturers.Add(new CourseLecturer
                {
                    CourseId = courseId,
                    LecturerId = lecturerId,
                    IsPrimary = !hasPrimary
                });

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
                .Include(c => c.Lecturers)
                    .ThenInclude(cl => cl.Lecturer)
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
                    PrimaryLecturerId = c.Lecturers
                        .Where(cl => !cl.IsDeleted)
                        .OrderByDescending(cl => cl.IsPrimary)
                        .Select(cl => (Guid?)cl.LecturerId)
                        .FirstOrDefault(),
                    PrimaryLecturerName = c.Lecturers
                        .Where(cl => !cl.IsDeleted)
                        .OrderByDescending(cl => cl.IsPrimary)
                        .Select(cl => cl.Lecturer!.FullName)
                        .FirstOrDefault(),
                    Lecturers = c.Lecturers
                        .Where(cl => !cl.IsDeleted)
                        .OrderByDescending(cl => cl.IsPrimary)
                        .Select(cl => new CourseLecturerDto
                        {
                            Id = cl.LecturerId,
                            FullName = cl.Lecturer!.FullName,
                            Email = cl.Lecturer.Email,
                            Phone = cl.Lecturer.Phone,
                            AvatarUrl = cl.Lecturer.AvatarUrl,
                            IsPrimary = cl.IsPrimary
                        })
                        .ToList(),
                    StudentCount = c.Students.Count(s => !s.IsDeleted),
                    CreatedAt = c.CreatedAt
                })
                .FirstAsync();
        }
    }
}
