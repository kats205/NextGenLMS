# Course Service Documentation

## Tổng quan
CourseService cung cấp các phương thức để tương tác với Course API từ frontend, bao gồm các chức năng dành cho Student, Lecturer và Admin.

## Cấu trúc

### DTOs (Data Transfer Objects)
- `CourseDto`: Thông tin cơ bản của khóa học
- `CourseDetailDto`: Thông tin chi tiết khóa học (bao gồm sinh viên và chương)
- `CreateCourseDto`: Dữ liệu tạo khóa học mới
- `UpdateCourseDto`: Dữ liệu cập nhật khóa học
- `EnrollStudentDto`: Dữ liệu đăng ký sinh viên
- `StudentInCourseDto`: Thông tin sinh viên trong khóa học
- `ChapterDto`: Thông tin chương học

### Methods

#### Student Methods
```typescript
// Lấy khóa học sinh viên đã đăng ký
await courseService.getMyEnrolledCourses();

// Lấy khóa học theo ID sinh viên
await courseService.getCoursesByStudent(studentId);

// Lấy thông tin chi tiết khóa học
await courseService.getCourseById(courseId);

// Kiểm tra sinh viên đã đăng ký khóa học chưa
await courseService.checkStudentEnrolled(courseId, studentId);
```

#### Lecturer/Admin Methods
```typescript
// Tạo khóa học mới
await courseService.createCourse(createDto);

// Cập nhật khóa học
await courseService.updateCourse(courseId, updateDto);

// Xóa khóa học
await courseService.deleteCourse(courseId);

// Lấy tất cả khóa học (Admin only)
await courseService.getAllCourses();

// Lấy khóa học của giảng viên
await courseService.getMyCourses();

// Đăng ký sinh viên vào khóa học
await courseService.enrollStudents(courseId, enrollDto);

// Xóa sinh viên khỏi khóa học
await courseService.removeStudentFromCourse(courseId, studentId);
```

## Hooks

### useStudentCourses
Hook để lấy danh sách khóa học của sinh viên hiện tại.

```typescript
import { useStudentCourses } from '../hooks/useCourse';

function MyComponent() {
  const { courses, loading, error, refetch } = useStudentCourses();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  
  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
}
```

### useCourseDetail
Hook để lấy thông tin chi tiết khóa học.

```typescript
import { useCourseDetail } from '../hooks/useCourse';

function CourseDetail({ courseId }: { courseId: string }) {
  const { course, loading, error, refetch } = useCourseDetail(courseId);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!course) return <div>Không tìm thấy khóa học</div>;
  
  return (
    <div>
      <h1>{course.name}</h1>
      <p>{course.description}</p>
      <div>Sinh viên: {course.students.length}</div>
      <div>Chương: {course.chapters.length}</div>
    </div>
  );
}
```

## Response Format
Tất cả API đều trả về response theo format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
  timestamp: string;
}
```

## Error Handling
Service tự động xử lý lỗi và hiển thị toast notification. Các hook cũng cung cấp error state để component có thể hiển thị UI phù hợp.

## Authentication
Service tự động gửi JWT token trong header thông qua axiosClient interceptor. Không cần xử lý authentication thủ công.

## Usage Examples

### Student Dashboard
```typescript
import { useStudentCourses } from '../hooks/useCourse';

export function StudentDashboard() {
  const { courses, loading, error } = useStudentCourses();
  
  return (
    <div>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

### Course Player
```typescript
import { useCourseDetail } from '../hooks/useCourse';

export function CoursePlayer({ courseId }: { courseId: string }) {
  const { course, loading, error } = useCourseDetail(courseId);
  
  if (!course) return null;
  
  return (
    <div>
      <h1>{course.name}</h1>
      <div>
        {course.chapters.map(chapter => (
          <ChapterItem key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </div>
  );
}
```

## Notes
- Service sử dụng singleton pattern, import `courseService` để sử dụng
- Tất cả methods đều async và trả về Promise
- Error handling được tích hợp sẵn với toast notifications
- Hooks tự động refetch khi dependencies thay đổi