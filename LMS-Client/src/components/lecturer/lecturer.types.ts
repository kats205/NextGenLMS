// ============================================
// LECTURER TYPES - Match với C# Backend
// File: src/components/lecturer/lecturer.types.ts
// ============================================

export interface Course {
    id: string;
    courseCode: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    semesterId: string;
    academicYearId: string;
    majorId: string;
    lecturerId: string;
    semesterName?: string;
    academicYearName?: string;
    majorName?: string;
    lecturerName?: string;
    totalStudents: number;
    totalChapters: number;
    totalLessons: number;
    totalQuizzes: number;
    averageProgress: number;
    createdAt: string;
    updatedAt?: string;
}

export interface Chapter {
    id: string;
    courseId: string;
    title: string;
    orderIndex: number;
    totalLessons: number;
    totalQuizzes: number;
    contents?: CourseContent[];
    createdAt: string;
    updatedAt?: string;
}

export interface CourseContent {
    id: string;
    chapterId: string;
    title: string;
    orderIndex: number;
    contentType: 'Lesson' | 'Quiz';
    isPublished: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface Lesson extends CourseContent {
    fileUrl?: string;
    fileType?: string;
    fileSize: number;
    durationSeconds: number;
    contentHtml?: string;
    totalViews?: number;
    completedStudents?: number;
    completionRate?: number;
}

export interface Quiz extends CourseContent {
    timeLimit?: number;
    totalPoints: number;
    passingScore: number;
    isRandomQuestion: boolean;
    maxAttempts: number;
    startDate?: string;
    endDate?: string;
    questions?: QuizQuestion[];
    totalQuestions: number;
    totalSubmissions: number;
    completedSubmissions: number;
    averageScore: number;
    passedCount: number;
    failedCount: number;
}

export interface QuestionTopic {
    id: string;
    name: string;
    lecturerId: string;
    totalQuestions: number;
    usedInQuizzes: number;
    createdAt: string;
}

export type QuestionType = 'MultipleChoice' | 'Essay' | 'TrueFalse';

export interface Question {
    id: string;
    topicId: string;
    contentText: string;
    mediaUrl?: string;
    type: QuestionType;
    topicName?: string;
    answers: Answer[];
    usageCount: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    tags: string[];
    createdAt: string;
}

export interface QuestionBankItem extends Question {
    // Already has all Question properties
}

export interface Answer {
    id: string;
    questionId: string;
    contentText: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    id: string;
    quizId: string;
    questionId: string;
    points: number;
    question?: Question;
}

export interface Student {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    studentCode?: string;
    enrolledDate: string;
    progress?: number;
    averageScore?: number;
}

export interface StudentProgress {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentCode?: string;
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
    averageQuizScore: number;
    averageAssignmentScore: number;
    progressPercentage: number;
}

export interface QuizSubmission {
    id: string;
    quizId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentCode?: string;
    quizTitle: string;
    startTime: string;
    endTime?: string;
    score: number;
    status: 'InProgress' | 'Submitted' | 'Graded';
    createdAt: string;
}

export interface LecturerDashboard {
    totalCourses: number;
    totalStudents: number;
    totalLessons: number;
    totalQuizzes: number;
    pendingGrading: number;
    courses: Course[];
}

export interface CourseReport {
    courseId: string;
    courseName: string;
    courseCode: string;
    totalStudents: number;
    averageProgress: number;
    averageQuizScore: number;
    completionRate: number;
    studentsAtRisk: number;
    topPerformers: Student[];
}

// Request DTOs
export interface CreateCourseRequest {
    courseCode: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    semesterId: string;
    academicYearId: string;
    majorId: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
    id: string;
}

export interface CreateChapterRequest {
    courseId: string;
    title: string;
    orderIndex: number;
}

export interface UpdateChapterRequest extends Partial<CreateChapterRequest> {
    id: string;
}

export interface CreateLessonRequest {
    chapterId: string;
    title: string;
    orderIndex: number;
    fileUrl?: string;
    fileType?: string;
    fileSize?: number;
    durationSeconds?: number;
    contentHtml?: string;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {
    id: string;
}

export interface CreateQuizRequest {
    chapterId: string;
    title: string;
    orderIndex: number;
    timeLimit?: number;
    totalPoints: number;
    passingScore: number;
    isRandomQuestion: boolean;
    maxAttempts: number;
    startDate?: string;
    endDate?: string;
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {
    id: string;
}

export interface CreateQuestionRequest {
    topicId: string;
    contentText: string;
    mediaUrl?: string;
    type: QuestionType;
    answers: { contentText: string; isCorrect: boolean }[];
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
    id: string;
}

export interface CreateQuestionTopicRequest {
    name: string;
}

export interface AddQuestionsToQuizRequest {
    quizId: string;
    questions: { questionId: string; points: number }[];
}

// Pagination
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CourseFilterParams extends PaginationParams {
    semesterId?: string;
    academicYearId?: string;
    search?: string;
}

export interface StudentFilterParams extends PaginationParams {
    courseId?: string;
    search?: string;
}