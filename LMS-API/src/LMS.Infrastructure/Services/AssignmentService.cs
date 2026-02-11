using LMS.Application.Common;
using LMS.Application.Interfaces;
using LMS.Domain.Constant;
using LMS.Domain.Entities.Content;
using LMS.Domain.Entities.Assessment;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using LMS.Application.DTOs.Common;

namespace LMS.Infrastructure.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly AppDbContext _context;
        private readonly IFileStorageService _fileStorageService;

        public AssignmentService(AppDbContext context, IFileStorageService fileStorageService)
        {
            _context = context;
            _fileStorageService = fileStorageService;
        }

        public async Task<ServiceResult<AssignmentDetailDto>> GetAssignmentAsync(Guid assignmentId, Guid currentUserId)
        {
            try
            {
                var assignment = await _context.CourseContents
                    .OfType<Assignment>()
                    .FirstOrDefaultAsync(a => a.Id == assignmentId && !a.IsDeleted);

                if (assignment == null)
                {
                    return ServiceResult<AssignmentDetailDto>.Failure("Không tìm thấy bài tập");
                }

                var dto = new AssignmentDetailDto
                {
                    Id = assignment.Id,
                    Title = assignment.Title,
                    Description = assignment.Description,
                    DueDate = assignment.DueDate,
                    MaxScore = assignment.MaxScore,
                    AllowLateSubmission = assignment.AllowLateSubmission,
                    CreatedAt = assignment.CreatedAt
                };

                return ServiceResult<AssignmentDetailDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return ServiceResult<AssignmentDetailDto>.Failure("Có lỗi xảy ra", ex.Message);
            }
        }

        // Placeholder implementations for other methods
        public async Task<ServiceResult<AssignmentSubmissionDto>> CreateSubmissionAsync(CreateSubmissionDto createDto, Guid currentUserId)
        {
            try
            {
                var assignment = await _context.CourseContents
                    .OfType<Assignment>()
                    .FirstOrDefaultAsync(a => a.Id == createDto.AssignmentId && !a.IsDeleted);

                if (assignment == null)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Không tìm thấy bài tập");
                }

                // Check if assignment is overdue and late submission is not allowed
                if (assignment.DueDate.HasValue && DateTime.UtcNow > assignment.DueDate.Value && !assignment.AllowLateSubmission)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Bài tập đã quá hạn và không cho phép nộp trễ");
                }

                // Create or get virtual question for this assignment
                var virtualQuestionId = assignment.VirtualQuestionId;
                if (!virtualQuestionId.HasValue)
                {
                    // Create or get default topic for assignments
                    var defaultTopic = await _context.QuestionTopics
                        .FirstOrDefaultAsync(qt => qt.Name == "Assignment Topics");
                    
                    if (defaultTopic == null)
                    {
                        defaultTopic = new QuestionTopic
                        {
                            Id = Guid.NewGuid(),
                            Name = "Assignment Topics",
                            LecturerId = Guid.Parse("11111111-1111-1111-1111-111111111111") // Default lecturer
                        };
                        _context.QuestionTopics.Add(defaultTopic);
                    }

                    // Create a virtual question for this assignment
                    var virtualQuestion = new Question
                    {
                        Id = Guid.NewGuid(),
                        TopicId = defaultTopic.Id,
                        ContentText = $"Assignment: {assignment.Title}",
                        Type = QuestionType.Essay
                    };
                    
                    _context.Questions.Add(virtualQuestion);
                    
                    // Update assignment with virtual question ID
                    assignment.VirtualQuestionId = virtualQuestion.Id;
                    virtualQuestionId = virtualQuestion.Id;
                }

                // Check existing submissions count first
                var existingSubmissions = await _context.EssaySubmissions
                    .Where(es => es.QuestionId == virtualQuestionId && 
                                es.QuizSubmission!.StudentId == currentUserId)
                    .CountAsync();

                if (assignment.MaxAttempts > 0 && existingSubmissions >= assignment.MaxAttempts)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure($"Bạn đã hết số lần nộp bài (tối đa {assignment.MaxAttempts} lần)");
                }

                // Create a dummy quiz for assignment submissions (required by the database structure)
                var dummyQuizId = Guid.NewGuid();
                var dummyQuiz = new Quiz
                {
                    Id = dummyQuizId,
                    ChapterId = assignment.ChapterId, // Sử dụng ChapterId từ assignment
                    Title = $"Assignment Quiz: {assignment.Title}",
                    Type = ContentType.Quiz,
                    OrderIndex = assignment.OrderIndex + 1000, // Đặt order index cao để không ảnh hưởng đến thứ tự hiển thị
                    DurationMinutes = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Quizzes.Add(dummyQuiz);

                // Create a quiz submission for this assignment
                var quizSubmissionId = Guid.NewGuid();
                var submissionMetadata = new
                {
                    AssignmentId = assignment.Id,
                    StudentId = currentUserId,
                    Links = createDto.Links?.Select(link => new LinkDto { Url = link }).ToList() ?? new List<LinkDto>(),
                    Status = createDto.SaveAsDraft ? "Draft" : "Submitted",
                    AttemptNumber = existingSubmissions + 1,
                    SubmittedAt = createDto.SaveAsDraft ? (DateTime?)null : DateTime.UtcNow
                };

                var quizSubmission = new QuizSubmission
                {
                    Id = quizSubmissionId,
                    QuizId = dummyQuizId, // Use the dummy quiz ID
                    StudentId = currentUserId,
                    StartTime = DateTime.UtcNow,
                    Status = createDto.SaveAsDraft ? "Draft" : "Submitted",
                    TempData = JsonSerializer.Serialize(submissionMetadata) // Lưu metadata vào TempData
                };
                _context.QuizSubmissions.Add(quizSubmission);

                // Handle file uploads
                var attachments = new List<AttachmentDto>();
                if (createDto.Files?.Any() == true)
                {
                    foreach (var file in createDto.Files)
                    {
                        if (file.Length > assignment.MaxFileSize)
                        {
                            return ServiceResult<AssignmentSubmissionDto>.Failure($"File {file.FileName} vượt quá kích thước cho phép ({assignment.MaxFileSize / 1024 / 1024}MB)");
                        }

                        // Check file type if restrictions exist
                        if (!string.IsNullOrEmpty(assignment.AllowedFileTypes))
                        {
                            var allowedTypes = assignment.AllowedFileTypes.Split(',').Select(t => t.Trim()).ToList();
                            var fileExtension = Path.GetExtension(file.FileName).ToLower();
                            if (allowedTypes.Any() && !allowedTypes.Contains(fileExtension))
                            {
                                return ServiceResult<AssignmentSubmissionDto>.Failure($"Định dạng file {fileExtension} không được phép");
                            }
                        }

                        // Upload file
                        var fileUrl = await _fileStorageService.UploadFileAsync(file, "assignments");
                        attachments.Add(new AttachmentDto
                        {
                            Id = Guid.NewGuid(),
                            FileName = file.FileName,
                            FileUrl = fileUrl,
                            FileType = file.ContentType,
                            FileSize = file.Length,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                // Create submission data
                var submissionData = new
                {
                    AssignmentId = assignment.Id,
                    StudentId = currentUserId,
                    TextContent = createDto.TextContent,
                    Attachments = attachments,
                    Links = createDto.Links?.Select(link => new LinkDto { Url = link }).ToList() ?? new List<LinkDto>(),
                    Status = createDto.SaveAsDraft ? "Draft" : "Submitted",
                    AttemptNumber = existingSubmissions + 1,
                    SubmittedAt = createDto.SaveAsDraft ? (DateTime?)null : DateTime.UtcNow
                };

                // Create EssaySubmission record
                var submission = new EssaySubmission
                {
                    Id = Guid.NewGuid(),
                    QuizSubmissionId = quizSubmissionId,
                    QuestionId = virtualQuestionId.Value,
                    SubmissionText = createDto.TextContent, // Chỉ lưu text content
                    FileUrl = attachments.Any() ? JsonSerializer.Serialize(attachments) : null, // Lưu JSON files vào FileUrl
                    Score = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.EssaySubmissions.Add(submission);
                await _context.SaveChangesAsync();

                return ServiceResult<AssignmentSubmissionDto>.Success(MapToSubmissionDto(submission, assignment));
            }
            catch (Exception ex)
            {
                return ServiceResult<AssignmentSubmissionDto>.Failure("Có lỗi xảy ra khi tạo bài nộp", ex.Message);
            }
        }

        public async Task<ServiceResult<AssignmentSubmissionDto>> UpdateSubmissionAsync(Guid submissionId, UpdateSubmissionDto updateDto, Guid currentUserId)
        {
            try
            {
                // Find the submission
                var submission = await _context.EssaySubmissions
                    .Include(es => es.QuizSubmission)
                    .FirstOrDefaultAsync(es => es.Id == submissionId && 
                                              es.QuizSubmission!.StudentId == currentUserId);

                if (submission == null)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Không tìm thấy bài nộp");
                }

                // Get assignment info
                var assignment = await _context.CourseContents
                    .OfType<Assignment>()
                    .FirstOrDefaultAsync(a => a.VirtualQuestionId == submission.QuestionId);

                if (assignment == null)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Không tìm thấy bài tập");
                }

                // Check if assignment is overdue and late submission is not allowed
                if (assignment.DueDate.HasValue && DateTime.UtcNow > assignment.DueDate.Value && !assignment.AllowLateSubmission)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Bài tập đã quá hạn và không cho phép nộp trễ");
                }

                // Handle file uploads
                var attachments = new List<AttachmentDto>();
                if (updateDto.Files?.Any() == true)
                {
                    foreach (var file in updateDto.Files)
                    {
                        if (file.Length > assignment.MaxFileSize)
                        {
                            return ServiceResult<AssignmentSubmissionDto>.Failure($"File {file.FileName} vượt quá kích thước cho phép ({assignment.MaxFileSize / 1024 / 1024}MB)");
                        }

                        // Check file type if restrictions exist
                        if (!string.IsNullOrEmpty(assignment.AllowedFileTypes))
                        {
                            var allowedTypes = assignment.AllowedFileTypes.Split(',').Select(t => t.Trim()).ToList();
                            var fileExtension = Path.GetExtension(file.FileName).ToLower();
                            if (allowedTypes.Any() && !allowedTypes.Contains(fileExtension))
                            {
                                return ServiceResult<AssignmentSubmissionDto>.Failure($"Định dạng file {fileExtension} không được phép");
                            }
                        }

                        // Upload file
                        var fileUrl = await _fileStorageService.UploadFileAsync(file, "assignments");
                        attachments.Add(new AttachmentDto
                        {
                            Id = Guid.NewGuid(),
                            FileName = file.FileName,
                            FileUrl = fileUrl,
                            FileType = file.ContentType,
                            FileSize = file.Length,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                // Merge with existing attachments if keeping old files
                var existingAttachments = new List<AttachmentDto>();
                if (!string.IsNullOrEmpty(submission.FileUrl))
                {
                    try
                    {
                        existingAttachments = JsonSerializer.Deserialize<List<AttachmentDto>>(submission.FileUrl) ?? new List<AttachmentDto>();
                    }
                    catch
                    {
                        // Ignore if can't parse existing attachments
                    }
                }

                // Remove files marked for deletion and delete from cloud storage
                var filesToDelete = new List<AttachmentDto>();
                if (updateDto.RemoveAttachmentIds?.Any() == true)
                {
                    // Find files to delete
                    filesToDelete = existingAttachments
                        .Where(att => updateDto.RemoveAttachmentIds.Contains(att.Id))
                        .ToList();
                    
                    // Delete files from cloud storage
                    foreach (var fileToDelete in filesToDelete)
                    {
                        try
                        {
                            // Extract public ID from URL for cloud deletion
                            var publicId = ExtractPublicIdFromUrl(fileToDelete.FileUrl);
                            if (!string.IsNullOrEmpty(publicId))
                            {
                                await _fileStorageService.DeleteFileAsync(publicId);
                            }
                        }
                        catch (Exception ex)
                        {
                            // Log error but don't fail the entire operation
                            Console.WriteLine($"Failed to delete file from cloud: {fileToDelete.FileName}, Error: {ex.Message}");
                        }
                    }
                    
                    // Remove from attachments list
                    existingAttachments = existingAttachments
                        .Where(att => !updateDto.RemoveAttachmentIds.Contains(att.Id))
                        .ToList();
                }

                // Combine existing and new attachments
                var allAttachments = existingAttachments.Concat(attachments).ToList();

                // Update submission
                submission.SubmissionText = updateDto.TextContent;
                submission.FileUrl = allAttachments.Any() ? JsonSerializer.Serialize(allAttachments) : null;
                submission.UpdatedAt = DateTime.UtcNow;

                // Update quiz submission status and metadata
                submission.QuizSubmission!.Status = updateDto.SaveAsDraft ? "Draft" : "Submitted";
                
                // Update metadata in TempData
                var submissionMetadata = new
                {
                    AssignmentId = assignment.Id,
                    StudentId = currentUserId,
                    Links = updateDto.Links?.Select(link => new LinkDto { Url = link }).ToList() ?? new List<LinkDto>(),
                    Status = updateDto.SaveAsDraft ? "Draft" : "Submitted",
                    AttemptNumber = 1, // Keep original attempt number
                    SubmittedAt = updateDto.SaveAsDraft ? (DateTime?)null : DateTime.UtcNow
                };

                submission.QuizSubmission.TempData = JsonSerializer.Serialize(submissionMetadata);

                await _context.SaveChangesAsync();

                return ServiceResult<AssignmentSubmissionDto>.Success(MapToSubmissionDto(submission, assignment));
            }
            catch (Exception ex)
            {
                return ServiceResult<AssignmentSubmissionDto>.Failure("Có lỗi xảy ra khi cập nhật bài nộp", ex.Message);
            }
        }

        public async Task<ServiceResult<bool>> DeleteSubmissionAsync(Guid submissionId, Guid currentUserId)
        {
            return ServiceResult<bool>.Failure("Chức năng đang được phát triển");
        }

        public async Task<ServiceResult<AssignmentSubmissionDto>> GetSubmissionAsync(Guid submissionId, Guid currentUserId)
        {
            return ServiceResult<AssignmentSubmissionDto>.Failure("Chức năng đang được phát triển");
        }

        public async Task<ServiceResult<AssignmentSubmissionDto>> SubmitAssignmentAsync(SubmitAssignmentDto submitDto, Guid currentUserId)
        {
            return ServiceResult<AssignmentSubmissionDto>.Failure("Chức năng đang được phát triển");
        }

        public async Task<ServiceResult<AssignmentSubmissionDto>> UnsubmitAssignmentAsync(Guid submissionId, Guid currentUserId)
        {
            try
            {
                // Find the submission
                var submission = await _context.EssaySubmissions
                    .Include(es => es.QuizSubmission)
                    .FirstOrDefaultAsync(es => es.Id == submissionId && 
                                              es.QuizSubmission!.StudentId == currentUserId);

                if (submission == null)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Không tìm thấy bài nộp");
                }

                // Get assignment info to check deadline
                var assignment = await _context.CourseContents
                    .OfType<Assignment>()
                    .FirstOrDefaultAsync(a => a.VirtualQuestionId == submission.QuestionId);

                if (assignment == null)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Không tìm thấy bài tập");
                }

                // Check if assignment is overdue
                if (assignment.DueDate.HasValue && DateTime.UtcNow > assignment.DueDate.Value)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Không thể hủy bài nộp sau hạn nộp");
                }

                // Check if already unsubmitted
                if (submission.QuizSubmission!.Status.ToLower() == "draft")
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Bài nộp đã ở trạng thái nháp");
                }

                // Update status to Draft (keep all data, just change status)
                submission.QuizSubmission.Status = "Draft";
                submission.UpdatedAt = DateTime.UtcNow;

                // Update metadata in TempData to reflect the status change
                if (!string.IsNullOrEmpty(submission.QuizSubmission.TempData))
                {
                    try
                    {
                        var metadata = JsonSerializer.Deserialize<JsonElement>(submission.QuizSubmission.TempData);
                        var metadataDict = new Dictionary<string, object>();
                        
                        foreach (var prop in metadata.EnumerateObject())
                        {
                            if (prop.Name == "Status")
                            {
                                metadataDict[prop.Name] = "Draft";
                            }
                            else if (prop.Name == "SubmittedAt")
                            {
                                metadataDict[prop.Name] = null;
                            }
                            else
                            {
                                metadataDict[prop.Name] = prop.Value.GetRawText().Trim('"');
                            }
                        }

                        submission.QuizSubmission.TempData = JsonSerializer.Serialize(metadataDict);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error updating metadata: {ex.Message}");
                    }
                }

                await _context.SaveChangesAsync();

                return ServiceResult<AssignmentSubmissionDto>.Success(MapToSubmissionDto(submission, assignment));
            }
            catch (Exception ex)
            {
                return ServiceResult<AssignmentSubmissionDto>.Failure("Có lỗi xảy ra khi hủy bài nộp", ex.Message);
            }
        }

        public async Task<ServiceResult<AssignmentSubmissionDto>> GradeSubmissionAsync(GradeSubmissionDto gradeDto, Guid currentUserId)
        {
            return ServiceResult<AssignmentSubmissionDto>.Failure("Chức năng đang được phát triển");
        }

        public async Task<ServiceResult<AssignmentSubmissionDto>> GetMySubmissionAsync(Guid assignmentId, Guid currentUserId)
        {
            try
            {
                var assignment = await _context.CourseContents
                    .OfType<Assignment>()
                    .FirstOrDefaultAsync(a => a.Id == assignmentId && !a.IsDeleted);

                if (assignment == null)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Không tìm thấy bài tập");
                }

                if (!assignment.VirtualQuestionId.HasValue)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Bạn chưa có bài nộp cho bài tập này");
                }

                var submission = await _context.EssaySubmissions
                    .Include(es => es.QuizSubmission)
                    .Where(es => es.QuestionId == assignment.VirtualQuestionId && 
                                es.QuizSubmission!.StudentId == currentUserId)
                    .OrderByDescending(es => es.CreatedAt)
                    .FirstOrDefaultAsync();

                if (submission == null)
                {
                    return ServiceResult<AssignmentSubmissionDto>.Failure("Bạn chưa có bài nộp cho bài tập này");
                }

                return ServiceResult<AssignmentSubmissionDto>.Success(MapToSubmissionDto(submission, assignment));
            }
            catch (Exception ex)
            {
                return ServiceResult<AssignmentSubmissionDto>.Failure("Có lỗi xảy ra", ex.Message);
            }
        }

        public async Task<ServiceResult<List<AssignmentSubmissionDto>>> GetMySubmissionHistoryAsync(Guid assignmentId, Guid currentUserId)
        {
            try
            {
                var assignment = await _context.CourseContents
                    .OfType<Assignment>()
                    .FirstOrDefaultAsync(a => a.Id == assignmentId && !a.IsDeleted);

                if (assignment == null)
                {
                    return ServiceResult<List<AssignmentSubmissionDto>>.Failure("Không tìm thấy bài tập");
                }

                if (!assignment.VirtualQuestionId.HasValue)
                {
                    return ServiceResult<List<AssignmentSubmissionDto>>.Success(new List<AssignmentSubmissionDto>());
                }

                var submissions = await _context.EssaySubmissions
                    .Include(es => es.QuizSubmission)
                    .Where(es => es.QuestionId == assignment.VirtualQuestionId && 
                                es.QuizSubmission!.StudentId == currentUserId)
                    .OrderByDescending(es => es.CreatedAt)
                    .ToListAsync();

                var submissionDtos = submissions.Select(s => MapToSubmissionDto(s, assignment)).ToList();
                return ServiceResult<List<AssignmentSubmissionDto>>.Success(submissionDtos);
            }
            catch (Exception ex)
            {
                return ServiceResult<List<AssignmentSubmissionDto>>.Failure("Có lỗi xảy ra", ex.Message);
            }
        }

        private AssignmentSubmissionDto MapToSubmissionDto(EssaySubmission submission, Assignment assignment)
        {
            try
            {
                // Đơn giản: Đọc status từ QuizSubmission.Status
                var status = submission.QuizSubmission?.Status ?? "Draft";
                
                // Đơn giản: Parse attachments từ FileUrl
                var attachments = new List<AttachmentDto>();
                if (!string.IsNullOrEmpty(submission.FileUrl))
                {
                    try
                    {
                        attachments = JsonSerializer.Deserialize<List<AttachmentDto>>(submission.FileUrl) ?? new List<AttachmentDto>();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing FileUrl: {ex.Message}");
                        attachments = new List<AttachmentDto>();
                    }
                }
                
                // Parse metadata từ TempData (nếu có)
                var attemptNumber = 1;
                DateTime? submittedAt = null;
                var links = new List<LinkDto>();
                
                if (!string.IsNullOrEmpty(submission.QuizSubmission?.TempData))
                {
                    try
                    {
                        var metadata = JsonSerializer.Deserialize<JsonElement>(submission.QuizSubmission.TempData);
                        
                        attemptNumber = metadata.TryGetProperty("AttemptNumber", out var attemptProp) ? 
                            attemptProp.GetInt32() : 1;
                            
                        if (metadata.TryGetProperty("SubmittedAt", out var submittedAtProp) && 
                            submittedAtProp.ValueKind != JsonValueKind.Null)
                        {
                            submittedAt = submittedAtProp.GetDateTime();
                        }
                        
                        if (metadata.TryGetProperty("Links", out var linksProp) && linksProp.ValueKind == JsonValueKind.Array)
                        {
                            links = JsonSerializer.Deserialize<List<LinkDto>>(linksProp.GetRawText()) ?? new List<LinkDto>();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error parsing TempData: {ex.Message}");
                    }
                }
                
                return new AssignmentSubmissionDto
                {
                    Id = submission.Id,
                    AssignmentId = assignment.Id,
                    StudentId = submission.QuizSubmission?.StudentId ?? Guid.Empty,
                    TextContent = submission.SubmissionText,
                    Status = status,
                    Score = (int?)submission.Score,
                    Feedback = submission.Feedback,
                    CreatedAt = submission.CreatedAt,
                    UpdatedAt = submission.UpdatedAt,
                    GradedAt = submission.GradedAt,
                    AttemptNumber = attemptNumber,
                    IsLate = assignment.DueDate.HasValue && (submittedAt ?? submission.CreatedAt) > assignment.DueDate.Value,
                    Attachments = attachments,
                    Links = links,
                    Comments = new List<SubmissionCommentDto>()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in MapToSubmissionDto: {ex.Message}");
                // Fallback
                return new AssignmentSubmissionDto
                {
                    Id = submission.Id,
                    AssignmentId = assignment.Id,
                    StudentId = submission.QuizSubmission?.StudentId ?? Guid.Empty,
                    TextContent = submission.SubmissionText,
                    Status = "Draft",
                    CreatedAt = submission.CreatedAt,
                    UpdatedAt = submission.UpdatedAt,
                    AttemptNumber = 1,
                    Attachments = new List<AttachmentDto>(),
                    Links = new List<LinkDto>(),
                    Comments = new List<SubmissionCommentDto>()
                };
            }
        }

        /// <summary>
        /// Extract public ID from cloud storage URL for deletion
        /// This method should be adapted based on your cloud storage provider
        /// </summary>
        private string ExtractPublicIdFromUrl(string fileUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(fileUrl))
                    return string.Empty;

                // For Cloudinary URLs, extract the public ID
                // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
                // Public ID would be: sample
                
                var uri = new Uri(fileUrl);
                var segments = uri.Segments;
                
                // Find the segment after 'upload/' and before file extension
                for (int i = 0; i < segments.Length; i++)
                {
                    if (segments[i].Contains("upload/"))
                    {
                        if (i + 2 < segments.Length) // Skip version segment
                        {
                            var fileName = segments[i + 2].TrimEnd('/');
                            // Remove file extension
                            var lastDotIndex = fileName.LastIndexOf('.');
                            if (lastDotIndex > 0)
                            {
                                return fileName.Substring(0, lastDotIndex);
                            }
                            return fileName;
                        }
                    }
                }
                
                // Fallback: use the filename without extension
                var pathSegments = fileUrl.Split('/');
                var lastSegment = pathSegments.LastOrDefault();
                if (!string.IsNullOrEmpty(lastSegment))
                {
                    var lastDotIndex = lastSegment.LastIndexOf('.');
                    if (lastDotIndex > 0)
                    {
                        return lastSegment.Substring(0, lastDotIndex);
                    }
                    return lastSegment;
                }
                
                return string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        public async Task<ServiceResult<List<AssignmentSubmissionListDto>>> GetAssignmentSubmissionsAsync(Guid assignmentId, Guid currentUserId)
        {
            return ServiceResult<List<AssignmentSubmissionListDto>>.Success(new List<AssignmentSubmissionListDto>());
        }

        public async Task<ServiceResult<AssignmentSubmissionDto>> GetStudentSubmissionAsync(Guid assignmentId, Guid studentId, Guid currentUserId)
        {
            return ServiceResult<AssignmentSubmissionDto>.Failure("Chức năng đang được phát triển");
        }

        public async Task<ServiceResult<SubmissionCommentDto>> CreateCommentAsync(CreateCommentDto createDto, Guid currentUserId)
        {
            return ServiceResult<SubmissionCommentDto>.Failure("Tính năng bình luận sẽ được triển khai sau");
        }

        public async Task<ServiceResult<SubmissionCommentDto>> UpdateCommentAsync(Guid commentId, UpdateCommentDto updateDto, Guid currentUserId)
        {
            return ServiceResult<SubmissionCommentDto>.Failure("Tính năng bình luận sẽ được triển khai sau");
        }

        public async Task<ServiceResult<bool>> DeleteCommentAsync(Guid commentId, Guid currentUserId)
        {
            return ServiceResult<bool>.Failure("Tính năng bình luận sẽ được triển khai sau");
        }

        public async Task<ServiceResult<List<SubmissionCommentDto>>> GetSubmissionCommentsAsync(Guid submissionId, Guid currentUserId)
        {
            return ServiceResult<List<SubmissionCommentDto>>.Success(new List<SubmissionCommentDto>());
        }

        // Permission methods
        public async Task<bool> CanUserAccessAssignmentAsync(Guid assignmentId, Guid userId)
        {
            return true; // Simplified for now
        }

        public async Task<bool> CanUserSubmitAssignmentAsync(Guid assignmentId, Guid userId)
        {
            return true; // Simplified for now
        }

        public async Task<bool> CanUserGradeAssignmentAsync(Guid assignmentId, Guid userId)
        {
            return true; // Simplified for now
        }
    }
}