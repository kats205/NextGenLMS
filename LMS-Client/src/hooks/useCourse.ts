import { useState, useEffect } from 'react';
import { courseService, CourseDto, CourseDetailDto } from '../api/CourseService';
import { toast } from 'react-toastify';

export function useStudentCourses() {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getMyEnrolledCourses();
      
      if (response.success) {
        setCourses(response.data || []);
      } else {
        setError(response.message || 'Không thể tải danh sách khóa học');
        toast.error(response.message || 'Không thể tải danh sách khóa học');
      }
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách khóa học';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  };
}

export function useCourseDetail(courseId: string | undefined) {
  const [course, setCourse] = useState<CourseDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!courseId) {
      setError('ID khóa học không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getCourseById(courseId);
      
      if (response.success) {
        setCourse(response.data);
      } else {
        setError(response.message || 'Không thể tải thông tin khóa học');
        toast.error(response.message || 'Không thể tải thông tin khóa học');
      }
    } catch (error: any) {
      console.error("Failed to fetch course:", error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin khóa học';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  return {
    course,
    loading,
    error,
    refetch: fetchCourse
  };
}