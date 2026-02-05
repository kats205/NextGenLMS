import { useState, useEffect, useCallback } from 'react';
import { assignmentService, AssignmentDetailDto, AssignmentSubmissionDto } from '../api/AssignmentService/assignmentService';

export function useAssignment(assignmentId: string | undefined) {
  const [assignment, setAssignment] = useState<AssignmentDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = useCallback(async () => {
    if (!assignmentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await assignmentService.getAssignment(assignmentId);
      
      if (response.success) {
        setAssignment(response.data);
      } else {
        setError(response.message || 'Không thể tải thông tin bài tập');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải bài tập');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  return {
    assignment,
    loading,
    error,
    refetch: fetchAssignment
  };
}

export function useAssignmentSubmission(assignmentId: string | undefined) {
  const [submission, setSubmission] = useState<AssignmentSubmissionDto | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMySubmission = useCallback(async () => {
    if (!assignmentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await assignmentService.getMySubmission(assignmentId);
      
      if (response.success) {
        setSubmission(response.data);
      } else {
        setSubmission(null);
        // Don't set error for "no submission found" case
        if (!response.message?.includes('chưa có bài nộp')) {
          setError(response.message || 'Không thể tải bài nộp');
        }
      }
    } catch (err: any) {
      setSubmission(null);
      // Don't set error for 404 cases
      if (!err.message?.includes('404')) {
        setError(err.message || 'Có lỗi xảy ra khi tải bài nộp');
      }
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  const fetchSubmissionHistory = useCallback(async () => {
    if (!assignmentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await assignmentService.getMySubmissionHistory(assignmentId);
      
      if (response.success) {
        setSubmissions(response.data);
      } else {
        setSubmissions([]);
        setError(response.message || 'Không thể tải lịch sử nộp bài');
      }
    } catch (err: any) {
      setSubmissions([]);
      setError(err.message || 'Có lỗi xảy ra khi tải lịch sử nộp bài');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  const submitAssignment = useCallback(async (submissionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assignmentService.submitAssignment(submissionId);
      
      if (response.success) {
        setSubmission(response.data);
        return response.data;
      } else {
        setError(response.message || 'Không thể nộp bài');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi nộp bài');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSubmission = useCallback(async (submissionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await assignmentService.deleteSubmission(submissionId);
      
      if (response.success) {
        setSubmission(null);
        await fetchSubmissionHistory(); // Refresh history
        return true;
      } else {
        setError(response.message || 'Không thể xóa bài nộp');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa bài nộp');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSubmissionHistory]);

  useEffect(() => {
    fetchMySubmission();
  }, [fetchMySubmission]);

  return {
    submission,
    submissions,
    loading,
    error,
    fetchMySubmission,
    fetchSubmissionHistory,
    submitAssignment,
    deleteSubmission,
    refetch: fetchMySubmission
  };
}