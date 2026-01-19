import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    // allowedRoles: ('admin' | 'lecturer' | 'student')[]; // Tạm thời để string cho dễ test
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có role requirement, check role
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Đá về trang dashboard tương ứng với role của họ hoặc 403
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'lecturer') return <Navigate to="/lecturer/dashboard" replace />;
        if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
