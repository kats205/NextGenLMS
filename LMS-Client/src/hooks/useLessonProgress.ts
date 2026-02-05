import { useState, useEffect, useCallback } from 'react';
import { lessonProgressService, LessonProgressDto, UpdateLessonProgressDto } from '../api/LessonProgressService/lessonProgressService';

export function useLessonProgress(lessonId: string | undefined) {
  const [progress, setProgress] = useState<LessonProgressDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy tiến độ bài giảng
  const fetchProgress = useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await lessonProgressService.getProgress(lessonId);
      if (response.success) {
        setProgress(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lấy tiến độ';
      setError(message);
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  // Cập nhật tiến độ (thời gian xem video)
  const updateProgress = useCallback(async (updateDto: UpdateLessonProgressDto) => {
    if (!lessonId) return;

    try {
      const response = await lessonProgressService.updateProgress(lessonId, updateDto);
      if (response.success) {
        setProgress(response.data);
        return response.data;
      } else {
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật tiến độ';
      setError(message);
      console.error('Error updating progress:', err);
      throw err;
    }
  }, [lessonId]);

  // Đánh dấu hoàn thành
  const markComplete = useCallback(async () => {
    if (!lessonId) return;

    try {
      console.log('🚀 Calling markComplete API for lesson:', lessonId);
      const response = await lessonProgressService.markComplete(lessonId);
      console.log('📥 API Response:', response);
      
      if (response.success) {
        console.log('✅ Mark complete successful, updating state');
        setProgress(response.data);
        return response.data;
      } else {
        console.log('❌ API returned success: false, message:', response.message);
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err) {
      console.log('💥 Exception caught in markComplete:', err);
      console.log('💥 Error type:', typeof err);
      console.log('💥 Error details:', err);
      
      const message = err instanceof Error ? err.message : 'Lỗi khi đánh dấu hoàn thành';
      setError(message);
      console.error('Error marking complete:', err);
      throw err;
    }
  }, [lessonId]);

  // Xóa tiến độ
  const deleteProgress = useCallback(async () => {
    if (!lessonId) return;

    try {
      const response = await lessonProgressService.deleteProgress(lessonId);
      if (response.success) {
        setProgress(null);
      } else {
        setError(response.message);
        throw new Error(response.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa tiến độ';
      setError(message);
      console.error('Error deleting progress:', err);
      throw err;
    }
  }, [lessonId]);

  // Lấy tiến độ khi lessonId thay đổi
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    updateProgress,
    markComplete,
    deleteProgress
  };
}
