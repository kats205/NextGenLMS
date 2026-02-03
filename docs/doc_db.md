# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN DOCUMENT)

**Dự án:** NextGenLMS
**Phiên bản:** 1.1 (Cập nhật Align Business Rules)
**Ngày cập nhật:** 02/02/2026

---

## MỤC LỤC

1.  **Tổng quan**
2.  **Kiến trúc Cốt lõi (Core Architecture)**
    *   2.1. Cơ chế Truy vết và Xóa mềm (BaseEntity & Audit)
    *   2.2. Chiến lược Kế thừa Nội dung (Table-Per-Type)
3.  **Chi tiết Nghiệp vụ Quan trọng**
    *   3.1. Phân hệ Thi cử & Chống gian lận (Quiz Engine)
    *   3.2. Phân hệ Theo dõi Tiến độ & Log (Tracking & Logging)
    *   3.3. Quản lý Đa Giảng viên (Multi-Lecturer Support)
4.  **Luồng Dữ liệu (Process Flow)**
    *   4.1. Quy trình Sinh viên Làm bài thi
    *   4.2. Quy trình Giảng viên Soạn thảo Nội dung
5.  **Cấu trúc Bảng (Schema Overview)**

---

## 1. TỔNG QUAN

Tài liệu này mô tả chi tiết kiến trúc Cơ sở dữ liệu của hệ thống quản lý học tập **NextGenLMS**. Thiết kế được tối ưu hóa cho hiệu năng cao, khả năng mở rộng (scalability) và đảm bảo tính toàn vẹn dữ liệu cho các quy trình thi cử trực tuyến. Phiên bản 1.1 đã được cập nhật để hỗ trợ nhiều giảng viên trên một lớp, logic thi cử chặt chẽ hơn và hệ thống log toàn diện.

---

## 2. KIẾN TRÚC CỐT LÕI

### 2.1. Cơ chế Truy vết và Xóa mềm (BaseEntity & Audit)

Mọi bảng dữ liệu trong hệ thống đều kế thừa từ một lớp cơ sở, đảm bảo tất cả các bản ghi đều có các thuộc tính quản trị sau:

*   **Id (GUID):** Khóa chính dạng Global Unique Identifier, giúp bảo mật và dễ dàng migrate dữ liệu.
*   **CreatedAt / UpdatedAt:** Ghi lại thời điểm tạo và cập nhật cuối cùng.
    *   *Ứng dụng:* Hệ thống sử dụng `UpdatedAt` để kiểm tra gian lận thời gian trong bài thi (so sánh thời gian lần lưu cuối với thời gian hiện tại).
*   **IsDeleted (Soft Delete):** Đánh dấu xóa thay vì xóa vĩnh viễn khỏi database.
    *   *Ứng dụng:* Giúp khôi phục dữ liệu nếu giảng viên xóa nhầm bài học hoặc sinh viên bị xóa nhầm khỏi lớp.

**MỚI: Hệ thống Log chuyên sâu**
*   **AuditLogs:** Ghi lại mọi thay đổi dữ liệu (Ai làm gì, giá trị cũ/mới) để phục vụ kiểm toán hệ thống.
*   **ActivityLogs:** Ghi lại hành vi người dùng (Đăng nhập, Xem bài, Nộp bài) để phân tích trải nghiệm học tập.

### 2.2. Chiến lược Kế thừa Nội dung (Table-Per-Type Strategy)

Hệ thống áp dụng chiến lược **Table-Per-Type (TPT)** cho module Nội dung khóa học để đảm bảo tính linh hoạt:

*   **Bảng Cha (`CourseContents`):** Lưu trữ thông tin chung (Tiêu đề, Thứ tự sắp xếp, Loại nội dung).
*   **Bảng Con (`Lessons`, `Quizzes`, `Assignments`, `Announcements`):** Lưu trữ thông tin chi tiết đặc thù.

> **Lợi ích:** Cho phép một chương học (`Chapter`) chứa hỗn hợp nhiều loại nội dung (Video, Bài tập, Đề thi, Thông báo) theo một trình tự tùy ý, đồng thời dễ dàng mở rộng thêm các loại nội dung mới trong tương lai.

---

## 3. CHI TIẾT NGHIỆP VỤ QUAN TRỌNG

### 3.1. Phân hệ Thi cử & Chống gian lận (Quiz Engine)

Đây là phân hệ phức tạp nhất, được thiết kế với các cơ chế bảo mật và toàn vẹn dữ liệu cao:

*   **Snapshot Đề thi (`AttemptQuestionSnapshot`):**
    *   Khi sinh viên bắt đầu làm bài, hệ thống **sao chụp (snapshot)** toàn bộ nội dung câu hỏi và thứ tự đáp án vào bảng riêng.
    *   Điều này đảm bảo nếu ngân hàng câu hỏi gốc bị sửa đổi sau này, bài làm của sinh viên trong quá khứ không bị sai lệch.
*   **Xáo trộn Đề thi:**
    *   `ShuffleQuestions`: Thứ tự câu hỏi hiển thị khác nhau với mỗi sinh viên.
    *   `ShuffleAnswers`: Thứ tự đáp án (A, B, C, D) bị đảo lộn.
*   **Lưu vết Bài làm (Submission Tracking):**
    *   `AutoSavedAt`: Ghi nhận thời điểm lưu tự động.
    *   `AttemptQuestionSnapshot` lưu trữ câu trả lời chi tiết cho từng câu hỏi, kèm theo điểm số đạt được.

### 3.2. Phân hệ Theo dõi Tiến độ (Learning Progress)

Hệ thống ghi nhận chi tiết hành vi học tập của sinh viên:

*   **Video Resume:** Trường `VideoProgressSeconds` lưu lại giây thứ mấy học viên đang xem dở.
*   **Completion Tracking:** Trường `IsCompleted` xác nhận việc hoàn thành bài học.

### 3.3. Quản lý Đa Giảng viên (Multi-Lecturer Support)

*   Một lớp học phần (`Course`) giờ đây hỗ trợ **nhiều giảng viên** (`CourseLecturers`).
*   Có cờ `IsPrimary` để phân biệt giảng viên chịu trách nhiệm chính và các giảng viên/trợ giảng hỗ trợ.

---

## 4. LUỒNG DỮ LIỆU (PROCESS FLOW)

### 4.1. Quy trình Sinh viên Làm bài thi

1.  **Bắt đầu (Start):**
    *   Sinh viên nhấn "Bắt đầu làm bài".
    *   Hệ thống tạo `QuizSubmission`.
    *   **Quan trọng:** Hệ thống tạo các bản ghi `AttemptQuestionSnapshot` cho từng câu hỏi, lưu trữ nội dung câu hỏi và thứ tự đáp án đã xáo trộn *tại thời điểm đó*.

2.  **Làm bài (Attempt & Auto-save):**
    *   Sinh viên chọn đáp án.
    *   Hệ thống cập nhật câu trả lời vào `AttemptQuestionSnapshot` và update `AutoSavedAt` trong `QuizSubmission`.

3.  **Sự cố & Khôi phục (Resume):**
    *   Khi quay lại, hệ thống load lại đúng trạng thái từ các bản ghi Snapshot.

4.  **Nộp bài (Submit):**
    *   Sinh viên nhấn "Nộp bài".
    *   Hệ thống tính điểm tổng và cập nhật `EndTime`, chuyển trạng thái sang `Submitted`.

### 4.2. Quy trình Giảng viên Soạn thảo Nội dung

1.  **Tạo Khóa học:** Giảng viên hoặc Admin tạo lớp, gán danh sách Giảng viên (`CourseLecturers`).
2.  **Tạo Cấu trúc:** Tạo các Chương (Chapters).
3.  **Thêm Nội dung (Đa hình):**
    *   Upload Video/PDF -> `Lessons`.
    *   Tạo Đề thi -> `Quizzes`.
    *   Tạo Bài tập -> `Assignments`.
    *   Tạo Thông báo -> `Announcements`.
4.  **Ngân hàng Câu hỏi:** Câu hỏi (`Questions`) được tạo theo chủ đề và tái sử dụng qua `QuizQuestions`.

---

## 5. CẤU TRÚC BẢNG (SCHEMA OVERVIEW)

| Nhóm Chức Năng | Bảng Chính (Tables) | Vai Trò |
| :--- | :--- | :--- |
| **Quản trị Người dùng** | `AppUsers`, `AppRoles`, `PasswordResetTokens` | Quản lý tài khoản, phân quyền, bảo mật mật khẩu. |
| **Hệ thống Đào tạo** | `Departments`, `Majors`, `Semesters`, `AcademicYears` | Quản lý cấu trúc đào tạo của nhà trường. |
| **Quản lý Khóa học** | `Courses`, `Chapters`, `CourseLecturers`, `CourseStudents` | Quản lý lớp học, sinh viên và giảng viên tham gia. |
| **Nội dung Học tập** | `Lessons`, `Quizzes`, `Assignments`, `Announcements` | Chi tiết nội dung bài giảng đa phương tiện. |
| **Ngân hàng Đề thi** | `Questions`, `Answers`, `QuizQuestions`, `QuestionTopics` | Quản lý ngân hàng câu hỏi trắc nghiệm/tự luận. |
| **Theo dõi & Đánh giá** | `QuizSubmissions`, `AttemptQuestionSnapshots`, `EssaySubmissions` | Lưu kết quả làm bài thi, snapshot đề thi và chấm điểm tự luận. |
| **Logs & Notify** | `AuditLogs`, `ActivityLogs`, `EmailQueues` | Ghi nhật ký hệ thống và quản lý hàng đợi gửi email. |

---
*Tài liệu này dùng cho mục đích tham khảo nội bộ nhóm phát triển dự án NextGenLMS.*
