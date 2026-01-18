// Mock data for development
export interface Course {
  id: string;
  code: string;
  name: string;
  academicYear: string;
  semester: string;
  studentCount: number;
  lecturerId: string;
  description?: string;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  items: ContentItem[];
}

export interface ContentItem {
  id: string;
  chapterId: string;
  type: 'lecture' | 'assessment' | 'announcement';
  title: string;
  fileType?: 'pdf' | 'word' | 'video' | 'link';
  fileUrl?: string;
  order: number;
  duration?: number; // in seconds
}

export interface Question {
  id: string;
  courseId: string;
  topicId: string;
  type: 'multiple-choice' | 'true-false';
  questionText: string;
  questionImage?: string;
  questionAudio?: string;
  questionVideo?: string;
  options: QuestionOption[];
  correctAnswers: string[]; // array of option IDs
  points: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
}

export interface Topic {
  id: string;
  courseId: string;
  name: string;
  parentId?: string;
  children?: Topic[];
}

export interface Assessment {
  id: string;
  courseId: string;
  type: 'quiz' | 'essay';
  title: string;
  description?: string;
  openDate: string;
  closeDate: string;
  duration?: number; // in minutes, for quiz
  shuffleQuestions?: boolean;
  allowLateSubmission?: boolean;
  lateSubmissionMinutes?: number;
  questions?: string[]; // array of question IDs for quiz
  totalPoints: number;
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  submittedAt?: string;
  status: 'not-started' | 'in-progress' | 'submitted' | 'late' | 'graded';
  answers?: Record<string, string[]>; // questionId -> selected option IDs
  essayFile?: string;
  essayText?: string;
  score?: number;
  feedback?: string;
  startedAt?: string;
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  completedAssessments: number;
  totalAssessments: number;
  averageScore: number;
}

// Mock Users
export const mockUsers = [
  {
    id: '1',
    email: 'admin@university.edu.vn',
    password: 'admin123',
    fullName: 'Nguyễn Văn Admin',
    role: 'admin' as const,
    department: 'Phòng Đào tạo',
    mustChangePassword: false,
  },
  {
    id: '2',
    email: 'lecturer@university.edu.vn',
    password: 'lecturer123',
    fullName: 'Trần Thị Hương',
    role: 'lecturer' as const,
    department: 'Khoa Công nghệ Thông tin',
    mustChangePassword: false,
  },
  {
    id: '3',
    email: 'student@university.edu.vn',
    password: 'student123',
    fullName: 'Lê Minh Tuấn',
    role: 'student' as const,
    department: 'Khoa Công nghệ Thông tin',
    mustChangePassword: false,
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'c1',
    code: 'IT101',
    name: 'Lập trình căn bản',
    academicYear: '2025-2026',
    semester: 'HK1',
    studentCount: 45,
    lecturerId: '2',
    description: 'Khóa học giới thiệu về lập trình cơ bản với Python',
  },
  {
    id: 'c2',
    code: 'IT202',
    name: 'Cấu trúc dữ liệu và Giải thuật',
    academicYear: '2025-2026',
    semester: 'HK1',
    studentCount: 38,
    lecturerId: '2',
    description: 'Học về các cấu trúc dữ liệu và giải thuật cơ bản',
  },
  {
    id: 'c3',
    code: 'IT303',
    name: 'Cơ sở dữ liệu',
    academicYear: '2025-2026',
    semester: 'HK1',
    studentCount: 42,
    lecturerId: '2',
    description: 'Thiết kế và quản lý cơ sở dữ liệu quan hệ',
  },
];

// Mock Chapters
export const mockChapters: Chapter[] = [
  {
    id: 'ch1',
    courseId: 'c1',
    title: 'Chương 1: Giới thiệu về lập trình',
    order: 1,
    items: [
      {
        id: 'i1',
        chapterId: 'ch1',
        type: 'lecture',
        title: 'Bài 1.1: Lịch sử lập trình',
        fileType: 'pdf',
        fileUrl: '/files/lecture1-1.pdf',
        order: 1,
      },
      {
        id: 'i2',
        chapterId: 'ch1',
        type: 'lecture',
        title: 'Bài 1.2: Video hướng dẫn cài đặt Python',
        fileType: 'video',
        fileUrl: 'https://example.com/video1',
        order: 2,
        duration: 1200,
      },
      {
        id: 'i3',
        chapterId: 'ch1',
        type: 'assessment',
        title: 'Bài kiểm tra: Kiến thức cơ bản',
        order: 3,
      },
    ],
  },
  {
    id: 'ch2',
    courseId: 'c1',
    title: 'Chương 2: Biến và kiểu dữ liệu',
    order: 2,
    items: [
      {
        id: 'i4',
        chapterId: 'ch2',
        type: 'lecture',
        title: 'Bài 2.1: Biến trong Python',
        fileType: 'pdf',
        fileUrl: '/files/lecture2-1.pdf',
        order: 1,
      },
      {
        id: 'i5',
        chapterId: 'ch2',
        type: 'lecture',
        title: 'Bài 2.2: Các kiểu dữ liệu cơ bản',
        fileType: 'word',
        fileUrl: '/files/lecture2-2.docx',
        order: 2,
      },
    ],
  },
  {
    id: 'ch3',
    courseId: 'c1',
    title: 'Chương 3: Cấu trúc điều khiển',
    order: 3,
    items: [
      {
        id: 'i6',
        chapterId: 'ch3',
        type: 'lecture',
        title: 'Bài 3.1: Câu lệnh if-else',
        fileType: 'pdf',
        order: 1,
      },
    ],
  },
];

// Mock Topics
export const mockTopics: Topic[] = [
  {
    id: 't1',
    courseId: 'c1',
    name: 'Cơ bản về Python',
  },
  {
    id: 't2',
    courseId: 'c1',
    name: 'Vòng lặp',
  },
  {
    id: 't3',
    courseId: 'c1',
    name: 'Hàm',
  },
];

// Mock Questions
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    courseId: 'c1',
    topicId: 't1',
    type: 'multiple-choice',
    questionText: 'Python là ngôn ngữ lập trình thuộc loại nào?',
    options: [
      { id: 'o1', text: 'Ngôn ngữ biên dịch' },
      { id: 'o2', text: 'Ngôn ngữ thông dịch' },
      { id: 'o3', text: 'Ngôn ngữ Assembly' },
      { id: 'o4', text: 'Ngôn ngữ máy' },
    ],
    correctAnswers: ['o2'],
    points: 1,
  },
  {
    id: 'q2',
    courseId: 'c1',
    topicId: 't1',
    type: 'multiple-choice',
    questionText: 'Câu lệnh nào dùng để in ra màn hình trong Python?',
    options: [
      { id: 'o1', text: 'echo()' },
      { id: 'o2', text: 'print()' },
      { id: 'o3', text: 'console.log()' },
      { id: 'o4', text: 'printf()' },
    ],
    correctAnswers: ['o2'],
    points: 1,
  },
];

// Mock Assessments
export const mockAssessments: Assessment[] = [
  {
    id: 'a1',
    courseId: 'c1',
    type: 'quiz',
    title: 'Bài kiểm tra giữa kỳ',
    description: 'Kiểm tra kiến thức chương 1-3',
    openDate: '2026-01-15T08:00:00',
    closeDate: '2026-01-20T23:59:00',
    duration: 60,
    shuffleQuestions: true,
    questions: ['q1', 'q2'],
    totalPoints: 10,
  },
  {
    id: 'a2',
    courseId: 'c1',
    type: 'essay',
    title: 'Bài tập lớn: Xây dựng chương trình quản lý',
    description: 'Thiết kế và lập trình một chương trình quản lý theo yêu cầu',
    openDate: '2026-01-10T00:00:00',
    closeDate: '2026-01-25T23:59:00',
    allowLateSubmission: true,
    lateSubmissionMinutes: 1440,
    totalPoints: 20,
  },
  {
    id: 'a3',
    courseId: 'c1',
    type: 'quiz',
    title: 'Bài kiểm tra cuối kỳ',
    description: 'Kiểm tra tổng hợp toàn bộ kiến thức',
    openDate: '2026-02-01T08:00:00',
    closeDate: '2026-02-05T23:59:00',
    duration: 90,
    shuffleQuestions: true,
    totalPoints: 20,
  },
];

// Mock Submissions
export const mockSubmissions: Submission[] = [
  {
    id: 's1',
    assessmentId: 'a1',
    studentId: '3',
    status: 'submitted',
    submittedAt: '2026-01-16T10:30:00',
    answers: {
      q1: ['o2'],
      q2: ['o2'],
    },
    score: 9,
    startedAt: '2026-01-16T10:00:00',
  },
  {
    id: 's2',
    assessmentId: 'a2',
    studentId: '3',
    status: 'in-progress',
    startedAt: '2026-01-12T14:00:00',
  },
  {
    id: 's3',
    assessmentId: 'a3',
    studentId: '3',
    status: 'not-started',
  },
];

// Mock Student Progress
export const mockStudentProgress: StudentProgress[] = [
  {
    studentId: '3',
    courseId: 'c1',
    completedLessons: ['i1', 'i2', 'i4'],
    totalLessons: 6,
    completedAssessments: 1,
    totalAssessments: 3,
    averageScore: 9.0,
  },
];
