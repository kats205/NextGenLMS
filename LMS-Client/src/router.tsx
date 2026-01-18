import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagementPage } from './components/admin/UserManagementPage';
import { SystemConfigPage } from './components/admin/SystemConfigPage';
import { ProgressPage } from './components/student/ProgressPage';
import { AssessmentListPage } from './components/student/AssessmentListPage';
import { CoursePlayerPage } from './components/student/CoursePlayerPage';
import { AssessmentAttemptPage } from './components/student/AssessmentAttemptPage';
import { CourseDetailPage } from './components/lecturer/CourseDetailPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ProfilePage } from './components/auth/ProfilePage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/login" replace />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    // Common Protected Routes
    {
        element: <ProtectedRoute allowedRoles={['student', 'lecturer', 'admin']} />,
        children: [
            {
                path: '/profile',
                element: <ProfilePage user={JSON.parse(localStorage.getItem('user') || '{}')} onProfileUpdate={() => { }} />,
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
                element: <StudentDashboard user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
            {
                path: '/student/progress',
                element: <ProgressPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
            {
                path: '/student/assessments',
                element: <AssessmentListPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
            {
                path: '/student/assessment/:assessmentId',
                element: <AssessmentAttemptPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
            {
                path: '/student/courses/:courseId',
                element: <CoursePlayerPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
        ],
    },

    // Lecturer Routes
    {
        element: <ProtectedRoute allowedRoles={['lecturer']} />,
        children: [
            {
                path: '/lecturer',
                element: <Navigate to="/lecturer/dashboard" replace />,
            },
            {
                path: '/lecturer/dashboard',
                element: <LecturerDashboard user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
            {
                path: '/lecturer/courses/:courseId',
                element: <CourseDetailPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
        ],
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
                element: <AdminDashboard user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
            {
                path: '/admin/users',
                element: <UserManagementPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
            {
                path: '/admin/system',
                element: <SystemConfigPage user={JSON.parse(localStorage.getItem('user') || '{}')} />,
            },
        ],
    },

    // 404
    {
        path: '*',
        element: <div>404 Not Found</div>,
    },
]);
