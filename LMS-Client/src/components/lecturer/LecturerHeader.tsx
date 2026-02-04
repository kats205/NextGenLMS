import { LogOut, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type LecturerUser = {
    fullName: string;
    role: string;
    avatar?: string;
};

interface LecturerHeaderProps {
    user: LecturerUser;
}

export function LecturerHeader({ user }: LecturerHeaderProps) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* LEFT LOGO */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-white">LMS</span>
                        </div>

                        <div>
                            <h1 className="font-semibold text-gray-900">
                                Hệ thống quản lý học tập
                            </h1>
                            <p className="text-sm text-gray-500">
                                Learning Management System
                            </p>
                        </div>
                    </div>

                    {/* RIGHT USER */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/lecturer/profile")}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-blue-600" />
                                </div>
                            )}

                            <div className="text-left">
                                <div className="text-sm font-medium text-gray-900">
                                    {user?.fullName ?? "Lecturer"}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                    {user?.role ?? "lecturer"}
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Đăng xuất
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}