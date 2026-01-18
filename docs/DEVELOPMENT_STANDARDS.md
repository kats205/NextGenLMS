# Development Standards & Workflow

## 1. Công nghệ & Thư viện (Optimized Stack)

Để tối ưu hiệu năng và tốc độ phát triển, chúng ta sẽ sử dụng bộ Stack chuẩn sau:

### Backend (.NET 8 Clean Architecture)
| Công nghệ | Mục đích | Tại sao chọn? |
|---|---|---|
| **EF Core 8** | ORM (Truy xuất DB) | Hiệu năng cao nhất, hỗ trợ TPT tốt. |
| **AutoMapper** | Object Mapping | Giảm code lặp khi copy dữ liệu từ Entity sang DTO. |
| **FluentValidation** | Data Validation | Tách logic kiểm tra (VD: email rỗng, pass yếu) ra khỏi Controller. |
| **Ardalis.GuardClauses** | Defensive Coding | Bảo vệ Method khỏi null/invalid data ngay dòng đầu tiên. |
| **Serilog** | Logging | Ghi log ra file/console chuẩn hóa (Structured Logging). |
| **xUnit** | Unit Testing | Chuẩn mực testing của .NET. |

### Frontend (React + Vite)
| Công nghệ | Mục đích | Tại sao chọn? |
|---|---|---|
| **Vite** | Build Tool | Tốc độ khởi động siêu nhanh (nhanh hơn Webpack 10-100 lần). |
| **TanStack Query (React Query)** | Data Fetching | **Cực kỳ quan trọng**. Quản lý Caching, Loading state, Auto-refetching (thay thế useEffect). |
| **Zustand** | State Management | Nhẹ hơn Redux rất nhiều (1KB), code ít, hiệu quả cao. |
| **React Hook Form + Zod** | Form Validation | Hiệu năng render tốt hơn Formik, validate schema mạnh mẽ. |
| **TailwindCSS** | Styling | Utility-first, không lo xung đột CSS class. |
| **Axios** | HTTP Client | Có Interceptor mạnh (đã setup). |

---

## 2. Quy trình Thực hiện 1 Tính năng (Standard Workflow)

Mọi tính năng (VD: "Tạo khóa học") đều phải đi qua 6 bước chuẩn để đảm bảo Clean Architecture:

### Bước 1: Domain (Core)
- Tạo **Entity** (VD: `Course`).
- Định nghĩa các Business Rules (VD: `Course` phải có ít nhất 1 `Chapter`).

### Bước 2: Infrastructure (Data)
- Tạo **Migration**: `add-migration CreatedCourseTable`.
- Update **Repository**: Viết query (nếu Generic Repository chưa đủ).

### Bước 3: Application (Logic)
- Tạo **DTO**: `CreateCourseRequest`, `CourseDto`.
- Viết **Validator** (FluentValidation): Check tên rỗng, ngày bắt đầu > ngày kết thúc.
- Viết **Service**:
    - Nhận DTO.
    - Validate.
    - Gọi Repository để lưu DB.
    - Map Entity -> DTO trả về.

### Bước 4: API (Exposure)
- Tạo **Controller**:
    - Gọi Service.
    - Trả về `Ok(response)` hoặc `BadRequest(error)`.
    - **TUYỆT ĐỐI KHÔNG** viết logic if/else phức tạp ở đây.

### Bước 5: Frontend API
- Khai báo function trong `src/services/courseApi.js`.

### Bước 6: Frontend UI
- Tạo Component (Dùng TailWind).
- Dùng **React Query** (`useQuery`, `useMutation`) để gọi API.
- Dùng **React Hook Form** để bind dữ liệu nhập.

---

## 3. Quy tắc Coding (Coding Conventions)

### Backend
- **Async/Await**: 100% các thao tác I/O (DB, File) phải dùng Async.
- **Naming**:
    - Class/Method: `PascalCase` (`UserService`, `GetAllCourses`).
    - Biến local/Parameter: `camelCase` (`userId`, `courseName`).
    - Interface: Bắt đầu bằng `I` (`IUserRepository`).
- **Response**: Luôn trả về bọc trong Wrapper chuẩn (Success/Message/Data).

### Frontend
- **Component**: Functional Component 100% (Không dùng Class Component).
- **Hooks**: Logic phức tạp tách ra Custom Hook (`useCourseList`).
- **Folder Structure**:
    - `components/`: UI dùng chung (Button, Input).
    - `pages/`: Các màn hình chính.
    - `features/`: Logic theo module (Auth, Exam).

---

## 4. Git Workflow
- **Branching**:
    - `main`: Code chạy ổn định (Production).
    - `dev`: Code đang phát triển (Staging).
    - `feature/ten-tinh-nang`: Branch con của dev (VD: `feature/auth-login`).
- **Commits**: Chuẩn [Conventional Commits](https://www.conventionalcommits.org/):
    - `feat: add login page`
    - `fix: correct date format`
    - `chore: update readme`
