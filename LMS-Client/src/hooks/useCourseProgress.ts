import { useState, useEffect } from 'react';
import { courseProgressService, CourseProgressDto } from '../api/CourseProgressService';

export function useCourseProgress(courseId: string | undefined) {
  const [progress, setProgress] = useState<CourseProgressDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await courseProgressService.getCourseProgress(courseId);
      
      if (response.success) {
        setProgress(response.data);
      } else {
        setError(response.message || 'Không thể tải tiến độ khóa học');
      }
    } catch (error: any) {
      console.error("Failed to fetch course progress:", error);
      setError('Có lỗi xảy ra khi tải tiến độ khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [courseId]);

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress
  };
}

export function useMyCoursesProgress() {
  const [progressList, setProgressList] = useState<CourseProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseProgressService.getMyCoursesProgress();
      
      if (response.success) {
        setProgressList(response.data || []);
      } else {
        setError(response.message || 'Không thể tải tiến độ các khóa học');
      }
    } catch (error: any) {
      console.error("Failed to fetch courses progress:", error);
      setError('Có lỗi xảy ra khi tải tiến độ các khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressList();
  }, []);

  return {
    progressList,
    loading,
    error,
    refetch: fetchProgressList
  };
}