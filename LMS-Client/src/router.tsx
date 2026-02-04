import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoadingFallback } from './components/ui/LoadingFallback';
import { getStoredUser } from './utils/auth-helpers';

// Lazy load components
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ProfilePage = lazy(() => import('./components/auth/ProfilePage').then(module => ({ default: module.ProfilePage })));

// Student
const StudentDashboard = lazy(() => import('./components/student/StudentDashboard').then(module => ({ default: module.StudentDashboard })));
const ProgressPage = lazy(() => import('./components/student/ProgressPage').then(module => ({ default: module.ProgressPage })));
const AssessmentListPage = lazy(() => import('./components/student/AssessmentListPage').then(module => ({ default: module.AssessmentListPage })));
const AssessmentAttemptPage = lazy(() => import('./components/student/AssessmentAttemptPage').then(module => ({ default: module.AssessmentAttemptPage })));
const CoursePlayerPage = lazy(() => import('./components/student/CoursePlayerPage').then(module => ({ default: module.CoursePlayerPage })));

// Lecturer
const LecturerDashboard = lazy(() => import('./components/lecturer/LecturerDashboard'));
const CourseDetailPage = lazy(() => import('./components/lecturer/CourseDetailPage'));

// Admin
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const UserManagementPage = lazy(() => import('./components/admin/UserManagementPage').then(module => ({ default: module.UserManagementPage })));
const SystemConfigPage = lazy(() => import('./components/admin/SystemConfigPage').then(module => ({ default: module.SystemConfigPage })));
const CourseManagementPage = lazy(() => import('./components/admin/CourseMangementPage').then(module => ({ default: module.CourseManagementPage })));

const SuspenseLayout = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
);

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
    {
        path: '/login',
        element: (
            <SuspenseLayout>
                <LoginPage />
            </SuspenseLayout>
        ),
    },
    {
        path: '/forgot-password',
        element: (
            <SuspenseLayout>
                <ForgotPasswordPage />
            </SuspenseLayout>
        ),
    },
    // Common Protected Routes
    {
        element: <ProtectedRoute allowedRoles={['student', 'lecturer', 'admin']} />,
        children: [
            {
                path: '/profile',
                element: (
                    <SuspenseLayout>
                        <ProfilePage user={getStoredUser()} onProfileUpdate={() => { }} />
                    </SuspenseLayout>
                ),
            },
        ],
    },

    // Student Routes
    {
        element: <ProtectedRoute allowedRoles={['student']} />,
        children: [
            {
                path: '/student',
                element: <Navigate to="/student/dashboard" replace />,
            },
            {
                path: '/student/dashboard',
                element: (
                    <SuspenseLayout>
                        <StudentDashboard user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
            {
                path: '/student/progress',
                element: (
                    <SuspenseLayout>
                        <ProgressPage user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
            {
                path: '/student/assessments',
                element: (
                    <SuspenseLayout>
                        <AssessmentListPage user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
            {
                path: '/student/assessment/:assessmentId',
                element: (
                    <SuspenseLayout>
                        <AssessmentAttemptPage user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
            {
                path: '/student/courses/:courseId',
                element: (
                    <SuspenseLayout>
                        <CoursePlayerPage user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
        ],
    },

    // Lecturer Routes
    {
        element: <ProtectedRoute allowedRoles={['lecturer']} />,
        children: [
            {
                path: '/lecturer',
                element: <Navigate to="/lecturer/dashboard" replace />
            },
            {
                path: '/lecturer/dashboard',
                element: (
                    <SuspenseLayout>
                        <LecturerDashboard />
                    </SuspenseLayout>
                )
            },
            {
                path: '/lecturer/courses/:courseId',
                element: (
                    <SuspenseLayout>
                        <CourseDetailPage />
                    </SuspenseLayout>
                )
            }
        ]
    },

    // Admin Routes
    {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
            {
                path: '/admin',
                element: <Navigate to="/admin/dashboard" replace />,
            },
            {
                path: '/admin/dashboard',
                element: (
                    <SuspenseLayout>
                        <AdminDashboard user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
            {
                path: '/admin/users',
                element: (
                    <SuspenseLayout>
                        <UserManagementPage user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
            {
                path: '/admin/system',
                element: (
                    <SuspenseLayout>
                        <SystemConfigPage user={getStoredUser()} />
                    </SuspenseLayout>
                ),
            },
            {
                path: '/admin/courses',
                element: <CourseManagementPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
        ],
    },

    // 404
    {
        path: '*',
        element: <div>404 Not Found</div>,
    },
]);
