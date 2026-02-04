// src/components/lecturer/CourseReports.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { CourseReport, Student, StudentProgress } from './lecturer.types';

interface CourseReportsProps {
    courseId: string;
}

const CourseReports: React.FC<CourseReportsProps> = ({ courseId }) => {
    const [report, setReport] = useState<CourseReport | null>(null);
    const [students, setStudents] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReport();
    }, [courseId]);

    const loadReport = async () => {
        try {
            setLoading(true);

            // Load course report
            const reportData = await lecturerApi.getCourseReport(courseId);
            setReport(reportData);

            // Load students with progress
            const studentsData = await lecturerApi.getStudentsByCourse(courseId);

            // Load detailed progress for each student
            const studentsWithProgress: StudentProgress[] = [];

            for (const student of studentsData.data) {
                try {
                    const progress = await lecturerApi.getStudentProgress(courseId, student.id);
                    studentsWithProgress.push(progress);
                } catch (error) {
                    console.error(`Failed to load progress for student ${student.id}:`, error);
                }
            }

            setStudents(studentsWithProgress);
        } catch (error: any) {
            console.error('Failed to load report:', error);
            toast.error('Không thể tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        toast.success('Đang xuất file Excel...');
        // TODO: Implement Excel export
    };

    const handleExportPDF = () => {
        toast.success('Đang xuất file PDF...');
        // TODO: Implement PDF export
    };

    const handleViewStudentDetail = (studentId: string) => {
        toast.info(`Xem chi tiết sinh viên: ${studentId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Không có dữ liệu báo cáo</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <select
                    disabled
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none w-80 bg-white"
                >
                    <option>Lập trình Web (IT301)</option>
                </select>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Xuất Excel</span>
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Xuất PDF</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng sinh viên"
                    value={report.totalStudents.toString()}
                />
                <StatCard
                    title="Tiến độ trung bình"
                    value={`${report.averageProgress.toFixed(0)}%`}
                />
                <StatCard
                    title="Điểm TB trắc nghiệm"
                    value={report.averageQuizScore.toFixed(1)}
                />
                <StatCard
                    title="Tỷ lệ tham gia"
                    value={`${report.completionRate.toFixed(0)}%`}
                />
            </div>

            {/* Student Details Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Báo cáo chi tiết sinh viên</h3>
                </div>

                {students.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Chưa có sinh viên nào</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SINH VIÊN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TIẾN ĐỘ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ĐTB TRẮC NGHIỆM</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ĐTB TỰ LUẬN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">THAM GIA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <StudentReportRow
                                    key={student.studentId}
                                    student={student}
                                    onViewDetail={handleViewStudentDetail}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

interface StudentReportRowProps {
    student: StudentProgress;
    onViewDetail: (studentId: string) => void;
}

const StudentReportRow: React.FC<StudentReportRowProps> = ({ student, onViewDetail }) => {
    const participationRate = student.totalLessons > 0
        ? ((student.completedLessons / student.totalLessons) * 100)
        : 0;

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-gray-900">{student.studentName}</div>
                    <div className="text-sm text-gray-500">{student.studentCode}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                    <div className="flex-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${student.progressPercentage}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                        {student.progressPercentage.toFixed(0)}%
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {student.averageQuizScore.toFixed(1)}/10
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {student.averageAssignmentScore.toFixed(1)}/10
            </td>
            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {participationRate.toFixed(0)}%
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={() => onViewDetail(student.studentId)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                    Chi tiết
                </button>
            </td>
        </tr>
    );
};

export default CourseReports;