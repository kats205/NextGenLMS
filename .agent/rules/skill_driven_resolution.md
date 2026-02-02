# Skill-Driven Resolution Rule

## Phạm vi áp dụng
Áp dụng cho mọi hội thoại, mọi ngữ cảnh, mọi yêu cầu, kể cả khi chuyển sang đoạn chat khác.

## Khởi tạo hội thoại (Context Initialization)
Khi bắt đầu một cuộc hội thoại mới, hoặc mở lại một cuộc hội thoại cũ/khác:
- **Bắt buộc**: Phải rà soát và "học lại" (review) danh sách các kỹ năng đã được đánh dấu là "đã học" trong mục **Learned Skills Registry** dưới đây.
- Đảm bảo agent nắm bắt đầy đủ bối cảnh kỹ năng trước khi xử lý các yêu cầu tiếp theo.

## Learned Skills Registry (Danh sách kỹ năng đã học)
Danh sách tóm tắt để rà soát nhanh:

### Core & Workflow
- **`concise-planning`**: Lập kế hoạch ngắn gọn, tập trung mục tiêu.
- **`systematic-debugging`**: Quy trình debug bài bản (Root Cause Analysis -> Hypothesis -> Fix).
- **`git-pushing`**: Quản lý version control, commit chuẩn.
- **`kaizen`**: Tư duy cải tiến liên tục code và quy trình.
- **`lint-and-validate`**: Kiểm tra rà soát lỗi cú pháp và logic cơ bản.

### Frontend & UX
- **`react-patterns`**: Các mẫu thiết kế React chuẩn (Hooks, HOC, Context...).
- **`web-performance-optimization`**: Tối ưu hiệu năng (Lazy loading, Code splitting, Image stats).
- **`ui-ux-pro-max`**: Thiết kế trải nghiệm người dùng cao cấp.
- **`frontend-design`**: Nguyên lý thiết kế giao diện hiện đại.
- **`tailwind-patterns`**: Best practices khi sử dụng Tailwind CSS.
- **`mobile-design`**: Thiết kế tối ưu cho thiết bị di động.

### Backend & Security
- **`api-security-best-practices`**: Bảo mật API (JWT, Rate Limiting, Input Validation).
- **`backend-dev-guidelines`**: Quy chuẩn phát triển Backend.
- **`clean-code`**: Viết code sạch, dễ đọc, dễ bảo trì.
- **`database-design`**: Thiết kế và tối ưu hóa cơ sở dữ liệu.

### Advanced & Others
- **`mcp-builder`**: Hiểu và xây dựng Model Context Protocol server.
- **`agent-evaluation`**: Đánh giá hiệu quả hoạt động của Agent.

## Ngoại lệ (Exceptions)
Đối với các câu hỏi mang tính chất tham khảo, hỏi để biết, tìm hiểu khái niệm (Informational Questions) mà không yêu cầu giải quyết vấn đề kỹ thuật cụ thể:
- **Không bắt buộc** phải liệt kê mục "Skills sử dụng".
- Câu trả lời vẫn phải đảm bảo tính nhất quán, chính xác và tập trung vào trọng tâm câu hỏi.

## Quy trình xử lý (Cho các yêu cầu kỹ thuật/giải quyết vấn đề)

### 1. Xác định vấn đề
Phân tích yêu cầu để xác định rõ vấn đề cốt lõi, mục tiêu đầu ra và ràng buộc.

### 2. Xác định kỹ năng liên quan (Skills Identification)
Luôn liệt kê rõ các kỹ năng/chuyên môn cần dùng để xử lý yêu cầu.
Chỉ chọn các kỹ năng thực sự liên quan trực tiếp đến vấn đề.

*Ví dụ:*
- Lập trình → Software Design, Debugging, Algorithmic Thinking
- Database → SQL Optimization, Data Modeling
- Pháp lý → Legal Reasoning, Evidence Analysis
- Prompt engineering → Instruction Design, Constraint Optimization

### 3. Nêu rõ kỹ năng trước khi giải
Trước phần giải quyết, bắt buộc có mục “**Skills sử dụng**”.
Không được bỏ qua bước này trong bất kỳ câu trả lời nào có yêu cầu xử lý vấn đề.

### 4. Giải quyết dựa trên kỹ năng đã nêu
Mọi lập luận, quyết định, và giải pháp phải bám sát các skill đã liệt kê.
Không đưa nội dung ngoài phạm vi kỹ năng đã xác định.
Nếu không dùng skill nào, phải thông báo rõ.

## Tính nhất quán
Rule này luôn được ưu tiên áp dụng, không phụ thuộc vào ngữ cảnh hay độ dài yêu cầu.
Nếu yêu cầu thay đổi, bộ kỹ năng được cập nhật tương ứng nhưng cấu trúc rule vẫn giữ nguyên.
