# Course Controller API Documentation

## Tổng quan
CourseController cung cấp các API để quản lý khóa học trong hệ thống LMS, bao gồm các chức năng CRUD cơ bản và quản lý sinh viên trong khóa học.

## Phân quyền
- **Admin**: Có thể thực hiện tất cả các thao tác
- **Lecturer**: Có thể quản lý khóa học của chính mình
- **Student**: Chỉ có thể xem khóa học đã đăng ký

## Endpoints

### 1. Tạo khóa học mới
- **Method**: `POST /api/Course`
- **Authorization**: Admin hoặc Lecturer
- **Body**: `CreateCourseDto`
- **Response**: Thông tin khóa học vừa tạo

### 2. Cập nhật khóa học
- **Method**: `PUT /api/Course/{courseId}`
- **Authorization**: Admin hoặc Lecturer sở hữu khóa học
- **Body**: `UpdateCourseDto`
- **Response**: Thông tin khóa học đã cập nhật

### 3. Xóa khóa học
- **Method**: `DELETE /api/Course/{courseId}`
- **Authorization**: Admin hoặc Lecturer sở hữu khóa học
- **Response**: Trạng thái xóa thành công

### 4. Lấy thông tin chi tiết khóa học
- **Method**: `GET /api/Course/{courseId}`
- **Authorization**: Người dùng có quyền truy cập khóa học
- **Response**: Thông tin chi tiết khóa học bao gồm danh sách sinh viên và chương

### 5. Lấy tất cả khóa học
- **Method**: `GET /api/Course`
- **Authorization**: Chỉ Admin
- **Response**: Danh sách tất cả khóa học

### 6. Lấy khóa học theo giảng viên
- **Method**: `GET /api/Course/lecturer/{lecturerId}`
- **Authorization**: Admin hoặc chính giảng viên đó
- **Response**: Danh sách khóa học của giảng viên

### 7. Lấy khóa học của giảng viên hiện tại
- **Method**: `GET /api/Course/my-courses`
- **Authorization**: Lecturer
- **Response**: Danh sách khóa học của giảng viên hiện tại

### 8. Lấy khóa học theo sinh viên
- **Method**: `GET /api/Course/student/{studentId}`
- **Authorization**: Admin hoặc chính sinh viên đó
- **Response**: Danh sách khóa học sinh viên đã đăng ký

### 9. Lấy khóa học của sinh viên hiện tại
- **Method**: `GET /api/Course/my-enrolled-courses`
- **Authorization**: Student
- **Response**: Danh sách khóa học sinh viên hiện tại đã đăng ký

### 10. Đăng ký sinh viên vào khóa học
- **Method**: `POST /api/Course/{courseId}/enroll-students`
- **Authorization**: Admin hoặc Lecturer sở hữu khóa học
- **Body**: `EnrollStudentDto` (danh sách ID sinh viên)
- **Response**: Trạng thái đăng ký thành công

### 11. Xóa sinh viên khỏi khóa học
- **Method**: `DELETE /api/Course/{courseId}/students/{studentId}`
- **Authorization**: Admin hoặc Lecturer sở hữu khóa học
- **Response**: Trạng thái xóa thành công

### 12. Kiểm tra khóa học tồn tại
- **Method**: `GET /api/Course/{courseId}/exists`
- **Authorization**: Người dùng đã đăng nhập
- **Response**: Boolean cho biết khóa học có tồn tại không

### 13. Kiểm tra sinh viên đã đăng ký khóa học
- **Method**: `GET /api/Course/{courseId}/students/{studentId}/enrolled`
- **Authorization**: Admin, Lecturer sở hữu khóa học, hoặc chính sinh viên đó
- **Response**: Boolean cho biết sinh viên đã đăng ký khóa học chưa

## DTOs

### CreateCourseDto
```json
{
  "courseCode": "string (required, max 20 chars)",
  "name": "string (required, max 200 chars)",
  "description": "string (optional, max 1000 chars)",
  "thumbnailUrl": "string (optional)",
  "semesterId": "guid (required)",
  "academicYearId": "guid (required)",
  "majorId": "guid (required)",
  "lecturerId": "guid (required)"
}
```

### UpdateCourseDto
Giống như `CreateCourseDto`

### EnrollStudentDto
```json
{
  "studentIds": ["guid array (required)"]
}
```

### CourseDto
```json
{
  "id": "guid",
  "courseCode": "string",
  "name": "string",
  "description": "string",
  "thumbnailUrl": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "semesterId": "guid",
  "semesterName": "string",
  "academicYearId": "guid",
  "academicYearName": "string",
  "majorId": "guid",
  "majorName": "string",
  "lecturerId": "guid",
  "lecturerName": "string",
  "studentCount": "int",
  "chapterCount": "int"
}
```

### CourseDetailDto
Kế thừa từ `CourseDto` và bổ sung:
```json
{
  "students": [
    {
      "studentId": "guid",
      "studentCode": "string",
      "fullName": "string",
      "email": "string",
      "enrolledDate": "datetime"
    }
  ],
  "chapters": [
    {
      "id": "guid",
      "title": "string",
      "orderIndex": "int",
      "contentCount": "int"
    }
  ]
}
```

## Lưu ý quan trọng

1. **Phân quyền**: Tất cả endpoints đều yêu cầu authentication. Một số endpoints có thêm authorization theo role.

2. **Soft Delete**: Hệ thống sử dụng soft delete, các bản ghi bị xóa chỉ được đánh dấu `IsDeleted = true`.

3. **Validation**: Tất cả input đều được validate theo DataAnnotations trong DTOs.

4. **Error Handling**: API trả về response thống nhất với format:
   ```json
   {
     "success": boolean,
     "message": "string",
     "data": object,
     "errors": object,
     "timestamp": "datetime"
   }
   ```

5. **JWT Claims**: Controller sử dụng JWT claims để lấy thông tin user hiện tại:
   - `ClaimTypes.NameIdentifier`: User ID
   - `ClaimTypes.Role`: User Role

## Cách test API

1. Sử dụng file `CourseController.http` để test các endpoints
2. Thay thế `{{token}}` bằng JWT token hợp lệ
3. Thay thế các `{{courseId}}`, `{{lecturerId}}`, `{{studentId}}` bằng ID thực tế
4. Đảm bảo database đã có dữ liệu seed cho Semester, AcademicYear, Major, và Users