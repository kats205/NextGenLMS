import instance, { ApiResponse } from './axiosClient';

// ==========================================
// DTO Types
// ==========================================

// Mapping from C# PagedResultDto<T>
export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface StudentDto {
  id: string;
  fullName: string;
  email: string;
  studentCode?: string;
  enrolledDate: string;
}

export interface CourseDto {
  id: string;
  courseCode: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  semesterId: string;
  semesterName: string;
  academicYearId: string;
  academicYearName: string;
  majorId: string;
  majorName: string;
  lecturerId?: string;
  lecturerName?: string;
  studentCount: number;
  createdAt: string;
}

export interface CourseDetailDto extends CourseDto {
  lecturerEmail?: string;
  lecturerPhone?: string;
  lecturerAvatarUrl?: string;
  students: StudentDto[];
  chapterCount: number;
  contentCount: number;
}

export interface CreateCourseDto {
  courseCode: string;
  name: string;
  description?: string;
  credits: number;
  semesterId: string;
  academicYearId: string;
  majorId: string;
  lecturerId?: string;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  credits?: number;
  semesterId?: string;
  academicYearId?: string;
  majorId?: string;
}

export interface CourseFilterDto {
  searchTerm?: string;
  semesterId?: string;
  academicYearId?: string;
  majorId?: string;
  lecturerId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CourseStatisticsDto {
  courseId: string;
  courseName: string;
  totalStudents: number;
  totalChapters: number;
  totalLessons: number;
  totalQuizzes: number;
  totalAssignments: number;
  averageProgress: number;
  completedStudents: number;
}

export interface DepartmentDto {
    id: string;
    name: string;
    code: string;
}

export interface MajorDto {
    id: string;
    name: string;
    departmentId: string;
    departmentName: string;
}

export interface AssignLecturerDto {
    lecturerId: string;
}

export async function getCourses(filter: CourseFilterDto) {
  const response = await instance.get<ApiResponse<PagedResultDto<CourseDto>>>('/api/admin/courses', { 
    params: filter 
  });
  return response.data.data; 
}

export async function getCourseById(id: string) {
  const response = await instance.get<ApiResponse<CourseDetailDto>>(`/api/admin/courses/${id}`);
  return response.data.data;
}

/**
 * POST /api/admin/courses
 * Tạo khóa học mới
 */
export async function createCourse(dto: CreateCourseDto) {
  const response = await instance.post<ApiResponse<CourseDto>>('/api/admin/courses', dto);
  return response.data.data;
}

/**
 * PUT /api/admin/courses/{id}
 * Cập nhật thông tin khóa học
 */
export async function updateCourse(id: string, dto: UpdateCourseDto) {
  const response = await instance.put<ApiResponse<CourseDto>>(`/api/admin/courses/${id}`, dto);
  return response.data.data;
}

/**
 * DELETE /api/admin/courses/{id}
 * Xóa khóa học
 */
export async function deleteCourse(id: string) {
  const response = await instance.delete<ApiResponse<boolean>>(`/api/admin/courses/${id}`);
  return response.data.data;
}

/**
 * POST /api/admin/courses/{courseId}/assign-lecturer
 * Phân công giảng viên cho khóa học
 */
export async function assignLecturer(courseId: string, lecturerId: string) {
  const payload: AssignLecturerDto = { lecturerId };
  const response = await instance.post<ApiResponse<boolean>>(
    `/api/admin/courses/${courseId}/assign-lecturer`, 
    payload
  );
  return response.data.data;
}

/**
 * GET /api/admin/courses/{courseId}/statistics
 * Lấy thống kê chi tiết của khóa học
 */
export async function getCourseStatistics(courseId: string) {
  const response = await instance.get<ApiResponse<CourseStatisticsDto>>(`/api/admin/courses/${courseId}/statistics`);
  return response.data.data;
}

export async function getDepartments() {
    const response = await instance.get<ApiResponse<DepartmentDto[]>>('/api/admin/Course/departments');
    return response.data.data;
}

export async function getMajors(){
    const response = await instance.get<ApiResponse<MajorDto[]>>('/api/admin/Course/majors');
    return response.data.data;
}