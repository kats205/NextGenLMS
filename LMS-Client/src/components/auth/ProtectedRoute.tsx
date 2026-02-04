import { Navigate, Outlet } from 'react-router-dom';
import { getStoredUser } from '../../utils/auth-helpers';

interface ProtectedRouteProps {
    // allowedRoles: ('admin' | 'lecturer' | 'student')[]; // Tạm thời để string cho dễ test
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem('token');
    const user = getStoredUser();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có role requirement, check role (case-insensitive)
    const userRoleLower = user?.role?.toLowerCase();
    if (allowedRoles && user && !allowedRoles.some(r => r.toLowerCase() === userRoleLower)) {
        // Đá về trang dashboard tương ứng với role của họ hoặc 403
        if (userRoleLower === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (userRoleLower === 'lecturer') return <Navigate to="/lecturer/dashboard" replace />;
        if (userRoleLower === 'student') return <Navigate to="/student/dashboard" replace />;

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
