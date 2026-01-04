# Hướng dẫn Cài đặt Database thủ công (SQL Server)

File script `schema_full.sql` chứa toàn bộ cấu trúc bảng (Tables, Keys, Indexes) của dự án NextGenLMS. Để import vào SQL Server Management Studio (SSMS), bạn hãy làm theo các bước sau:

## Bước 1: Tạo Database Trống
Script này **KHÔNG** chứa lệnh tạo Database, vì vậy bạn cần tạo trước:
1.  Mở SSMS và kết nối vào SQL Server.
2.  Nhấn chuột phải vào **Databases** > chọn **New Database...**.
3.  Nhập tên database: **`NextGenLMS_Db`** (hoặc tên bất kỳ bạn muốn).
4.  Nhấn **OK**.

## Bước 2: Chạy Script
1.  Trong SSMS, nhấn **File** > **Open** > **File...** (hoặc nhấn `Ctrl + O`).
2.  Tìm và chọn file `schema_full.sql` trong thư mục code.
3.  **Quan trọng:** Nhìn lên thanh công cụ (Toolbar), tại ô dropdown **Available Databases**, hãy chắc chắn bạn đã chọn **`NextGenLMS_Db`**.
    *   *Mặc định nó thường là `master`, nếu chạy nhầm sẽ tạo bảng vào system database.*
4.  Nhấn nút **Execute** (hoặc phím `F5`).

## Bước 3: Kiểm tra
1.  Mở **Databases** > **NextGenLMS_Db** > **Tables**.
2.  Bạn sẽ thấy danh sách đầy đủ các bảng (`AppUsers`, `Courses`, `Quizzes`...)
3.  Database đã sẵn sàng để sử dụng!

> **Lưu ý:**
> *   Nếu bạn chạy lại script này trên một database đã có dữ liệu, nó có thể báo lỗi vì các bảng đã tồn tại.
> *   Script này tương đương với trạng thái code hiện tại (bao gồm settings Quiz, Time Submission...).
