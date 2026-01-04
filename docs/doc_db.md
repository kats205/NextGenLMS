# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN DOCUMENT)

**Dự án:** NextGenLMS
**Phiên bản:** 1.0
**Ngày cập nhật:** 05/01/2026

---

## MỤC LỤC

1.  **Tổng quan**
2.  **Kiến trúc Cốt lõi (Core Architecture)**
    *   2.1. Cơ chế Truy vết và Xóa mềm (BaseEntity & Audit)
    *   2.2. Chiến lược Kế thừa Nội dung (Table-Per-Type)
3.  **Chi tiết Nghiệp vụ Quan trọng**
    *   3.1. Phân hệ Thi cử & Chống gian lận (Quiz Engine)
    *   3.2. Phân hệ Theo dõi Tiến độ (Learning Progress)
4.  **Luồng Dữ liệu (Process Flow)**
    *   4.1. Quy trình Sinh viên Làm bài thi
    *   4.2. Quy trình Giảng viên Soạn thảo Nội dung
5.  **Cấu trúc Bảng (Schema Overview)**

---

## 1. TỔNG QUAN

Tài liệu này mô tả chi tiết kiến trúc Cơ sở dữ liệu của hệ thống quản lý học tập **NextGenLMS**. Thiết kế được tối ưu hóa cho hiệu năng cao, khả năng mở rộng (scalability) và đảm bảo tính toàn vẹn dữ liệu cho các quy trình thi cử trực tuyến.

---

## 2. KIẾN TRÚC CỐT LÕI

### 2.1. Cơ chế Truy vết và Xóa mềm (BaseEntity & Audit)

Mọi bảng dữ liệu trong hệ thống đều kế thừa từ một lớp cơ sở, đảm bảo tất cả các bản ghi đều có các thuộc tính quản trị sau:

*   **Id (GUID):** Khóa chính dạng Global Unique Identifier, giúp bảo mật và dễ dàng migrate dữ liệu.
*   **CreatedAt / UpdatedAt:** Ghi lại thời điểm tạo và cập nhật cuối cùng.
    *   *Ứng dụng:* Hệ thống sử dụng `UpdatedAt` để kiểm tra gian lận thời gian trong bài thi (so sánh thời gian lần lưu cuối với thời gian hiện tại).
*   **IsDeleted (Soft Delete):** Đánh dấu xóa thay vì xóa vĩnh viễn khỏi database.
    *   *Ứng dụng:* Giúp khôi phục dữ liệu nếu giảng viên xóa nhầm bài học hoặc sinh viên bị xóa nhầm khỏi lớp.

### 2.2. Chiến lược Kế thừa Nội dung (Table-Per-Type Strategy)

Hệ thống áp dụng chiến lược **Table-Per-Type (TPT)** cho module Nội dung khóa học để đảm bảo tính linh hoạt:

*   **Bảng Cha (`CourseContents`):** Lưu trữ thông tin chung (Tiêu đề, Thứ tự sắp xếp, Loại nội dung).
*   **Bảng Con (`Lessons`, `Quizzes`, `Assignments`):** Lưu trữ thông tin chi tiết đặc thù.

> **Lợi ích:** Cho phép một chương học (`Chapter`) chứa hỗn hợp nhiều loại nội dung (Video, Bài tập, Đề thi) theo một trình tự tùy ý, đồng thời dễ dàng mở rộng thêm các loại nội dung mới (như Livestream, SCORM) trong tương lai mà không ảnh hưởng cấu trúc cũ.

---

## 3. CHI TIẾT NGHIỆP VỤ QUAN TRỌNG

### 3.1. Phân hệ Thi cử & Chống gian lận (Quiz Engine)

Đây là phân hệ phức tạp nhất, được thiết kế với các cơ chế bảo mật sau:

*   **Xáo trộn Đề thi:**
    *   `ShuffleQuestions`: Nếu kích hoạt, thứ tự câu hỏi sẽ hiển thị khác nhau với mỗi sinh viên.
    *   `ShuffleAnswers`: Nếu kích hoạt, thứ tự đáp án (A, B, C, D) sẽ bị đảo lộn để chống gian lận.
*   **Lưu vết Bài làm (Submission Tracking):**
    *   `TempData` (Dạng JSON): Lưu trữ tạm thời các câu trả lời của sinh viên theo thời gian thực (Auto-save). Đây là cơ chế cốt lõi cho tính năng **"Làm bài tiếp khi mất mạng" (Resume)**.
    *   `StartTime` / `EndTime`: Ghi nhận thời gian thực tế bắt đầu và kết thúc để tính toán điểm số và kiểm tra vi phạm thời gian.

### 3.2. Phân hệ Theo dõi Tiến độ (Learning Progress)

Hệ thống ghi nhận chi tiết hành vi học tập của sinh viên:

*   **Video Resume:** Trường `VideoProgressSeconds` lưu lại giây thứ mấy học viên đang xem dở, cho phép tua đến đúng vị trí đó ở lần truy cập sau.
*   **Completion Tracking:** Trường `IsCompleted` xác nhận việc hoàn thành bài học, làm cơ sở cho tính năng "Mở khóa bài tiếp theo".

---

## 4. LUỒNG DỮ LIỆU (PROCESS FLOW)

### 4.1. Quy trình Sinh viên Làm bài thi

1.  **Bắt đầu (Start):**
    *   Sinh viên nhấn "Bắt đầu làm bài".
    *   Hệ thống tạo bản ghi `QuizSubmission` với trạng thái `InProgress`.
    *   Đề thi được tải về, câu hỏi và đáp án được xáo trộn nếu có cấu hình.

2.  **Làm bài (Attempt & Auto-save):**
    *   Sinh viên chọn đáp án.
    *   Cứ mỗi 30 giây (hoặc khi chuyển câu), hệ thống tự động gửi đáp án về Server.
    *   Server lưu chuỗi JSON vào cột `TempData` và cập nhật `UpdatedAt`.

3.  **Sự cố & Khôi phục (Resume):**
    *   Nếu mất mạng hoặc tắt trình duyệt, khi sinh viên quay lại, hệ thống lấy dữ liệu từ `TempData`.
    *   Giao diện bài thi được khôi phục 100% trạng thái cũ (đã chọn câu nào, còn bao nhiêu thời gian).

4.  **Nộp bài (Submit):**
    *   Sinh viên nhấn "Nộp bài".
    *   Hệ thống tính điểm, cập nhật `EndTime` và chuyển trạng thái sang `Submitted`.

### 4.2. Quy trình Giảng viên Soạn thảo Nội dung

1.  **Tạo Khóa học:** Giảng viên tạo thông tin chung (Tên, Mã lớp, Học kỳ).
2.  **Tạo Cấu trúc:** Tạo các Chương (Chapters).
3.  **Thêm Nội dung (Đa hình):**
    *   Giảng viên có thể Upload Video -> Hệ thống tạo bản ghi trong bảng `Lessons`.
    *   Giảng viên tạo Đề thi -> Hệ thống tạo bản ghi trong bảng `Quizzes`.
    *   Tất cả đều được liên kết với `Chapters` thông qua bảng cha `CourseContents`.
4.  **Ngân hàng Câu hỏi:** Câu hỏi (`Questions`) được tạo độc lập và có thể được tái sử dụng cho nhiều Đề thi khác nhau thông qua bảng liên kết `QuizQuestions`.

---

## 5. CẤU TRÚC BẢNG (SCHEMA OVERVIEW)

| Nhóm Chức Năng | Bảng Chính (Tables) | Vai Trò |
| :--- | :--- | :--- |
| **Quản trị Người dùng** | `AppUsers`, `AppRoles` | Quản lý tài khoản, phân quyền (Admin, Student, Lecturer), thông tin profile. |
| **Hệ thống Đào tạo** | `Departments`, `Majors`, `Semesters` | Quản lý Khoa, Ngành học, Niên khóa và Học kỳ. |
| **Quản lý Khóa học** | `Courses`, `Chapters`, `CourseStudents` | Quản lý lớp học phần, danh sách sinh viên tham gia. |
| **Nội dung Học tập** | `Lessons`, `Quizzes`, `Assignments` | Chi tiết nội dung bài giảng (Video/PDF), Bài kiểm tra, Bài tập về nhà. |
| **Ngân hàng Đề thi** | `Questions`, `Answers`, `QuizQuestions` | Quản lý câu hỏi trắc nghiệm/tự luận và đáp án. |
| **Theo dõi & Đánh giá** | `QuizSubmissions`, `LessonProgresses` | Lưu kết quả làm bài thi và tiến độ xem bài giảng của sinh viên. |

---
*Tài liệu này dùng cho mục đích tham khảo nội bộ nhóm phát triển dự án NextGenLMS.*
