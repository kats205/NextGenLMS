// src/components/lecturer/CourseEditPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import { LecturerHeader } from "./LecturerHeader";
import { LecturerNav } from "./LecturerNav";
import type { Course } from "./lecturer.types";

export type User = {
    fullName: string;
    role: string;
    avatar?: string;
};

const CourseEditPage: React.FC = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const user: User = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        loadCourse();
    }, [courseId]);

    const loadCourse = async () => {
        try {
            setLoading(true);
            const data = await lecturerApi.getCourseById(String(courseId));
            setCourse(data);
            setFormData({
                name: data.name || "",
                description: data.description || "",
            });
        } catch (error: any) {
            console.error("Failed to load course:", error);
            toast.error("Không thể tải thông tin khóa học");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Vui long nhap ten khoa hoc");
            return;
        }

        try {
            setSaving(true);

            const updateData = {
                id: String(courseId),
                name: formData.name.trim(),
                description: formData.description.trim(),
            };

            console.log("Updating course with data:", updateData);

            // Call API to update course
            await lecturerApi.updateCourse(updateData);

            toast.success("Cap nhat khoa hoc thanh cong!");
            navigate(`/lecturer/courses/${courseId}`);
        } catch (error: any) {
            console.error("Failed to update course:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.message || "Khong the cap nhat khoa hoc");
        } finally {
            setSaving(false);
        }
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
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>Chỉnh sửa</span>
                </div>

                {/* Page Title */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                        Chỉnh sửa khóa học
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>
                        {course?.courseCode} • {course?.semesterName} {course?.academicYearName}
                    </p>
                </div>

                {/* Edit Form */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    padding: '24px',
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Course Name */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: '8px',
                            }}>
                                Tên khóa học
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                }}
                                placeholder="Nhập tên khóa học"
                            />
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: '8px',
                            }}>
                                Mô tả
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                                placeholder="Nhập mô tả khóa học"
                            />
                        </div>

                        {/* Course Info (Read-only) */}
                        <div style={{
                            backgroundColor: '#F9FAFB',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '24px',
                        }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                                Thông tin khóa học
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Mã khóa học</span>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{course?.courseCode}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Học kỳ</span>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{course?.semesterName}</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Năm học</span>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{course?.academicYearName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={() => navigate(`/lecturer/courses/${courseId}`)}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    backgroundColor: '#FFFFFF',
                                    color: '#374151',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    backgroundColor: '#3B82F6',
                                    color: '#FFFFFF',
                                    fontWeight: 500,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.7 : 1,
                                }}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CourseEditPage;
