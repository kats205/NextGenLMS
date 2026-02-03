import instance, { ApiResponse } from '../axiosClient';

// Course DTOs matching backend
export interface CourseDto {
  id: string;
  courseCode: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt?: string;
  semesterId: string;
  semesterName?: string;
  academicYearId: string;
  academicYearName?: string;
  majorId: string;
  majorName?: string;
  lecturers: LecturerInCourseDto[];
  studentCount: number;
  chapterCount: number;
}

export interface CourseDetailDto extends CourseDto {
  students: StudentInCourseDto[];
  chapters: ChapterDetailDto[];
}

export interface LecturerInCourseDto {
  lecturerId: string;
  fullName: string;
  email: string;
  isPrimary: boolean;
}

export interface StudentInCourseDto {
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  enrolledDate: string;
  source: string;
}

export interface ChapterDetailDto {
  id: string;
  title: string;
  orderIndex: number;
  contents: CourseContentDto[];
}

export interface CourseContentDto {
  id: string;
  title: string;
  type: 'Lesson' | 'Quiz' | 'Assignment' | 'Announcement';
  orderIndex: number;
  createdAt: string;
  
  // Lesson specific
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  durationSeconds?: number;
  contentHtml?: string;
  
  // Quiz specific
  openTime?: string;
  closeTime?: string;
  durationMinutes?: number;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  
  // Assignment specific
  dueDate?: string;
  maxScore?: number;
  description?: string;
  
  // Announcement specific
  attachmentsJson?: string;
}

export interface CreateCourseDto {
  courseCode: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  semesterId: string;
  academicYearId: string;
  majorId: string;
  lecturerIds?: string[];
}

export interface UpdateCourseDto extends CreateCourseDto {}

export interface EnrollStudentDto {
  studentIds: string[];
}

class CourseService {
  private readonly baseUrl = '/api/Course';

  // Student specific methods
  async getMyEnrolledCourses(): Promise<ApiResponse<CourseDto[]>> {
    const response = await instance.get<ApiResponse<CourseDto[]>>(`${this.baseUrl}/my-enrolled-courses`);
    return response.data;
  }

  async getCoursesByStudent(studentId: string): Promise<ApiResponse<CourseDto[]>> {
    const response = await instance.get<ApiResponse<CourseDto[]>>(`${this.baseUrl}/student/${studentId}`);
    return response.data;
  }

  async getCourseById(courseId: string): Promise<ApiResponse<CourseDetailDto>> {
    const response = await instance.get<ApiResponse<CourseDetailDto>>(`${this.baseUrl}/${courseId}`);
    return response.data;
  }

  async checkStudentEnrolled(courseId: string, studentId: string): Promise<ApiResponse<boolean>> {
    const response = await instance.get<ApiResponse<boolean>>(`${this.baseUrl}/${courseId}/students/${studentId}/enrolled`);
    return response.data;
  }

  async checkCourseExists(courseId: string): Promise<ApiResponse<boolean>> {
    const response = await instance.get<ApiResponse<boolean>>(`${this.baseUrl}/${courseId}/exists`);
    return response.data;
  }

  // Lecturer/Admin methods (for future use)
  async createCourse(createDto: CreateCourseDto): Promise<ApiResponse<CourseDto>> {
    const response = await instance.post<ApiResponse<CourseDto>>(this.baseUrl, createDto);
    return response.data;
  }

  async updateCourse(courseId: string, updateDto: UpdateCourseDto): Promise<ApiResponse<CourseDto>> {
    const response = await instance.put<ApiResponse<CourseDto>>(`${this.baseUrl}/${courseId}`, updateDto);
    return response.data;
  }

  async deleteCourse(courseId: string): Promise<ApiResponse<boolean>> {
    const response = await instance.delete<ApiResponse<boolean>>(`${this.baseUrl}/${courseId}`);
    return response.data;
  }

  async getAllCourses(): Promise<ApiResponse<CourseDto[]>> {
    const response = await instance.get<ApiResponse<CourseDto[]>>(this.baseUrl);
    return response.data;
  }

  async getCoursesByLecturer(lecturerId: string): Promise<ApiResponse<CourseDto[]>> {
    const response = await instance.get<ApiResponse<CourseDto[]>>(`${this.baseUrl}/lecturer/${lecturerId}`);
    return response.data;
  }

  async getMyCourses(): Promise<ApiResponse<CourseDto[]>> {
    const response = await instance.get<ApiResponse<CourseDto[]>>(`${this.baseUrl}/my-courses`);
    return response.data;
  }

  async enrollStudents(courseId: string, enrollDto: EnrollStudentDto): Promise<ApiResponse<boolean>> {
    const response = await instance.post<ApiResponse<boolean>>(`${this.baseUrl}/${courseId}/enroll-students`, enrollDto);
    return response.data;
  }

  async removeStudentFromCourse(courseId: string, studentId: string): Promise<ApiResponse<boolean>> {
    const response = await instance.delete<ApiResponse<boolean>>(`${this.baseUrl}/${courseId}/students/${studentId}`);
    return response.data;
  }
}

// Export singleton instance
export const courseService = new CourseService();
export default courseService;