# TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)

Tài liệu mô tả chi tiết các bảng dữ liệu trong hệ thống NextGenLMS.

---

## 1. QUY ƯỚC CHUNG (COMMON SCHEMA)

Tất cả các bảng bên dưới đều mặc định bao gồm 4 cột kế thừa từ `BaseEntity`. Các cột này sẽ **không được liệt kê lặp lại** trong danh sách chi tiết.

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Id` | `UNIQUEIDENTIFIER` | **PK**. Khóa chính sinh tự động (GUID). |
| `CreatedAt` | `DATETIME2` | Thời điểm tạo. |
| `UpdatedAt` | `DATETIME2` | Thời điểm cập nhật cuối (Null nếu chưa sửa). |
| `IsDeleted` | `BIT` | Cờ xóa mềm (1 = Đã xóa). |

---

## 2. PHÂN HỆ HỆ THỐNG (SYSTEM)

### 2.1. SystemConfigs
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `ConfigKey` | `NVARCHAR` | Mã cấu hình (VD: `MaxFileSize`). |
| `ConfigValue` | `NVARCHAR` | Giá trị cấu hình. |

### 2.2. AcademicYears
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Name` | `NVARCHAR` | Tên niên khóa (VD: 2023-2024). |
| `StartDate` | `DATETIME2` | Ngày bắt đầu niên khóa. |
| `EndDate` | `DATETIME2` | Ngày kết thúc niên khóa. |

### 2.3. Semesters
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Name` | `NVARCHAR` | Tên học kỳ (VD: Spring 2024). |

### 2.4. Departments
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Name` | `NVARCHAR` | Tên khoa/Bộ môn. |
| `Code` | `NVARCHAR` | Mã khoa (VD: FIT). |

### 2.5. Majors
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Name` | `NVARCHAR` | Tên ngành học. |
| `DepartmentId` | `GUID (FK)` | Thuộc khoa nào (`Departments`). |

---

## 3. PHÂN HỆ NGƯỜI DÙNG (USERS)

### 3.1. AppRoles
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `RoleName` | `NVARCHAR` | Tên vai trò (Admin, Lecturer, Student). |
| `Description` | `NVARCHAR` | Mô tả chi tiết vai trò. |

### 3.2. AppUsers
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Email` | `NVARCHAR` | Email đăng nhập. |
| `PasswordHash` | `NVARCHAR` | Mật khẩu đã mã hóa. |
| `FullName` | `NVARCHAR` | Họ và tên. |
| `StudentCode` | `NVARCHAR` | Mã sinh viên (Null nếu là Giảng viên). |
| `TeacherCode` | `NVARCHAR` | Mã giảng viên (Null nếu là Sinh viên). |
| `DateOfBirth` | `DATETIME2` | Ngày sinh. |
| `AvatarUrl` | `NVARCHAR` | Đường dẫn ảnh đại diện. |
| `RoleId` | `GUID (FK)` | Vai trò người dùng (`AppRoles`). |
| `DepartmentId` | `GUID (FK)` | Thuộc khoa nào (`Departments`). |
| `MustChangePassword` | `BIT` | Yêu cầu đổi mật khẩu lần đầu (Thay thế `IsFirstLogin`). |
| `Status` | `NVARCHAR` | Trạng thái (`Active`, `Inactive`, `Suspended`). |

### 3.3. PasswordResetTokens
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Email` | `NVARCHAR` | Email yêu cầu reset. |
| `Token` | `NVARCHAR` | Mã token xác thực. |
| `ExpiryDate` | `DATETIME2` | Thời gian hết hạn token. |
| `IsUsed` | `BIT` | Token đã được sử dụng chưa. |

---

## 4. PHÂN HỆ KHÓA HỌC (COURSES)

### 4.1. Courses
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `CourseCode` | `NVARCHAR` | Mã lớp học phần (VD: NET101_FALL24). |
| `Name` | `NVARCHAR` | Tên môn học hiển thị. |
| `Description` | `NVARCHAR` | Mô tả khóa học. |
| `ThumbnailUrl` | `NVARCHAR` | Ảnh đại diện khóa học. |
| `SemesterId` | `GUID (FK)` | Học kỳ (`Semesters`). |
| `AcademicYearId` | `GUID (FK)` | Niên khóa (`AcademicYears`). |
| `MajorId` | `GUID (FK)` | Ngành học (`Majors`). |

### 4.2. CourseLecturers (Many-to-Many)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `CourseId` | `GUID (FK)` | Khóa học (`Courses`). |
| `LecturerId` | `GUID (FK)` | Giảng viên (`AppUsers`). |
| `IsPrimary` | `BIT` | Giảng viên chính (True/False). |

### 4.3. Chapters
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Title` | `NVARCHAR` | Tên chương học. |
| `OrderIndex` | `INT` | Số thứ tự sắp xếp. |
| `CourseId` | `GUID (FK)` | Thuộc khóa học nào (`Courses`). |

### 4.4. CourseStudents
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `EnrolledDate` | `DATETIME2` | Ngày sinh viên vào lớp. |
| `Source` | `NVARCHAR` | Nguồn ghi danh (`SIS`, `Manual`, `Import`). |
| `CourseId` | `GUID (FK)` | Lớp học (`Courses`). |
| `StudentId` | `GUID (FK)` | Sinh viên (`AppUsers`). |

---

## 5. PHÂN HỆ NỘI DUNG (CONTENT - TPT)

> **Lưu ý TPT:** Các bảng con (`Lessons`, `Quizzes`, `Assignments`, `Announcements`) chia sẻ chung **Id** với bảng cha `CourseContents`.

### 5.1. CourseContents (Bảng Cha)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Title` | `NVARCHAR` | Tiêu đề nội dung. |
| `Type` | `INT` | Loại (1=Lesson, 2=Quiz, 3=Assignment, 4=Announcement). |
| `OrderIndex` | `INT` | Thứ tự trong chương. |
| `ChapterId` | `GUID (FK)` | Thuộc chương nào (`Chapters`). |

### 5.2. Lessons (Bảng Con)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `FileUrl` | `NVARCHAR` | Link file Video/PDF. |
| `DurationSeconds`| `INT` | Thời lượng bài giảng (giây). |
| `ContentHtml` | `NVARCHAR` | Nội dung văn bản (Rich Text). |

### 5.3. Quizzes (Bảng Con)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `DurationMinutes`| `INT` | Thời gian làm bài (phút). |
| `OpenTime` | `DATETIME2` | Thời gian mở đề. |
| `CloseTime` | `DATETIME2` | Thời gian đóng đề. |
| `ShuffleQuestions`| `BIT` | Có trộn câu hỏi không? |
| `ShuffleAnswers` | `BIT` | Có trộn đáp án không? |

### 5.4. Assignments (Bảng Con)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `DueDate` | `DATETIME2` | Hạn nộp bài. |
| `MaxScore` | `INT` | Điểm số tối đa. |
| `AssignmentDescription`| `NVARCHAR` | Mô tả bài tập. |

### 5.5. Announcements (Bảng Con - Mới)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `ContentHtml` | `NVARCHAR` | Nội dung thông báo (Rich Text). |
| `AttachmentsJson` | `NVARCHAR` | JSON chứa danh sách file đính kèm. |

---

## 6. PHÂN HỆ ĐÁNH GIÁ (ASSESSMENT)

### 6.1. QuestionTopics
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Name` | `NVARCHAR` | Tên chủ đề câu hỏi. |
| `LecturerId` | `GUID (FK)` | Giảng viên tạo chủ đề. |

### 6.2. Questions
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `ContentText` | `NVARCHAR` | Nội dung câu hỏi. |
| `Type` | `INT` | Loại câu hỏi (`MultipleChoice`, `TrueFalse`, `FillInTheBlank`, `Essay`...). |
| `TopicId` | `GUID (FK)` | Thuộc chủ đề nào (`QuestionTopics`). |

### 6.3. Answers
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `ContentText` | `NVARCHAR` | Nội dung đáp án. |
| `IsCorrect` | `BIT` | Là đáp án đúng (True/False). |
| `QuestionId` | `GUID (FK)` | Thuộc câu hỏi nào (`Questions`). |

### 6.4. QuizQuestions
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Points` | `DOUBLE` | Điểm số của câu hỏi trong đề này. |
| `QuizId` | `GUID (FK)` | Đề thi (`Quizzes`). |
| `QuestionId` | `GUID (FK)` | Câu hỏi (`Questions`). |

---

## 7. PHÂN HỆ THEO DÕI & NỘP BÀI (TRACKING & SUBMISSION)

### 7.1. LessonProgresses
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `VideoProgressSeconds`| `INT` | Thời gian đã xem (giây). |
| `IsCompleted` | `BIT` | Đã hoàn thành bài học chưa. |
| `LastAccess` | `DATETIME2` | Thời điểm xem cuối cùng. |
| `LessonId` | `GUID (FK)` | Bài học (`Lessons`). |
| `UserId` | `GUID (FK)` | Sinh viên (`AppUsers`). |

### 7.2. QuizSubmissions
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Status` | `NVARCHAR` | Trạng thái (`InProgress`, `Submitted`). |
| `Score` | `DOUBLE` | Tổng điểm số đạt được. |
| `StartTime` | `DATETIME2` | Thời gian bắt đầu làm. |
| `EndTime` | `DATETIME2` | Thời gian nộp bài. |
| `AutoSavedAt` | `DATETIME2` | Thời điểm tự động lưu cuối cùng. |
| `QuizId` | `GUID (FK)` | Đề thi (`Quizzes`). |
| `StudentId` | `GUID (FK)` | Sinh viên (`AppUsers`). |

### 7.3. AttemptQuestionSnapshots (Chống gian lận & Integrity)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `QuizSubmissionId` | `GUID (FK)` | Bài nộp (`QuizSubmissions`). |
| `QuestionId` | `GUID (FK)` | Câu hỏi (`Questions`). |
| `OrderIndex` | `INT` | Thứ tự câu hỏi hiển thị cho sinh viên này. |
| `QuestionTextSnapshot` | `NVARCHAR` | **Snapshot** nội dung câu hỏi lúc làm bài. |
| `AnswersSnapshotJson` | `NVARCHAR` | **Snapshot** danh sách đáp án đã xáo trộn. |
| `StudentAnswerJson` | `NVARCHAR` | Câu trả lời của sinh viên. |
| `PointsAchieved` | `DOUBLE` | Điểm đạt được cho câu này. |
| `IsCorrect` | `BIT` | Đúng/Sai. |

### 7.4. EssaySubmissions (Chấm tự luận)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `QuizSubmissionId` | `GUID (FK)` | Bài nộp (`QuizSubmissions`). |
| `QuestionId` | `GUID (FK)` | Câu hỏi tự luận. |
| `SubmissionText` | `NVARCHAR` | Đoạn văn trả lời. |
| `FileUrl` | `NVARCHAR` | File đính kèm (nếu có). |
| `Score` | `DOUBLE` | Điểm giáo viên chấm. |
| `Feedback` | `NVARCHAR` | Nhận xét của giáo viên. |
| `GradedBy` | `GUID (FK)` | Người chấm (`AppUsers`). |
| `GradedAt` | `DATETIME2` | Thời gian chấm. |

---

## 8. PHÂN HỆ LOGS & NOTIFICATIONS (Mới)

### 8.1. AuditLogs (Truy vết Hệ thống)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `UserId` | `GUID` | Người thực hiện hành động. |
| `Action` | `NVARCHAR` | Hành động (`Create`, `Update`, `Delete`). |
| `ResourceType` | `NVARCHAR` | Loại tài nguyên (`User`, `Course`, ...). |
| `ResourceId` | `NVARCHAR` | ID tài nguyên. |
| `OldValue` | `NVARCHAR` | Giá trị cũ (JSON). |
| `NewValue` | `NVARCHAR` | Giá trị mới (JSON). |
| `Timestamp` | `DATETIME2` | Thời điểm log. |

### 8.2. ActivityLogs (Nhật ký Hoạt động User)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `UserId` | `GUID` | User liên quan. |
| `ActivityType` | `NVARCHAR` | Loại hoạt động (`Login`, `ViewCourse`, `SubmitQuiz`...). |
| `Description` | `NVARCHAR` | Mô tả chi tiết. |
| `IpAddress` | `NVARCHAR` | IP người dùng. |
| `UserAgent` | `NVARCHAR` | Thông tin trình duyệt/thiết bị. |

### 8.3. EmailTemplates
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `TemplateCode` | `NVARCHAR` | Mã mẫu (`WELCOME`, `RESET_PASS`...). |
| `SubjectTemplate` | `NVARCHAR` | Tiêu đề mẫu. |
| `BodyTemplateHtml` | `NVARCHAR` | Nội dung HTML mẫu. |

### 8.4. EmailQueues
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `ToEmail` | `NVARCHAR` | Email người nhận. |
| `Subject` | `NVARCHAR` | Tiêu đề email. |
| `BodyHtml` | `NVARCHAR` | Nội dung email. |
| `Status` | `NVARCHAR` | Trạng thái (`Pending`, `Sent`, `Failed`). |
| `RetryCount` | `INT` | Số lần thử lại. |
