import instance, { ApiResponse } from '../axiosClient';

export interface CourseProgressDto {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lastAccessedAt?: string;
}

class CourseProgressService {
  private readonly baseUrl = '/api/CourseProgress';

  async getCourseProgress(courseId: string): Promise<ApiResponse<CourseProgressDto>> {
    const response = await instance.get<ApiResponse<CourseProgressDto>>(`${this.baseUrl}/${courseId}`);
    return response.data;
  }

  async getMyCoursesProgress(): Promise<ApiResponse<CourseProgressDto[]>> {
    const response = await instance.get<ApiResponse<CourseProgressDto[]>>(`${this.baseUrl}/my-courses`);
    return response.data;
  }
}

export const courseProgressService = new CourseProgressService();
export default courseProgressService;