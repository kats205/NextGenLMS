import { useState, useEffect, useCallback, useRef } from 'react';
import { quizService, QuizDto, QuizSubmissionDto, QuestionType, QuizCompletionStatusDto } from '../api/QuizService/quizService';

export function useQuiz(quizId: string | undefined) {
  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await quizService.getQuiz(quizId);
      
      if (response.success) {
        setQuiz(response.data);
      } else {
        setError(response.message || 'Không thể tải quiz');
      }
    } catch (error: any) {
      console.error("Failed to fetch quiz:", error);
      setError('Có lỗi xảy ra khi tải quiz');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return {
    quiz,
    loading,
    error,
    refetch: fetchQuiz
  };
}

export function useQuizSubmission(submissionId: string | undefined) {
  const [submission, setSubmission] = useState<QuizSubmissionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSubmission = useCallback(async () => {
    if (!submissionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await quizService.getQuizSubmission(submissionId);
      
      if (response.success) {
        setSubmission(response.data);
        setTimeRemaining(response.data.remainingTimeMinutes * 60); // Convert to seconds
      } else {
        setError(response.message || 'Không thể tải bài làm');
      }
    } catch (error: any) {
      console.error("Failed to fetch quiz submission:", error);
      setError('Có lỗi xảy ra khi tải bài làm');
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  // Timer countdown
  useEffect(() => {
    if (submission && submission.status === 'InProgress' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            if (submissionId) {
              submitQuiz();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [submission, timeRemaining, submissionId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (submission && submission.status === 'InProgress') {
      autoSaveRef.current = setInterval(async () => {
        if (submissionId) {
          try {
            await quizService.autoSave(submissionId);
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [submission, submissionId]);

  const submitAnswer = async (questionId: string, answer: string) => {
    if (!submissionId) return false;

    try {
      const response = await quizService.submitAnswer(submissionId, {
        quizSubmissionId: submissionId,
        questionId,
        answer
      });

      if (response.success) {
        // Refresh submission to get updated data
        await fetchSubmission();
        return true;
      } else {
        setError(response.message || 'Không thể lưu câu trả lời');
        return false;
      }
    } catch (error: any) {
      console.error("Failed to submit answer:", error);
      setError('Có lỗi xảy ra khi lưu câu trả lời');
      return false;
    }
  };

  const submitEssay = async (questionId: string, text?: string, fileUrl?: string) => {
    if (!submissionId) return false;

    try {
      const response = await quizService.submitEssay(submissionId, {
        questionId,
        text,
        fileUrl
      });

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Không thể lưu bài tự luận');
        return false;
      }
    } catch (error: any) {
      console.error("Failed to submit essay:", error);
      setError('Có lỗi xảy ra khi lưu bài tự luận');
      return false;
    }
  };

  const submitQuiz = async () => {
    if (!submissionId) return null;

    try {
      const response = await quizService.submitQuiz(submissionId);

      if (response.success) {
        setSubmission(response.data);
        // Clear timers
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        return response.data;
      } else {
        setError(response.message || 'Không thể nộp bài');
        return null;
      }
    } catch (error: any) {
      console.error("Failed to submit quiz:", error);
      setError('Có lỗi xảy ra khi nộp bài');
      return null;
    }
  };

  const startQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await quizService.startQuiz(quizId);
      
      if (response.success) {
        setSubmission(response.data);
        setTimeRemaining(response.data.remainingTimeMinutes * 60);
        return response.data;
      } else {
        setError(response.message || 'Không thể bắt đầu quiz');
        return null;
      }
    } catch (error: any) {
      console.error("Failed to start quiz:", error);
      setError('Có lỗi xảy ra khi bắt đầu quiz');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, []);

  return {
    submission,
    loading,
    error,
    timeRemaining,
    submitAnswer,
    submitEssay,
    submitQuiz,
    startQuiz,
    refetch: fetchSubmission
  };
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function useQuizCompletionStatus(quizId: string | undefined) {
  const [status, setStatus] = useState<QuizCompletionStatusDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!quizId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await quizService.getQuizCompletionStatus(quizId);
      
      if (response.success) {
        setStatus(response.data);
      } else {
        setError(response.message || 'Không thể tải trạng thái quiz');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải trạng thái quiz');
      console.error('Error fetching quiz completion status:', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus
  };
}