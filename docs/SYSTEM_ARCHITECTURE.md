# NextGenLMS - Architectural Overview

## 1. Kiến trúc Tổng quan (High-Level Architecture)
Dự án được xây dựng theo mô hình **Monolithic First** (để tối ưu tốc độ phát triển ban đầu) nhưng tuân thủ nghiêm ngặt **Clean Architecture** để sẵn sàng tách thành Microservices khi cần.

### 1.1. Backend (ASP.NET Core 8)
Sử dụng kiến trúc phân tầng (Layered Architecture) với quy tắc phụ thuộc một chiều (Dependencies point inwards):

*   **API Layer (`LMS.API`)**:
    *   Là tầng giao tiếp với Client (RESTful API).
    *   Chứa Controllers, Middleware (Auth, Logging, Exception Handling).
    *   Cấu hình Swagger, CORS, Dependency Injection.
*   **Infrastructure Layer (`LMS.Infrastructure`)**:
    *   Triển khai chi tiết kỹ thuật.
    *   **Entity Framework Core (Code-First)**: Quản lý Database Migration, DbContext.
    *   **Repositories**: Triển khai logic truy xuất dữ liệu.
*   **Application Layer (`LMS.Application`)** *(Đang phát triển)*:
    *   Chứa Business Logic (Services, DTOs).
    *   Điều phối luồng xử lý giữa API và Infrastructure.
*   **Domain Layer (`LMS.Domain`)**:
    *   **Trái tim của hệ thống.** Hoàn toàn độc lập, không phụ thuộc tầng nào khác.
    *   Chứa Entities, Value Objects, Domain Events.
    *   Logic cốt lõi (VD: `BaseEntity`, quan hệ TPT giữa `CourseContent`, `Lesson`, `Quiz`).

### 1.2. Frontend (React + Vite)
*   **Single Page Application (SPA)**: Tối ưu trải nghiệm người dùng, chuyển trang không reload.
*   **Tech Stack**:
    *   **React 18+**: UI Library.
    *   **Vite**: Build tool siêu tốc (thay thế Webpack).
    *   **Axios**: Quản lý API Client tập trung (Interceptors, Auth Header).
    *   **TailwindCSS**: Styling utility-first hiện đại.
    *   **Framer Motion**: Animations mượt mà.

### 1.3. Database (SQL Server 2022)
Thiết kế chuẩn hóa (Normalized) với các đặc điểm nổi bật:
*   **Single Primary Key**: Mọi bảng dùng `Id` (GUID) làm khóa chính duy nhất.
*   **Table-Per-Type (TPT)**: Áp dụng cho `CourseContents` (Cha) -> `Lessons`, `Quizzes`, `Assignments` (Con). Giúp Query linh hoạt (Lấy list nội dung chương bất kể loại).
*   **Indexing**: Tối ưu hóa sẵn index cho tất cả Foreign Keys.
*   **Soft Delete**: Cơ chế `IsDeleted` ở `BaseEntity` giúp an toàn dữ liệu.

---

## 2. Luồng hoạt động (Data Flow)
1.  **Client** gửi Request (kèm JWT Token) -> **API Controller**.
2.  **Controller** gọi **Service** (Application Layer).
3.  **Service** xử lý nghiệp vụ, gọi **Repository** (Infrastructure Layer).
4.  **Repository** truy vấn **SQL Server** qua **EF Core**.
5.  Dữ liệu trả về được map sang **DTO** (Data Transfer Object) -> Trả về Client.

---

## 3. Mở rộng Tương lai (Future Scalability)

### 3.1. Kỹ thuật (Technical)
*   **Caching (Redis)**: Khi lượng đọc (Read) tăng cao (VD: Xem danh sách khóa học), sẽ cache lại kết quả để giảm tải DB.
*   **Message Broker (RabbitMQ/Kafka)**: Tách các tác vụ nặng (gửi Email, xử lý Video upload) ra chạy nền (Background Jobs).
*   **Microservices**: Nếu module `Quiz` quá tải, có thể tách riêng thành `QuizService` độc lập mà không ảnh hưởng tới `CourseService`.

### 3.2. Tính năng (Functional)
*   **Real-time (SignalR)**: Thông báo điểm thi ngay lập tức, chat trực tuyến trong lớp học.
*   **AI Integration**: Tích hợp AI để gợi ý lộ trình học, tự động chấm bài tự luận.
*   **Mobile App**: Dùng chung API Backend hiện tại để phát triển App Flutter/React Native.

---

## 4. Trạng thái Dự án Hiện tại
*   [x] **Architecture Setup**: Đã cấu trúc folder chuẩn Clean Architecture.
*   [x] **Database**: Đã thiết kế xong Schema, có Script migration `schema_final.sql`.
*   [x] **API Foundation**: Đã có `AppDbContext`, HealthCheck API, Swagger.
*   [x] **Client Foundation**: Đã có React Base, Axios Client cấu hình chuẩn.
*   [ ] **Next Step**: Phát triển Business Logic (Repositories & Services) cho module Authentication, Courses.
