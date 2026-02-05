import instance, { ApiResponse } from '../axiosClient';

export interface LessonProgressDto {
  id: string;
  userId: string;
  lessonId: string;
  videoProgressSeconds: number;
  durationLastAccessSeconds: number; // Vị trí hiện tại trong video
  isCompleted: boolean;
  lastAccess: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateLessonProgressDto {
  videoProgressSeconds: number; // Tổng thời gian đã xem
  durationLastAccessSeconds: number; // Vị trí hiện tại trong video
  isCompleted?: boolean;
}

class LessonProgressService {
  private readonly baseUrl = '/api/LessonProgress';

  async getProgress(lessonId: string): Promise<ApiResponse<LessonProgressDto>> {
    const response = await instance.get<ApiResponse<LessonProgressDto>>(
      `${this.baseUrl}/${lessonId}`
    );
    return response.data;
  }

  async checkProgress(lessonId: string): Promise<ApiResponse<LessonProgressDto | null>> {
    const response = await instance.get<ApiResponse<LessonProgressDto | null>>(
      `${this.baseUrl}/${lessonId}/check`
    );
    return response.data;
  }

  async updateProgress(lessonId: string, updateDto: UpdateLessonProgressDto): Promise<ApiResponse<LessonProgressDto>> {
    const response = await instance.put<ApiResponse<LessonProgressDto>>(
      `${this.baseUrl}/${lessonId}`,
      updateDto
    );
    return response.data;
  }

  async markComplete(lessonId: string): Promise<ApiResponse<LessonProgressDto>> {
    console.log('🔄 LessonProgressService.markComplete called for lesson:', lessonId);
    try {
      const response = await instance.post<ApiResponse<LessonProgressDto>>(
        `${this.baseUrl}/${lessonId}/complete`,
        {}
      );
      console.log('📡 Raw axios response:', response);
      console.log('📦 Response data:', response.data);
      return response.data;
    } catch (error) {
      console.log('💥 Axios error in markComplete:', error);
      throw error;
    }
  }

  async deleteProgress(lessonId: string): Promise<ApiResponse<boolean>> {
    const response = await instance.delete<ApiResponse<boolean>>(
      `${this.baseUrl}/${lessonId}`
    );
    return response.data;
  }
}

// Export singleton instance
export const lessonProgressService = new LessonProgressService();
export default lessonProgressService;
