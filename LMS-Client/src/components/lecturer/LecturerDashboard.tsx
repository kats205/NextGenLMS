// src/components/lecturer/LecturerDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import type { LecturerDashboard as DashboardType } from "./lecturer.types";
import { LecturerNav } from "./LecturerNav";
import { LecturerHeader } from "./LecturerHeader";

export type User = {
    fullName: string;
    role: string;
    avatar?: string;
};
const LecturerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<DashboardType | null>(null);
    const [loading, setLoading] = useState(true);

    const user: User = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await lecturerApi.getDashboard();

            setDashboard({
                ...data,
                courses: data.courses ?? [],
            });
        } catch (error: any) {
            console.error("Failed to load dashboard:", error);
            toast.error("Không thể tải dashboard");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Đang tải...</div>;
    }

    if (!dashboard) {
        return <div className="text-center py-12">Không có dữ liệu</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <LecturerHeader user={user} />

            <div className="px-6 py-6 max-w-7xl mx-auto">
                {/* NAV */}
                <LecturerNav />

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Tổng khóa học" value={dashboard.totalCourses} icon="📚" />
                    <StatCard title="Tổng sinh viên" value={dashboard.totalStudents} icon="👥" />
                    <StatCard title="Bài giảng" value={dashboard.totalLessons} icon="📄" />
                    <StatCard title="Bài cần chấm" value={dashboard.pendingGrading} icon="📝" />
                </div>

                {/* Courses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {(dashboard.courses ?? []).map((course) => (
                        <div
                            key={course.id}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                            onClick={() => navigate(`/lecturer/courses/${course.id}`)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-semibold">{course.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {course.courseCode} - {course.semesterName} - {course.academicYearName ?? ""}
                                    </p>
                                </div>

                                <button className="text-gray-400 hover:text-blue-600">
                                    ✏️
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <MiniStat title="Sinh viên" value={course.totalStudents} color="bg-blue-50" />
                                <MiniStat title="Bài giảng" value={course.totalLessons} color="bg-green-50" />
                                <MiniStat title="Bài kiểm tra" value={course.totalQuizzes ?? 0} color="bg-purple-50" />
                            </div>

                            {/* Progress */}
                            <div className="mt-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Tiến độ trung bình</span>
                                    <span>{course.averageProgress ?? 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-2 bg-blue-600 rounded-full"
                                        style={{ width: `${course.averageProgress ?? 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Button */}
                            <div className="mt-6 flex gap-3">
                                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                                    👉 Xem chi tiết
                                </button>
                                <button className="w-12 border rounded-lg hover:bg-gray-100 transition">
                                    👥
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number; icon: string }> = ({
    title,
    value,
    icon,
}) => (
    <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-xl">
            {icon}
        </div>
    </div>
);

const MiniStat: React.FC<{ title: string; value: number; color: string }> = ({
    title,
    value,
    color,
}) => (
    <div className={`${color} rounded-xl p-4 text-center`}>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
    </div>
);

export default LecturerDashboard;