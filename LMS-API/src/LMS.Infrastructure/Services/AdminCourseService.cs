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
using LMS.Application.Interfaces;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace LMS.Infrastructure.Services
{
    public class AdminCourseService : IAdminCourseService
    {
        private readonly AppDbContext _context;
        private readonly IAdminEmailService _emailService;

        public AdminCourseService(AppDbContext context, IAdminEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<ServiceResult<PagedResultDto<AdminCourseDto>>> GetCoursesAsync(AdminCourseFilterDto filter)
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
                    .Select(c => new AdminCourseDto
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
                            .Select(cl => new AdminCourseLecturerDto
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

                var result = new PagedResultDto<AdminCourseDto>
                {
                    Items = items,
                    Page = filter.PageNumber,
                    PageSize = filter.PageSize,
                    TotalItems = totalCount
                };

                return ServiceResult<PagedResultDto<AdminCourseDto>>.Success(result, "Lấy danh sách khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<PagedResultDto<AdminCourseDto>>.Failure(
                    "Lỗi khi lấy danh sách khóa học",
                    ex.Message
                );
            }
        }

        public async Task<ServiceResult<AdminCourseDetailDto>> GetCourseByIdAsync(Guid id)
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
                    return ServiceResult<AdminCourseDetailDto>.Failure("Không tìm thấy khóa học");
                }

                var courseDetail = new AdminCourseDetailDto
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
                        .Select(cl => new AdminCourseLecturerDto
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
                        .Select(cs => new AdminStudentDto
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

                return ServiceResult<AdminCourseDetailDto>.Success(courseDetail, "Lấy thông tin khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<AdminCourseDetailDto>.Failure(
                    "Lỗi khi lấy thông tin khóa học",
                    ex.Message
                );
            }
        }

        public async Task<ServiceResult<AdminCourseDto>> CreateCourseAsync(AdminCreateCourseDto dto)
        {
            try
            {
                // Validate course code uniqueness
                var existingCourse = await _context.Courses
                    .AnyAsync(c => c.CourseCode == dto.CourseCode && !c.IsDeleted);

                if (existingCourse)
                {
                    return ServiceResult<AdminCourseDto>.Failure("Mã khóa học đã tồn tại");
                }

                // Validate foreign keys
                var semester = await _context.Semesters.FindAsync(dto.SemesterId);
                if (semester == null || semester.IsDeleted)
                {
                    return ServiceResult<AdminCourseDto>.Failure("Học kỳ không tồn tại");
                }

                var academicYear = await _context.AcademicYears.FindAsync(dto.AcademicYearId);
                if (academicYear == null || academicYear.IsDeleted)
                {
                    return ServiceResult<AdminCourseDto>.Failure("Năm học không tồn tại");
                }

                var major = await _context.Majors.FindAsync(dto.MajorId);
                if (major == null || major.IsDeleted)
                {
                    return ServiceResult<AdminCourseDto>.Failure("Ngành học không tồn tại");
                }

                if (dto.LecturerId != null && dto.LecturerId.Any())
                {
                    var distinctLecturerIds = dto.LecturerId.Distinct().ToList();
                    var lecturers = await _context.AppUsers
                        .Where(u => distinctLecturerIds.Contains(u.Id) && !u.IsDeleted)
                        .Select(u => new { u.Id, u.RoleId, u.Email, u.FullName })
                        .ToListAsync();

                    if (lecturers.Count != distinctLecturerIds.Count)
                    {
                        return ServiceResult<AdminCourseDto>.Failure("Giảng viên không tồn tại");
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
                        return ServiceResult<AdminCourseDto>.Failure("Danh sách giảng viên không hợp lệ (chỉ chấp nhận Lecturer/Admin)");
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

                    // Send Emails
                     var distinctLecturerIds = dto.LecturerId.Distinct().ToList();
                     var assignedLecturers = await _context.AppUsers
                        .Where(u => distinctLecturerIds.Contains(u.Id) && !u.IsDeleted)
                        .Select(u => new { u.Email, u.FullName })
                        .ToListAsync();

                     foreach (var l in assignedLecturers)
                     {
                         if (!string.IsNullOrEmpty(l.Email))
                         {
                             await _emailService.SendEmailAsync(
                                l.Email,
                                "Thông báo phân công giảng dạy",
                                $"<h3>Kính chào thầy/cô {l.FullName},</h3>" +
                                $"<p>Thầy/cô vừa được phân công giảng dạy cho học phần: <strong>{course.Name} ({course.CourseCode})</strong>.</p>" +
                                $"<p>Vui lòng đăng nhập hệ thống LMS để xem chi tiết.</p>" +
                                $"<br/><p>Trân trọng,</p><p>Phòng đào tạo</p>"
                             );
                         }
                     }
                }

                var createdCourse = await GetCourseDtoAsync(course.Id);
                return ServiceResult<AdminCourseDto>.Success(createdCourse, "Tạo khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<AdminCourseDto>.Failure(
                    "Lỗi khi tạo khóa học",
                    ex.Message
                );
            }
        }

        public async Task<ServiceResult<AdminCourseDto>> UpdateCourseAsync(Guid id, AdminUpdateCourseDto dto)
        {
            try
            {
                var course = await _context.Courses.FindAsync(id);
                if (course == null || course.IsDeleted)
                {
                    return ServiceResult<AdminCourseDto>.Failure("Không tìm thấy khóa học");
                }

                // Validate foreign keys if provided
                if (dto.SemesterId.HasValue)
                {
                    var semester = await _context.Semesters.FindAsync(dto.SemesterId.Value);
                    if (semester == null || semester.IsDeleted)
                    {
                        return ServiceResult<AdminCourseDto>.Failure("Học kỳ không tồn tại");
                    }
                    course.SemesterId = dto.SemesterId.Value;
                }

                if (dto.AcademicYearId.HasValue)
                {
                    var academicYear = await _context.AcademicYears.FindAsync(dto.AcademicYearId.Value);
                    if (academicYear == null || academicYear.IsDeleted)
                    {
                        return ServiceResult<AdminCourseDto>.Failure("Năm học không tồn tại");
                    }
                    course.AcademicYearId = dto.AcademicYearId.Value;
                }

                if (dto.MajorId.HasValue)
                {
                    var major = await _context.Majors.FindAsync(dto.MajorId.Value);
                    if (major == null || major.IsDeleted)
                    {
                        return ServiceResult<AdminCourseDto>.Failure("Ngành học không tồn tại");
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
                return ServiceResult<AdminCourseDto>.Success(updatedCourse, "Cập nhật khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<AdminCourseDto>.Failure(
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

                // If there is a soft-deleted relation, restore it instead of inserting a new row
                var existingAny = course.Lecturers.FirstOrDefault(cl => cl.LecturerId == lecturerId);
                var hasPrimary = course.Lecturers.Any(cl => !cl.IsDeleted && cl.IsPrimary);

                if (existingAny != null)
                {
                    if (!existingAny.IsDeleted)
                    {
                        return ServiceResult.Success("Giảng viên đã được phân quyền cho khóa học");
                    }

                    // restore soft-deleted relation
                    existingAny.IsDeleted = false;
                    existingAny.IsPrimary = !hasPrimary;
                    existingAny.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    _context.CourseLecturers.Add(new CourseLecturer
                    {
                        CourseId = courseId,
                        LecturerId = lecturerId,
                        IsPrimary = !hasPrimary
                    });
                }

                course.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Send Email Notification
                if (!string.IsNullOrEmpty(lecturer.Email))
                {
                    await _emailService.SendEmailAsync(
                        lecturer.Email,
                        "Thông báo phân công giảng dạy",
                        $"<h3>Kính chào thầy/cô {lecturer.FullName},</h3>" +
                        $"<p>Thầy/cô vừa được phân công giảng dạy cho học phần: <strong>{course.Name} ({course.CourseCode})</strong>.</p>" +
                        $"<p>Vui lòng đăng nhập hệ thống LMS để xem chi tiết.</p>" +
                        $"<br/><p>Trân trọng,</p><p>Phòng đào tạo</p>"
                    );
                }

                return ServiceResult.Success("Phân quyền giảng viên thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult.Failure("Lỗi khi phân quyền giảng viên", ex.Message);
            }
        }

        public async Task<ServiceResult> RemoveLecturerAsync(Guid courseId, Guid lecturerId)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Lecturers)
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

                if (course == null || course.IsDeleted)
                    return ServiceResult.Failure("Không tìm thấy khóa học");

                var cl = course.Lecturers.FirstOrDefault(x => x.LecturerId == lecturerId && !x.IsDeleted);
                if (cl == null)
                    return ServiceResult.Failure("Giảng viên chưa được phân công cho khóa học");

                // Soft delete the relation
                cl.IsDeleted = true;
                var wasPrimary = cl.IsPrimary;
                cl.IsPrimary = false;

                // If removed lecturer was primary, promote another lecturer (if any)
                if (wasPrimary)
                {
                    var other = course.Lecturers.FirstOrDefault(x => !x.IsDeleted && x.LecturerId != lecturerId);
                    if (other != null)
                    {
                        other.IsPrimary = true;
                    }
                }

                course.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ServiceResult.Success("Hủy phân công giảng viên thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult.Failure("Lỗi khi hủy phân công giảng viên", ex.Message);
            }
        }

        public async Task<ServiceResult> SetPrimaryLecturerAsync(Guid courseId, Guid lecturerId)
        {
            try
            {
                var course = await _context.Courses
                    .Include(c => c.Lecturers)
                    .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

                if (course == null || course.IsDeleted)
                    return ServiceResult.Failure("Không tìm thấy khóa học");

                var target = course.Lecturers.FirstOrDefault(x => x.LecturerId == lecturerId && !x.IsDeleted);
                if (target == null)
                    return ServiceResult.Failure("Giảng viên chưa được phân công cho khóa học");

                // unset all
                foreach (var cl in course.Lecturers.Where(x => !x.IsDeleted))
                {
                    cl.IsPrimary = false;
                }

                target.IsPrimary = true;
                course.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return ServiceResult.Success("Đặt giảng viên chính thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult.Failure("Lỗi khi đặt giảng viên chính", ex.Message);
            }
        }

        public async Task<ServiceResult<AdminCourseStatisticsDto>> GetCourseStatisticsAsync(Guid courseId)
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
                    return ServiceResult<AdminCourseStatisticsDto>.Failure("Không tìm thấy khóa học");
                }

                var contents = course.Chapters
                    .Where(ch => !ch.IsDeleted)
                    .SelectMany(ch => ch.Contents)
                    .Where(c => !c.IsDeleted)
                    .ToList();

                var statistics = new AdminCourseStatisticsDto
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

                return ServiceResult<AdminCourseStatisticsDto>.Success(statistics, "Lấy thống kê khóa học thành công");
            }
            catch (Exception ex)
            {
                return ServiceResult<AdminCourseStatisticsDto>.Failure(
                    "Lỗi khi lấy thống kê khóa học",
                    ex.Message
                );
            }
        }

        private async Task<AdminCourseDto> GetCourseDtoAsync(Guid id)
        {
            return await _context.Courses
                .Include(c => c.Semester)
                .Include(c => c.AcademicYear)
                .Include(c => c.Major)
                .Include(c => c.Lecturers)
                    .ThenInclude(cl => cl.Lecturer)
                .Include(c => c.Students)
                .Where(c => c.Id == id && !c.IsDeleted)
                .Select(c => new AdminCourseDto
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
                        .Select(cl => new AdminCourseLecturerDto
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

        public async Task<ServiceResult<byte[]>> ExportStudentsExcelAsync(LMS.Application.DTOs.Admin.ExportStudentsRequestDto request)
        {
            try
            {
                var query = _context.Courses
                    .Include(c => c.Lecturers).ThenInclude(cl => cl.Lecturer)
                    .Include(c => c.Students).ThenInclude(cs => cs.Student)
                    .Where(c => !c.IsDeleted)
                    .AsQueryable();

                if (!request.ExportAll && request.CourseCodes != null && request.CourseCodes.Any())
                {
                    var codes = request.CourseCodes.Select(x => x.Trim().ToLower()).ToList();
                    query = query.Where(c => codes.Contains(c.CourseCode.ToLower()) || codes.Contains(c.Name.ToLower()));
                }

                var courses = await query.ToListAsync();

                using (var package = new ExcelPackage())
                {
                    foreach (var course in courses)
                    {
                        var sheetName = string.IsNullOrWhiteSpace(course.CourseCode) ? course.Name : course.CourseCode;
                        if (sheetName.Length > 31) sheetName = sheetName.Substring(0, 31);

                        var ws = package.Workbook.Worksheets.Add(sheetName);

                        // Title
                        ws.Cells[1, 1, 1, 6].Merge = true;
                        ws.Cells[1, 1].Value = "Danh sách sinh viên";
                        ws.Cells[1, 1].Style.Font.Size = 16;
                        ws.Cells[1, 1].Style.Font.Bold = true;
                        ws.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                        // Course info
                        ws.Cells[2, 1].Value = $"Mã học phần: {course.CourseCode}";
                        ws.Cells[2, 1].Style.Font.Size = 13;
                        ws.Cells[2, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                        ws.Cells[3, 1].Value = $"Tên học phần: {course.Name}";
                        ws.Cells[3, 1].Style.Font.Size = 13;
                        ws.Cells[3, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                        var lecturerNames = course.Lecturers?
                            .Where(l => !l.IsDeleted && l.Lecturer != null)
                            .OrderByDescending(l => l.IsPrimary)
                            .Select(l => l.Lecturer!.FullName)
                            .ToArray() ?? Array.Empty<string>();

                        ws.Cells[4, 1].Value = $"Giảng viên giảng dạy: {string.Join(", ", lecturerNames)}";
                        ws.Cells[4, 1].Style.Font.Size = 13;
                        ws.Cells[4, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                        // Header
                        var headers = new[] { "Mã số sinh viên", "Họ tên", "Email", "Số điện thoại", "Mã khoa", "Ngày tháng năm sinh" };
                        var headerRow = 6;
                        for (int i = 0; i < headers.Length; i++)
                        {
                            ws.Cells[headerRow, i + 1].Value = headers[i];
                            ws.Cells[headerRow, i + 1].Style.Font.Bold = true;
                            ws.Cells[headerRow, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws.Column(i + 1).Width = 22;
                        }

                        // Rows
                        var row = headerRow + 1;
                        var students = course.Students?.Where(s => !s.IsDeleted).Select(s => s.Student).Where(st => st != null).ToList() ?? new List<Domain.Entities.Users.AppUser>();
                        foreach (var st in students)
                        {
                            ws.Cells[row, 1].Value = st!.StudentCode ?? string.Empty;
                            ws.Cells[row, 2].Value = st!.FullName;
                            ws.Cells[row, 3].Value = st!.Email;
                            ws.Cells[row, 4].Value = st!.Phone ?? string.Empty;
                            ws.Cells[row, 5].Value = st!.Department != null ? st.Department.Code : string.Empty;
                            if (st.DateOfBirth.HasValue)
                            {
                                ws.Cells[row, 6].Value = st.DateOfBirth.Value;
                                ws.Cells[row, 6].Style.Numberformat.Format = "dd/MM/yyyy";
                            }
                            else
                            {
                                ws.Cells[row, 6].Value = string.Empty;
                            }

                            for (int c = 1; c <= headers.Length; c++)
                                ws.Cells[row, c].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;

                            row++;
                        }
                    }

                    var bytes = package.GetAsByteArray();
                    return ServiceResult<byte[]>.Success(bytes, "Xuất file thành công");
                }
            }
            catch (Exception ex)
            {
                return ServiceResult<byte[]>.Failure("Lỗi khi xuất file Excel", ex.Message);
            }
        }
    }
}
