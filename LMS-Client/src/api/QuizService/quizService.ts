import instance, { ApiResponse } from '../axiosClient';

export interface QuizDto {
  id: string;
  title: string;
  openTime?: string;
  closeTime?: string;
  durationMinutes: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  questions: QuizQuestionDto[];
}

export interface QuizQuestionDto {
  id: string;
  questionId: string;
  points: number;
  orderIndex: number;
  type: QuestionType;
  contentText: string;
  mediaUrl?: string;
  answers: AnswerDto[];
}

export interface AnswerDto {
  id: string;
  contentText: string;
  isCorrect: boolean;
}

export interface QuizSubmissionDto {
  id: string;
  quizId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  score: number;
  status: string;
  remainingTimeMinutes: number;
  questions: QuestionSnapshotDto[];
}

export interface QuestionSnapshotDto {
  id: string;
  questionId: string;
  orderIndex: number;
  type: QuestionType;
  questionText: string;
  mediaUrl?: string;
  answers: SnapshotAnswerDto[];
  studentAnswer?: string;
  pointsAchieved: number;
  isCorrect: boolean;
}

export interface SnapshotAnswerDto {
  id: string;
  contentText: string;
  displayOrder: number;
}

export interface EssaySubmissionDto {
  id: string;
  quizSubmissionId: string;
  questionId: string;
  submissionText?: string;
  fileUrl?: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

export interface QuizCompletionStatusDto {
  quizId: string;
  isCompleted: boolean;
  hasInProgress: boolean;
  score?: number;
  completedAt?: string;
  canRetake: boolean;
}

export enum QuestionType {
  MultipleChoice = 1,
  Essay = 2,
  TrueFalse = 3,
  FillInTheBlank = 4
}

export interface SubmitAnswerRequest {
  quizSubmissionId: string;
  questionId: string;
  answer: string;
}

export interface SubmitEssayRequest {
  questionId: string;
  text?: string;
  fileUrl?: string;
}

class QuizService {
  private readonly baseUrl = '/api/Quiz';

  async getQuiz(quizId: string): Promise<ApiResponse<QuizDto>> {
    const response = await instance.get<ApiResponse<QuizDto>>(`${this.baseUrl}/${quizId}`);
    return response.data;
  }

  async startQuiz(quizId: string): Promise<ApiResponse<QuizSubmissionDto>> {
    const response = await instance.post<ApiResponse<QuizSubmissionDto>>(`${this.baseUrl}/${quizId}/start`);
    return response.data;
  }

  async getQuizSubmission(submissionId: string): Promise<ApiResponse<QuizSubmissionDto>> {
    const response = await instance.get<ApiResponse<QuizSubmissionDto>>(`${this.baseUrl}/submissions/${submissionId}`);
    return response.data;
  }

  async submitAnswer(submissionId: string, request: SubmitAnswerRequest): Promise<ApiResponse<boolean>> {
    const response = await instance.post<ApiResponse<boolean>>(`${this.baseUrl}/submissions/${submissionId}/answers`, request);
    return response.data;
  }

  async submitEssay(submissionId: string, request: SubmitEssayRequest): Promise<ApiResponse<boolean>> {
    const response = await instance.post<ApiResponse<boolean>>(`${this.baseUrl}/submissions/${submissionId}/essays`, request);
    return response.data;
  }

  async submitQuiz(submissionId: string): Promise<ApiResponse<QuizSubmissionDto>> {
    const response = await instance.post<ApiResponse<QuizSubmissionDto>>(`${this.baseUrl}/submissions/${submissionId}/submit`);
    return response.data;
  }

  async getEssaySubmissions(submissionId: string): Promise<ApiResponse<EssaySubmissionDto[]>> {
    const response = await instance.get<ApiResponse<EssaySubmissionDto[]>>(`${this.baseUrl}/submissions/${submissionId}/essays`);
    return response.data;
  }

  async autoSave(submissionId: string): Promise<ApiResponse<boolean>> {
    const response = await instance.post<ApiResponse<boolean>>(`${this.baseUrl}/submissions/${submissionId}/autosave`);
    return response.data;
  }

  async getQuizCompletionStatus(quizId: string): Promise<ApiResponse<QuizCompletionStatusDto>> {
    const response = await instance.get<ApiResponse<QuizCompletionStatusDto>>(`${this.baseUrl}/${quizId}/completion-status`);
    return response.data;
  }
}

export const quizService = new QuizService();
export default quizService;