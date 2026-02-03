// ============================================
// LECTURER MODULE - API SERVICES
// Updated to match C# Backend Structure
// ============================================

import axios, { ApiResponse } from './axios'; // Import your axios instance
import {
    LecturerDashboard,
    Course,
    Chapter,
    Lesson,
    Quiz,
    Question,
    QuestionTopic,
    Student,
    StudentProgress,
    CourseReport,
    CreateCourseRequest,
    UpdateCourseRequest,
    CreateChapterRequest,
    UpdateChapterRequest,
    CreateLessonRequest,
    UpdateLessonRequest,
    CreateQuizRequest,
    UpdateQuizRequest,
    CreateQuestionRequest,
    CreateQuestionTopicRequest,
    UpdateQuestionRequest,
    AddQuestionsToQuizRequest,
    PaginatedResponse,
    CourseFilterParams,
    StudentFilterParams,
    QuestionBankItem,
    QuizQuestion
} from './lecturer.types';

const BASE_URL = '/lecturer'; // Base path for lecturer endpoints

// ============================================
// DASHBOARD
// ============================================

export const getDashboard = async (): Promise<LecturerDashboard> => {
    const response = await axios.get<ApiResponse<LecturerDashboard>>(`${BASE_URL}/dashboard`);
    return response.data.data;
};

// ============================================
// COURSES
// ============================================

export const getCourses = async (params?: CourseFilterParams): Promise<PaginatedResponse<Course>> => {
    const response = await axios.get<ApiResponse<PaginatedResponse<Course>>>(`${BASE_URL}/courses`, { params });
    return response.data.data;
};

export const getCourseById = async (courseId: string): Promise<Course> => {
    const response = await axios.get<ApiResponse<Course>>(`${BASE_URL}/courses/${courseId}`);
    return response.data.data;
};

export const createCourse = async (data: CreateCourseRequest): Promise<Course> => {
    const response = await axios.post<ApiResponse<Course>>(`${BASE_URL}/courses`, data);
    return response.data.data;
};

export const updateCourse = async (data: UpdateCourseRequest): Promise<Course> => {
    const response = await axios.put<ApiResponse<Course>>(`${BASE_URL}/courses/${data.id}`, data);
    return response.data.data;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/courses/${courseId}`);
};

export const getCourseReport = async (courseId: string): Promise<CourseReport> => {
    const response = await axios.get<ApiResponse<CourseReport>>(`${BASE_URL}/courses/${courseId}/report`);
    return response.data.data;
};

// ============================================
// CHAPTERS
// ============================================

export const getChaptersByCourse = async (courseId: string): Promise<Chapter[]> => {
    const response = await axios.get<ApiResponse<Chapter[]>>(`${BASE_URL}/courses/${courseId}/chapters`);
    return response.data.data;
};

export const getChapterById = async (chapterId: string): Promise<Chapter> => {
    const response = await axios.get<ApiResponse<Chapter>>(`${BASE_URL}/chapters/${chapterId}`);
    return response.data.data;
};

export const createChapter = async (data: CreateChapterRequest): Promise<Chapter> => {
    const response = await axios.post<ApiResponse<Chapter>>(`${BASE_URL}/chapters`, data);
    return response.data.data;
};

export const updateChapter = async (data: UpdateChapterRequest): Promise<Chapter> => {
    const response = await axios.put<ApiResponse<Chapter>>(`${BASE_URL}/chapters/${data.id}`, data);
    return response.data.data;
};

export const deleteChapter = async (chapterId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/chapters/${chapterId}`);
};

export const reorderChapters = async (courseId: string, chapterIds: string[]): Promise<void> => {
    await axios.put(`${BASE_URL}/courses/${courseId}/chapters/reorder`, { chapterIds });
};

// ============================================
// LESSONS (Content Management)
// ============================================

export const getLessonsByChapter = async (chapterId: string): Promise<Lesson[]> => {
    const response = await axios.get<ApiResponse<Lesson[]>>(`${BASE_URL}/chapters/${chapterId}/lessons`);
    return response.data.data;
};

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
    const response = await axios.get<ApiResponse<Lesson>>(`${BASE_URL}/lessons/${lessonId}`);
    return response.data.data;
};

export const createLesson = async (data: CreateLessonRequest): Promise<Lesson> => {
    const response = await axios.post<ApiResponse<Lesson>>(`${BASE_URL}/lessons`, data);
    return response.data.data;
};

export const updateLesson = async (data: UpdateLessonRequest): Promise<Lesson> => {
    const response = await axios.put<ApiResponse<Lesson>>(`${BASE_URL}/lessons/${data.id}`, data);
    return response.data.data;
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/lessons/${lessonId}`);
};

export const publishLesson = async (lessonId: string, isPublished: boolean): Promise<Lesson> => {
    const response = await axios.patch<ApiResponse<Lesson>>(`${BASE_URL}/lessons/${lessonId}/publish`, { isPublished });
    return response.data.data;
};

export const reorderLessons = async (chapterId: string, lessonIds: string[]): Promise<void> => {
    await axios.put(`${BASE_URL}/chapters/${chapterId}/lessons/reorder`, { lessonIds });
};

// ============================================
// QUIZZES (Assessment Management)
// ============================================

export const getQuizzesByChapter = async (chapterId: string): Promise<Quiz[]> => {
    const response = await axios.get<ApiResponse<Quiz[]>>(`${BASE_URL}/chapters/${chapterId}/quizzes`);
    return response.data.data;
};

export const getQuizzesByCourse = async (courseId: string): Promise<Quiz[]> => {
    const response = await axios.get<ApiResponse<Quiz[]>>(`${BASE_URL}/courses/${courseId}/quizzes`);
    return response.data.data;
};

export const getQuizById = async (quizId: string): Promise<Quiz> => {
    const response = await axios.get<ApiResponse<Quiz>>(`${BASE_URL}/quizzes/${quizId}`);
    return response.data.data;
};

export const createQuiz = async (data: CreateQuizRequest): Promise<Quiz> => {
    const response = await axios.post<ApiResponse<Quiz>>(`${BASE_URL}/quizzes`, data);
    return response.data.data;
};

export const updateQuiz = async (data: UpdateQuizRequest): Promise<Quiz> => {
    const response = await axios.put<ApiResponse<Quiz>>(`${BASE_URL}/quizzes/${data.id}`, data);
    return response.data.data;
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/quizzes/${quizId}`);
};

export const publishQuiz = async (quizId: string, isPublished: boolean): Promise<Quiz> => {
    const response = await axios.patch<ApiResponse<Quiz>>(`${BASE_URL}/quizzes/${quizId}/publish`, { isPublished });
    return response.data.data;
};

// ============================================
// QUESTION TOPICS
// ============================================

export const getQuestionTopics = async (): Promise<QuestionTopic[]> => {
    const response = await axios.get<ApiResponse<QuestionTopic[]>>(`${BASE_URL}/question-topics`);
    return response.data.data;
};

export const createQuestionTopic = async (data: CreateQuestionTopicRequest): Promise<QuestionTopic> => {
    const response = await axios.post<ApiResponse<QuestionTopic>>(`${BASE_URL}/question-topics`, data);
    return response.data.data;
};

export const deleteQuestionTopic = async (topicId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/question-topics/${topicId}`);
};

// ============================================
// QUESTIONS (Question Bank)
// ============================================

export const getQuestionsByTopic = async (topicId: string): Promise<Question[]> => {
    const response = await axios.get<ApiResponse<Question[]>>(`${BASE_URL}/question-topics/${topicId}/questions`);
    return response.data.data;
};

export const getQuestionsByQuiz = async (quizId: string): Promise<QuizQuestion[]> => {
    const response = await axios.get<ApiResponse<QuizQuestion[]>>(`${BASE_URL}/quizzes/${quizId}/questions`);
    return response.data.data;
};

export const getQuestionById = async (questionId: string): Promise<Question> => {
    const response = await axios.get<ApiResponse<Question>>(`${BASE_URL}/questions/${questionId}`);
    return response.data.data;
};

export const createQuestion = async (data: CreateQuestionRequest): Promise<Question> => {
    const response = await axios.post<ApiResponse<Question>>(`${BASE_URL}/questions`, data);
    return response.data.data;
};

export const updateQuestion = async (data: UpdateQuestionRequest): Promise<Question> => {
    const response = await axios.put<ApiResponse<Question>>(`${BASE_URL}/questions/${data.id}`, data);
    return response.data.data;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/questions/${questionId}`);
};

export const getQuestionBank = async (): Promise<QuestionBankItem[]> => {
    const response = await axios.get<ApiResponse<QuestionBankItem[]>>(`${BASE_URL}/question-bank`);
    return response.data.data;
};

export const addQuestionsToQuiz = async (data: AddQuestionsToQuizRequest): Promise<void> => {
    await axios.post(`${BASE_URL}/quizzes/${data.quizId}/add-questions`, data);
};

export const removeQuestionFromQuiz = async (quizId: string, questionId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/quizzes/${quizId}/questions/${questionId}`);
};

export const updateQuizQuestionPoints = async (quizId: string, questionId: string, points: number): Promise<void> => {
    await axios.patch(`${BASE_URL}/quizzes/${quizId}/questions/${questionId}/points`, { points });
};

// ============================================
// STUDENTS & PROGRESS
// ============================================

export const getStudentsByCourse = async (courseId: string, params?: StudentFilterParams): Promise<PaginatedResponse<Student>> => {
    const response = await axios.get<ApiResponse<PaginatedResponse<Student>>>(`${BASE_URL}/courses/${courseId}/students`, { params });
    return response.data.data;
};

export const getStudentProgress = async (courseId: string, studentId: string): Promise<StudentProgress> => {
    const response = await axios.get<ApiResponse<StudentProgress>>(`${BASE_URL}/courses/${courseId}/students/${studentId}/progress`);
    return response.data.data;
};

export const enrollStudent = async (courseId: string, studentEmail: string): Promise<void> => {
    await axios.post(`${BASE_URL}/courses/${courseId}/enroll`, { studentEmail });
};

export const removeStudent = async (courseId: string, studentId: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/courses/${courseId}/students/${studentId}`);
};

// ============================================
// FILE UPLOAD
// ============================================

export const uploadFile = async (file: File, type: 'lesson' | 'quiz' | 'thumbnail' | 'question'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await axios.post<ApiResponse<{ url: string }>>(`${BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data.data.url;
};

export const uploadLessonFile = async (lessonId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post<ApiResponse<{ url: string }>>(`${BASE_URL}/lessons/${lessonId}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data.data.url;
};

// ============================================
// QUIZ SUBMISSIONS & GRADING
// ============================================

export const getQuizSubmissions = async (quizId: string): Promise<any[]> => {
    const response = await axios.get<ApiResponse<any[]>>(`${BASE_URL}/quizzes/${quizId}/submissions`);
    return response.data.data;
};

export const getSubmissionById = async (submissionId: string): Promise<any> => {
    const response = await axios.get<ApiResponse<any>>(`${BASE_URL}/submissions/${submissionId}`);
    return response.data.data;
};

export const gradeSubmission = async (submissionId: string, score: number, feedback?: string): Promise<void> => {
    await axios.post(`${BASE_URL}/submissions/${submissionId}/grade`, { score, feedback });
};

// ============================================
// EXPORTS
// ============================================

const lecturerApi = {
    // Dashboard
    getDashboard,
    
    // Courses
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseReport,
    
    // Chapters
    getChaptersByCourse,
    getChapterById,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    
    // Lessons
    getLessonsByChapter,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
    publishLesson,
    reorderLessons,
    
    // Quizzes
    getQuizzesByChapter,
    getQuizzesByCourse,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    
    // Question Topics
    getQuestionTopics,
    createQuestionTopic,
    deleteQuestionTopic,
    
    // Questions
    getQuestionsByTopic,
    getQuestionsByQuiz,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionBank,
    addQuestionsToQuiz,
    removeQuestionFromQuiz,
    updateQuizQuestionPoints,
    
    // Students
    getStudentsByCourse,
    getStudentProgress,
    enrollStudent,
    removeStudent,
    
    // Files
    uploadFile,
    uploadLessonFile,
    
    // Grading
    getQuizSubmissions,
    getSubmissionById,
    gradeSubmission,
};

export default lecturerApi;
