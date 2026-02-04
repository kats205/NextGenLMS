// src/components/lecturer/CourseStudentsPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import { LecturerHeader } from "./LecturerHeader";
import { LecturerNav } from "./LecturerNav";
import type { Course, Student } from "./lecturer.types";

export type User = {
    fullName: string;
    role: string;
    avatar?: string;
};

const CourseStudentsPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingStudent, setAddingStudent] = useState(false);
    const [newStudentEmail, setNewStudentEmail] = useState("");

    const user: User = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load course info
            const courseData = await lecturerApi.getCourseById(String(courseId));
            setCourse(courseData);

            // Load students from API - handle if endpoint doesn't exist yet
            try {
                const studentsResponse = await lecturerApi.getStudentsByCourse(String(courseId));
                setStudents(studentsResponse.data || studentsResponse || []);
            } catch (studentError: any) {
                console.warn("Students API not available yet:", studentError);
                // Set empty students array - API might not exist yet
                setStudents([]);
            }
        } catch (error: any) {
            console.error("Failed to load data:", error);
            toast.error("Không thể tải dữ liệu khóa học");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.studentCode?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemoveStudent = async (studentId: string) => {
        if (window.confirm("Bạn có chắc muốn xóa sinh viên này khỏi khóa học?")) {
            try {
                await lecturerApi.removeStudent(String(courseId), studentId);
                setStudents(students.filter(s => s.id !== studentId));
                toast.success("Đã xóa sinh viên khỏi khóa học");
            } catch (error: any) {
                console.error("Failed to remove student:", error);
                toast.error("Không thể xóa sinh viên khỏi khóa học");
            }
        }
    };

    const handleAddStudent = async () => {
        // Validation
        if (!newStudentEmail.trim()) {
            toast.error("Vui lòng nhập email sinh viên");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newStudentEmail.trim())) {
            toast.error("Email không hợp lệ");
            return;
        }

        // Check if email already exists
        if (students.some(s => s.email.toLowerCase() === newStudentEmail.toLowerCase())) {
            toast.error("Email sinh viên đã tồn tại trong khóa học");
            return;
        }

        try {
            setAddingStudent(true);

            // Call API to enroll student
            await lecturerApi.enrollStudent(String(courseId), newStudentEmail.trim());

            toast.success(`Đã thêm sinh viên với email "${newStudentEmail}" vào khóa học`);

            // Reload student list to get updated data
            await loadData();

            // Reset form and close modal
            setNewStudentEmail("");
            setShowAddModal(false);
        } catch (error: any) {
            console.error("Failed to add student:", error);
            toast.error(error.response?.data?.message || "Không thể thêm sinh viên vào khóa học");
        } finally {
            setAddingStudent(false);
        }
    };

    const handleCloseModal = () => {
        setNewStudentEmail("");
        setShowAddModal(false);
    };

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

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
            <LecturerHeader user={user} />

            <div className="mx-auto" style={{ maxWidth: '1400px', padding: '24px' }}>
                <LecturerNav />

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <button
                        onClick={() => navigate('/lecturer/dashboard')}
                        style={{
                            color: '#6B7280',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        Dashboard
                    </button>
                    <span style={{ color: '#9CA3AF' }}>/</span>
                    <button
                        onClick={() => navigate(`/lecturer/courses/${courseId}`)}
                        style={{
                            color: '#6B7280',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        {course?.name}
                    </button>
                    <span style={{ color: '#9CA3AF' }}>/</span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>Quản lý sinh viên</span>
                </div>

                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                            Quản lý sinh viên
                        </h1>
                        <p style={{ color: '#6B7280', fontSize: '14px' }}>
                            {course?.courseCode} • {course?.semesterName} {course?.academicYearName}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: '#3B82F6',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Thêm sinh viên
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        padding: '16px',
                    }}>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Tổng sinh viên</p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{students.length}</p>
                    </div>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        padding: '16px',
                    }}>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Tiến độ trung bình</p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                            {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.progress || 0), 0) / students.length) : 0}%
                        </p>
                    </div>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        padding: '16px',
                    }}>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Hoàn thành 100%</p>
                        <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
                            {students.filter(s => (s.progress || 0) === 100).length}
                        </p>
                    </div>
                </div>

                {/* Search and Student List */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    padding: '20px',
                }}>
                    <div style={{ marginBottom: '16px' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sinh viên theo tên, mã SV hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                padding: '10px 16px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Student Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                    Sinh viên
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                    Mã SV
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                    Tiến độ
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                    Ngày đăng ký
                                </th>
                                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <td style={{ padding: '16px 8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {student.avatarUrl ? (
                                                <img src={student.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontWeight: 600 }}>
                                                    {student.fullName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{student.fullName}</p>
                                                <p style={{ fontSize: '12px', color: '#6B7280' }}>{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 8px', fontSize: '14px', color: '#374151' }}>
                                        {student.studentCode || '-'}
                                    </td>
                                    <td style={{ padding: '16px 8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '100px', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '6px' }}>
                                                <div
                                                    style={{
                                                        backgroundColor: (student.progress || 0) >= 80 ? '#16A34A' : (student.progress || 0) >= 50 ? '#F59E0B' : '#DC2626',
                                                        height: '6px',
                                                        borderRadius: '9999px',
                                                        width: `${student.progress || 0}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>{student.progress || 0}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 8px', fontSize: '14px', color: '#6B7280' }}>
                                        {student.enrolledDate ? new Date(student.enrolledDate).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleRemoveStudent(student.id)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#FEE2E2',
                                                color: '#DC2626',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredStudents.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                            <svg style={{ width: '48px', height: '48px', margin: '0 auto 12px', color: '#D1D5DB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>Không tìm thấy sinh viên nào</p>
                            <p style={{ fontSize: '14px' }}>Hãy thêm sinh viên vào khóa học</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Student Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '450px',
                    }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                            Thêm sinh viên vào khóa học
                        </h2>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
                            Nhập email của sinh viên đã có tài khoản trong hệ thống
                        </p>

                        {/* Email Input */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                                Email sinh viên <span style={{ color: '#DC2626' }}>*</span>
                            </label>
                            <input
                                type="email"
                                value={newStudentEmail}
                                onChange={(e) => setNewStudentEmail(e.target.value)}
                                placeholder="Nhập email sinh viên"
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !addingStudent) {
                                        handleAddStudent();
                                    }
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={handleCloseModal}
                                disabled={addingStudent}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    backgroundColor: '#FFFFFF',
                                    color: '#374151',
                                    fontWeight: 500,
                                    cursor: addingStudent ? 'not-allowed' : 'pointer',
                                    opacity: addingStudent ? 0.6 : 1,
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddStudent}
                                disabled={addingStudent}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: '#3B82F6',
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                    cursor: addingStudent ? 'not-allowed' : 'pointer',
                                    opacity: addingStudent ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                {addingStudent ? (
                                    <>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid #FFFFFF',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite',
                                        }}></div>
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Thêm sinh viên
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseStudentsPage;
