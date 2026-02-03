import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { LecturerDashboard as DashboardType, Course } from './lecturer.types';

const LecturerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<DashboardType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await lecturerApi.getDashboard();
            setDashboard(data);
        } catch (error: any) {
            console.error('Failed to load dashboard:', error);
            toast.error('Không thể tải dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleViewCourseDetail = (courseId: string) => {
        navigate(`/lecturer/courses/${courseId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Không có dữ liệu</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Giảng viên</h1>
                <p className="text-gray-600 mt-1">Tổng quan về các khóa học của bạn</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Tổng khóa học"
                    value={dashboard.totalCourses}
                    icon="📚"
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Tổng sinh viên"
                    value={dashboard.totalStudents}
                    icon="👥"
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Bài giảng"
                    value={dashboard.totalLessons}
                    icon="📝"
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Bài cần chấm"
                    value={dashboard.pendingGrading}
                    icon="✏️"
                    color="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Courses List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Khóa học của tôi</h2>
                {dashboard.courses.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có khóa học nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dashboard.courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                onViewDetail={handleViewCourseDetail}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    icon: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </div>
    );
};

interface CourseCardProps {
    course: Course;
    onViewDetail: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onViewDetail }) => {
    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        {course.courseCode} • {course.semesterName}
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center p-2 bg-blue-50 rounded">
                            <p className="text-2xl font-bold text-blue-700">{course.totalStudents}</p>
                            <p className="text-xs text-gray-600">Sinh viên</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                            <p className="text-2xl font-bold text-green-700">{course.totalLessons}</p>
                            <p className="text-xs text-gray-600">Bài giảng</p>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                            <p className="text-2xl font-bold text-purple-700">{course.totalQuizzes}</p>
                            <p className="text-xs text-gray-600">Bài kiểm tra</p>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Tiến độ trung bình</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {course.averageProgress.toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${course.averageProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
                <button
                    onClick={() => onViewDetail(course.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

export default LecturerDashboard;