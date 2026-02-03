import { useState, useEffect } from 'react';
import assignmentService, { 
  AssignmentDetailDto, 
  AssignmentSubmissionDto, 
  CreateSubmissionDto, 
  UpdateSubmissionDto,
  CreateCommentDto,
  UpdateCommentDto,
  SubmissionCommentDto
} from '../api/AssignmentService/assignmentService';

export function useAssignment(assignmentId?: string) {
  const [assignment, setAssignment] = useState<AssignmentDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentService.getAssignment(id);
      setAssignment(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment(assignmentId);
    }
  }, [assignmentId]);

  return {
    assignment,
    loading,
    error,
    refetch: () => assignmentId && fetchAssignment(assignmentId)
  };
}

export function useMySubmission(assignmentId?: string) {
  const [submission, setSubmission] = useState<AssignmentSubmissionDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMySubmission = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentService.getMySubmission(id);
      setSubmission(data);
    } catch (err: any) {
      // If no submission exists, that's not an error
      if (err.response?.status === 404 || err.response?.data?.message?.includes('chưa có bài nộp')) {
        setSubmission(null);
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải bài nộp');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchMySubmission(assignmentId);
    }
  }, [assignmentId]);

  return {
    submission,
    loading,
    error,
    refetch: () => assignmentId && fetchMySubmission(assignmentId)
  };
}

export function useSubmissionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubmission = async (createDto: CreateSubmissionDto): Promise<AssignmentSubmissionDto | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await assignmentService.createSubmission(createDto);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bài nộp');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSubmission = async (submissionId: string, updateDto: UpdateSubmissionDto): Promise<AssignmentSubmissionDto | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await assignmentService.updateSubmission(submissionId, updateDto);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài nộp');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (submissionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await assignmentService.deleteSubmission(submissionId);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bài nộp');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (submissionId: string): Promise<AssignmentSubmissionDto | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await assignmentService.submitAssignment(submissionId);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nộp bài tập');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const unsubmitAssignment = async (submissionId: string): Promise<AssignmentSubmissionDto | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await assignmentService.unsubmitAssignment(submissionId);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi hủy nộp bài');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    submitAssignment,
    unsubmitAssignment,
    clearError: () => setError(null)
  };
}

export function useSubmissionComments(submissionId?: string) {
  const [comments, setComments] = useState<SubmissionCommentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentService.getSubmissionComments(id);
      setComments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (createDto: CreateCommentDto): Promise<SubmissionCommentDto | null> => {
    try {
      setError(null);
      const result = await assignmentService.createComment(createDto);
      setComments(prev => [...prev, result]);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm bình luận');
      return null;
    }
  };

  const updateComment = async (commentId: string, updateDto: UpdateCommentDto): Promise<SubmissionCommentDto | null> => {
    try {
      setError(null);
      const result = await assignmentService.updateComment(commentId, updateDto);
      setComments(prev => prev.map(c => c.id === commentId ? result : c));
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bình luận');
      return null;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    try {
      setError(null);
      await assignmentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xóa bình luận');
      return false;
    }
  };

  useEffect(() => {
    if (submissionId) {
      fetchComments(submissionId);
    }
  }, [submissionId]);

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    refetch: () => submissionId && fetchComments(submissionId),
    clearError: () => setError(null)
  };
}