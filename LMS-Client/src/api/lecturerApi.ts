// ============================================
// LECTURER API - FIXED VERSION
// File: src/api/lecturerApi.ts
// ============================================

import axiosClient from './axiosClient';
import type {
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
    QuizSubmission,
    QuizQuestion,
    QuestionBankItem,
    CreateCourseRequest,
    UpdateCourseRequest,
    CreateChapterRequest,
    UpdateChapterRequest,
    CreateLessonRequest,
    UpdateLessonRequest,
    CreateQuizRequest,
    UpdateQuizRequest,
    CreateQuestionRequest,
    UpdateQuestionRequest,
    CreateQuestionTopicRequest,
    AddQuestionsToQuizRequest,
    PaginatedResponse,
    CourseFilterParams,
    StudentFilterParams,
} from '../components/lecturer/lecturer.types';

const BASE_URL = '/lecturer';

// ============================================
// DASHBOARD
// ============================================

export const getDashboard = async (): Promise<LecturerDashboard> => {
    const response = await axiosClient.get(`${BASE_URL}/dashboard`);
    return response.data.data;
};

// ============================================
// COURSES
// ============================================

export const getCourses = async (params?: CourseFilterParams): Promise<PaginatedResponse<Course>> => {
    const response = await axiosClient.get(`${BASE_URL}/courses`, { params });
    return response.data.data;
};

export const getCourseById = async (courseId: string): Promise<Course> => {
    const response = await axiosClient.get(`${BASE_URL}/courses/${courseId}`);
    return response.data.data;
};

export const createCourse = async (data: CreateCourseRequest): Promise<Course> => {
    const response = await axiosClient.post(`${BASE_URL}/courses`, data);
    return response.data.data;
};

export const updateCourse = async (data: UpdateCourseRequest): Promise<Course> => {
    const response = await axiosClient.put(`${BASE_URL}/courses/${data.id}`, data);
    return response.data.data;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/courses/${courseId}`);
};

export const getCourseReport = async (courseId: string): Promise<CourseReport> => {
    const response = await axiosClient.get(`${BASE_URL}/courses/${courseId}/report`);
    return response.data.data;
};

// ============================================
// CHAPTERS
// ============================================

export const getChaptersByCourse = async (courseId: string): Promise<Chapter[]> => {
    const response = await axiosClient.get(`${BASE_URL}/courses/${courseId}/chapters`);
    return response.data.data;
};

export const getChapterById = async (chapterId: string): Promise<Chapter> => {
    const response = await axiosClient.get(`${BASE_URL}/chapters/${chapterId}`);
    return response.data.data;
};

export const createChapter = async (data: CreateChapterRequest): Promise<Chapter> => {
    const response = await axiosClient.post(`${BASE_URL}/chapters`, data);
    return response.data.data;
};

export const updateChapter = async (data: UpdateChapterRequest): Promise<Chapter> => {
    const response = await axiosClient.put(`${BASE_URL}/chapters/${data.id}`, data);
    return response.data.data;
};

export const deleteChapter = async (chapterId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/chapters/${chapterId}`);
};

export const reorderChapters = async (courseId: string, chapterIds: string[]): Promise<void> => {
    await axiosClient.put(`${BASE_URL}/courses/${courseId}/chapters/reorder`, { chapterIds });
};

// ============================================
// LESSONS
// ============================================

export const getLessonsByChapter = async (chapterId: string): Promise<Lesson[]> => {
    const response = await axiosClient.get(`${BASE_URL}/chapters/${chapterId}/lessons`);
    return response.data.data;
};

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
    const response = await axiosClient.get(`${BASE_URL}/lessons/${lessonId}`);
    return response.data.data;
};

export const createLesson = async (data: CreateLessonRequest): Promise<Lesson> => {
    const response = await axiosClient.post(`${BASE_URL}/lessons`, data);
    return response.data.data;
};

export const updateLesson = async (data: UpdateLessonRequest): Promise<Lesson> => {
    const response = await axiosClient.put(`${BASE_URL}/lessons/${data.id}`, data);
    return response.data.data;
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/lessons/${lessonId}`);
};

export const publishLesson = async (lessonId: string, isPublished: boolean): Promise<Lesson> => {
    const response = await axiosClient.patch(`${BASE_URL}/lessons/${lessonId}/publish`, { isPublished });
    return response.data.data;
};

// ============================================
// QUIZZES
// ============================================

export const getQuizzesByChapter = async (chapterId: string): Promise<Quiz[]> => {
    const response = await axiosClient.get(`${BASE_URL}/chapters/${chapterId}/quizzes`);
    return response.data.data;
};

export const getQuizzesByCourse = async (courseId: string): Promise<Quiz[]> => {
    const response = await axiosClient.get(`${BASE_URL}/courses/${courseId}/quizzes`);
    return response.data.data;
};

export const getQuizById = async (quizId: string): Promise<Quiz> => {
    const response = await axiosClient.get(`${BASE_URL}/quizzes/${quizId}`);
    return response.data.data;
};

export const createQuiz = async (data: CreateQuizRequest): Promise<Quiz> => {
    const response = await axiosClient.post(`${BASE_URL}/quizzes`, data);
    return response.data.data;
};

export const updateQuiz = async (data: UpdateQuizRequest): Promise<Quiz> => {
    const response = await axiosClient.put(`${BASE_URL}/quizzes/${data.id}`, data);
    return response.data.data;
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/quizzes/${quizId}`);
};

export const publishQuiz = async (quizId: string, isPublished: boolean): Promise<Quiz> => {
    const response = await axiosClient.patch(`${BASE_URL}/quizzes/${quizId}/publish`, { isPublished });
    return response.data.data;
};

// ============================================
// QUESTION TOPICS
// ============================================

export const getQuestionTopics = async (): Promise<QuestionTopic[]> => {
    const response = await axiosClient.get(`${BASE_URL}/question-topics`);
    return response.data.data;
};

export const createQuestionTopic = async (data: CreateQuestionTopicRequest): Promise<QuestionTopic> => {
    const response = await axiosClient.post(`${BASE_URL}/question-topics`, data);
    return response.data.data;
};

export const deleteQuestionTopic = async (topicId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/question-topics/${topicId}`);
};

// ============================================
// QUESTIONS
// ============================================

export const getQuestionsByTopic = async (topicId: string): Promise<Question[]> => {
    const response = await axiosClient.get(`${BASE_URL}/question-topics/${topicId}/questions`);
    return response.data.data;
};

export const getQuestionsByQuiz = async (quizId: string): Promise<QuizQuestion[]> => {
    const response = await axiosClient.get(`${BASE_URL}/quizzes/${quizId}/questions`);
    return response.data.data;
};

export const getQuestionById = async (questionId: string): Promise<Question> => {
    const response = await axiosClient.get(`${BASE_URL}/questions/${questionId}`);
    return response.data.data;
};

export const createQuestion = async (data: CreateQuestionRequest): Promise<Question> => {
    const response = await axiosClient.post(`${BASE_URL}/questions`, data);
    return response.data.data;
};

export const updateQuestion = async (data: UpdateQuestionRequest): Promise<Question> => {
    const response = await axiosClient.put(`${BASE_URL}/questions/${data.id}`, data);
    return response.data.data;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/questions/${questionId}`);
};

export const getQuestionBank = async (): Promise<QuestionBankItem[]> => {
    const response = await axiosClient.get(`${BASE_URL}/question-bank`);
    return response.data.data;
};

export const addQuestionsToQuiz = async (data: AddQuestionsToQuizRequest): Promise<void> => {
    await axiosClient.post(`${BASE_URL}/quizzes/${data.quizId}/add-questions`, data);
};

export const removeQuestionFromQuiz = async (quizId: string, questionId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/quizzes/${quizId}/questions/${questionId}`);
};

// ============================================
// STUDENTS
// ============================================

export const getStudentsByCourse = async (
    courseId: string,
    params?: StudentFilterParams
): Promise<PaginatedResponse<Student>> => {
    const response = await axiosClient.get(`${BASE_URL}/courses/${courseId}/students`, { params });
    return response.data.data;
};

export const getStudentProgress = async (courseId: string, studentId: string): Promise<StudentProgress> => {
    const response = await axiosClient.get(`${BASE_URL}/courses/${courseId}/students/${studentId}/progress`);
    return response.data.data;
};

export const enrollStudent = async (courseId: string, studentEmail: string): Promise<void> => {
    await axiosClient.post(`${BASE_URL}/courses/${courseId}/enroll`, { studentEmail });
};

export const removeStudent = async (courseId: string, studentId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/courses/${courseId}/students/${studentId}`);
};

// ============================================
// QUIZ SUBMISSIONS & GRADING
// ============================================

export const getQuizSubmissions = async (quizId: string): Promise<QuizSubmission[]> => {
    const response = await axiosClient.get(`${BASE_URL}/quizzes/${quizId}/submissions`);
    return response.data.data;
};

export const getSubmissionById = async (submissionId: string): Promise<QuizSubmission> => {
    const response = await axiosClient.get(`${BASE_URL}/submissions/${submissionId}`);
    return response.data.data;
};

export const gradeSubmission = async (submissionId: string, score: number, feedback?: string): Promise<void> => {
    await axiosClient.post(`${BASE_URL}/submissions/${submissionId}/grade`, { score, feedback });
};

// ============================================
// FILE UPLOAD
// ============================================

export const uploadFile = async (file: File, type: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axiosClient.post(`${BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.data.url;
};

// ============================================
// EXPORT DEFAULT
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

    // Students
    getStudentsByCourse,
    getStudentProgress,
    enrollStudent,
    removeStudent,

    // Grading
    getQuizSubmissions,
    getSubmissionById,
    gradeSubmission,

    // Files
    uploadFile,
};

export default lecturerApi;