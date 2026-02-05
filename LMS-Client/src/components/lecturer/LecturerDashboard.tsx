// src/components/lecturer/LecturerDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import type { LecturerDashboard as DashboardType } from "./lecturer.types";
import { LecturerNav } from "./LecturerNav";
import { LecturerHeader } from "./LecturerHeader";
import { X, Edit } from "lucide-react";
import type { Course } from "./lecturer.types";


export type User = {
    fullName: string;
    role: string;
    avatar?: string;
};

// Color definitions
const colors = {
    blue: { bg: '#EFF6FF', iconBg: '#DBEAFE', text: '#2563EB' },
    orange: { bg: '#FFF7ED', iconBg: '#FFEDD5', text: '#EA580C' },
    green: { bg: '#F0FDF4', iconBg: '#DCFCE7', text: '#16A34A' },
    red: { bg: '#FEF2F2', iconBg: '#FEE2E2', text: '#DC2626' },
    purple: { bg: '#FAF5FF', iconBg: '#F3E8FF', text: '#9333EA' },
};

const LecturerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState<DashboardType | null>(null);
    const [loading, setLoading] = useState(true);

    const user: User = JSON.parse(localStorage.getItem("user") || "{}");


    const [showEditModal, setShowEditModal] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        courseCode: "",
    });

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

    const handleEditClick = (course: Course) => {
        setSelectedCourse(course);
        setFormData({
            name: course.name,
            description: course.description || "",
            courseCode: course.courseCode,
        });
        setShowEditModal(true);
    };



    const handleUpdateCourse = async () => {
        if (!selectedCourse) return;
        if (!formData.name.trim()) {
            toast.error("Vui lòng nhập tên khóa học");
            return;
        }

        try {
            setIsLoadingAction(true);
            await lecturerApi.updateCourse({
                id: selectedCourse.id,
                name: formData.name,
                description: formData.description,
            });
            toast.success("Cập nhật khóa học thành công");
            setShowEditModal(false);
            loadDashboard();
        } catch (error: any) {
            console.error("Failed to update course:", error);
            toast.error("Không thể cập nhật khóa học");
        } finally {
            setIsLoadingAction(false);
        }
    };



    // Placeholder for Create Course - In a real app, this would need Semester/year selection


    // Calculate totals from courses
    const totalStudents = dashboard?.courses.reduce((sum, c) => sum + c.totalStudents, 0) || 0;
    const totalLessons = dashboard?.courses.reduce((sum, c) => sum + c.totalLessons, 0) || 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}></div>
                    <p style={{ color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!dashboard) return null;

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
            <LecturerHeader user={user} />

            <div className="mx-auto" style={{ maxWidth: '1400px', padding: '24px' }}>
                <div className="flex justify-between items-center mb-6">
                    <LecturerNav />
                </div>

                {/* Top Statistics Row - Grid 4 columns */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <StatCard
                        title="Tổng khóa học"
                        value={dashboard.totalCourses}
                        color={colors.blue}
                        icon={
                            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Bài giảng"
                        value={totalLessons}
                        color={colors.green}
                        icon={
                            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Bài cần chấm"
                        value={dashboard.pendingGrading}
                        color={colors.red}
                        icon={
                            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                        }
                    />
                </div>

                {/* Course List - 2 columns grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px'
                }}>
                    {dashboard.courses.map((course) => (
                        <div
                            key={course.id}
                            style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                padding: '20px',
                                transition: 'box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                                        {course.name}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                        {course.courseCode} • {course.semesterName} {course.academicYearName}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        style={{
                                            padding: '8px',
                                            color: '#6B7280',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onClick={() => handleEditClick(course)}
                                        title="Chỉnh sửa"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = '#2563EB';
                                            e.currentTarget.style.backgroundColor = '#EFF6FF';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '#6B7280';
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Metrics - Colored boxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                <MetricBox
                                    label="Sinh viên"
                                    value={course.totalStudents}
                                    color={colors.blue}
                                    icon={
                                        <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                                        </svg>
                                    }
                                />
                                <MetricBox
                                    label="Bài giảng"
                                    value={course.totalLessons}
                                    color={colors.green}
                                    icon={
                                        <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                        </svg>
                                    }
                                />
                                <MetricBox
                                    label="Bài kiểm tra"
                                    value={course.totalQuizzes}
                                    color={colors.purple}
                                    icon={
                                        <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                        </svg>
                                    }
                                />
                            </div>

                            {/* Progress Bar Section */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#6B7280' }}>Tiến độ trung bình</span>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                                        {Math.round(course.averageProgress)}%
                                    </span>
                                </div>
                                <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '8px' }}>
                                    <div
                                        style={{
                                            backgroundColor: '#3B82F6',
                                            height: '8px',
                                            borderRadius: '9999px',
                                            transition: 'width 0.5s',
                                            width: `${Math.min(100, Math.round(course.averageProgress))}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        backgroundColor: '#3B82F6',
                                        color: '#FFFFFF',
                                        fontWeight: 500,
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                    }}
                                    onClick={() => navigate(`/lecturer/courses/${course.id}`)}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                                >
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Xem chi tiết
                                </button>
                                <button
                                    style={{
                                        padding: '10px',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        color: '#6B7280',
                                        backgroundColor: '#FFFFFF',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    title="Thêm sinh viên"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/lecturer/courses/${course.id}/students`);
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                >
                                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



            {/* Edit Course Modal */}
            {showEditModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999
                    }}
                >
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa khóa học</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã khóa học</label>
                                <input
                                    type="text"
                                    value={formData.courseCode}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateCourse}
                                disabled={isLoadingAction}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {isLoadingAction ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

// Stat Card Component for top statistics
const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: { bg: string; iconBg: string; text: string };
}> = ({ title, value, icon, color }) => (
    <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #E5E7EB',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{title}</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{value}</p>
            </div>
            <div style={{
                width: '44px',
                height: '44px',
                backgroundColor: color.iconBg,
                color: color.text,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {icon}
            </div>
        </div>
    </div>
);

// Metric Box Component for course metrics
const MetricBox: React.FC<{
    icon: React.ReactNode;
    value: number;
    label: string;
    color: { bg: string; iconBg: string; text: string };
}> = ({ icon, value, label, color }) => (
    <div style={{
        backgroundColor: color.bg,
        borderRadius: '12px',
        padding: '12px',
        textAlign: 'center',
    }}>
        <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: color.iconBg,
            color: color.text,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 8px auto',
        }}>
            {icon}
        </div>
        <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{value}</p>
        <p style={{ fontSize: '12px', color: '#6B7280' }}>{label}</p>
    </div>
);

export default LecturerDashboard;