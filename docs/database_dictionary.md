# TỪ ĐIỂN DỮ LIỆU (DATA DICTIONARY)

Tài liệu mô tả chi tiết 20 bảng dữ liệu trong hệ thống NextGenLMS.

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
| `AvatarUrl` | `NVARCHAR` | Đường dẫn ảnh đại diện. |
| `RoleId` | `GUID (FK)` | Vai trò người dùng (`AppRoles`). |
| `DepartmentId` | `GUID (FK)` | Thuộc khoa nào (`Departments`). |
| `IsFirstLogin` | `BIT` | Cờ đánh dấu lần đầu đăng nhập. |

---

## 4. PHÂN HỆ KHÓA HỌC (COURSES)

### 4.1. Courses
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `CourseCode` | `NVARCHAR` | Mã lớp học phần (VD: NET101_FALL24). |
| `Name` | `NVARCHAR` | Tên môn học hiển thị. |
| `SemesterId` | `GUID (FK)` | Học kỳ (`Semesters`). |
| `AcademicYearId` | `GUID (FK)` | Niên khóa (`AcademicYears`). |
| `MajorId` | `GUID (FK)` | Ngành học (`Majors`). |
| `LecturerId` | `GUID (FK)` | Giảng viên phụ trách (`AppUsers`). |

### 4.2. Chapters
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Title` | `NVARCHAR` | Tên chương học. |
| `OrderIndex` | `INT` | Số thứ tự sắp xếp. |
| `CourseId` | `GUID (FK)` | Thuộc khóa học nào (`Courses`). |

### 4.3. CourseStudents
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `EnrolledDate` | `DATETIME2` | Ngày sinh viên vào lớp. |
| `CourseId` | `GUID (FK)` | Lớp học (`Courses`). |
| `StudentId` | `GUID (FK)` | Sinh viên (`AppUsers`). |

---

## 5. PHÂN HỆ NỘI DUNG (CONTENT - TPT)

> **Lưu ý TPT:** Các bảng con (`Lessons`, `Quizzes`, `Assignments`) chia sẻ chung **Id** với bảng cha `CourseContents`.

### 5.1. CourseContents (Bảng Cha)
| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- |
| `Title` | `NVARCHAR` | Tiêu đề nội dung. |
| `Type` | `INT` | Loại (1=Lesson, 2=Quiz, 3=Assignment). |
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
| `Type` | `INT` | Loại câu hỏi (Trắc nghiệm, Tự luận...). |
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
| `Points` | `INT` | Điểm số của câu hỏi trong đề này. |
| `QuizId` | `GUID (FK)` | Đề thi (`Quizzes`). |
| `QuestionId` | `GUID (FK)` | Câu hỏi (`Questions`). |

---

## 7. PHÂN HỆ THEO DÕI (TRACKING)

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
| `Score` | `FLOAT` | Điểm số đạt được. |
| `StartTime` | `DATETIME2` | Thời gian bắt đầu làm. |
| `EndTime` | `DATETIME2` | Thời gian nộp bài. |
| `TempData` | `NVARCHAR` | **JSON** lưu bài làm tạm thời (Resume). |
| `UpdatedAt` | `DATETIME2` | **Quan trọng**: Thời điểm Auto-save cuối cùng. |
| `QuizId` | `GUID (FK)` | Đề thi (`Quizzes`). |
| `StudentId` | `GUID (FK)` | Sinh viên (`AppUsers`). |
