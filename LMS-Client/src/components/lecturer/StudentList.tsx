// src/components/lecturer/StudentList.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { QuizSubmission } from './lecturer.types';

interface StudentListProps {
    courseId: string;
}

const StudentList: React.FC<StudentListProps> = ({ courseId }) => {
    const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCourse, setFilterCourse] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadSubmissions();
    }, [courseId]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);

            // Get all quizzes for the course
            const quizzes = await lecturerApi.getQuizzesByCourse(courseId);

            // Get submissions for each quiz
            const allSubmissions: QuizSubmission[] = [];

            for (const quiz of quizzes) {
                try {
                    const quizSubmissions = await lecturerApi.getQuizSubmissions(quiz.id);
                    allSubmissions.push(...quizSubmissions);
                } catch (error) {
                    console.error(`Failed to load submissions for quiz ${quiz.id}:`, error);
                }
            }

            // Sort by submission time descending
            allSubmissions.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setSubmissions(allSubmissions);
        } catch (error: any) {
            console.error('Failed to load submissions:', error);
            toast.error('Không thể tải danh sách bài nộp');
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        if (filterStatus !== 'all') {
            if (filterStatus === 'pending' && submission.status !== 'Submitted') return false;
            if (filterStatus === 'graded' && submission.status !== 'Graded') return false;
        }
        return true;
    });

    const handleGrade = (submissionId: string) => {
        toast.info(`Modal chấm bài cho submission: ${submissionId}`);
    };

    const handleView = (submissionId: string) => {
        toast.info(`Xem chi tiết bài làm: ${submissionId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center space-x-4">
                <select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tất cả khóa học</option>
                    <option value="current">Lập trình Web (IT301)</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ chấm</option>
                    <option value="graded">Đã chấm</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Chưa có bài nộp nào</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SINH VIÊN</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BÀI KIỂM TRA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">THỜI GIAN NỘP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TRẠNG THÁI</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSubmissions.map((submission) => (
                                <SubmissionRow
                                    key={submission.id}
                                    submission={submission}
                                    onGrade={handleGrade}
                                    onView={handleView}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

interface SubmissionRowProps {
    submission: QuizSubmission;
    onGrade: (id: string) => void;
    onView: (id: string) => void;
}

const SubmissionRow: React.FC<SubmissionRowProps> = ({ submission, onGrade, onView }) => {
    const isPending = submission.status === 'Submitted';
    const isGraded = submission.status === 'Graded';

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-gray-900">{submission.studentName}</div>
                    <div className="text-sm text-gray-500">{submission.studentCode}</div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div>
                    <div className="font-medium text-gray-900">{submission.quizTitle}</div>
                    <div className="text-sm text-gray-500">IT301</div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-600">
                {submission.endTime
                    ? new Date(submission.endTime).toLocaleString('vi-VN')
                    : 'Đang làm bài'}
            </td>
            <td className="px-6 py-4">
                {isPending && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Chờ chấm
                    </span>
                )}
                {isGraded && (
                    <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Đã chấm
                        </span>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                            Điểm: {submission.score}/10
                        </div>
                    </div>
                )}
                {submission.status === 'InProgress' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Đang làm
                    </span>
                )}
            </td>
            <td className="px-6 py-4">
                {isPending ? (
                    <button
                        onClick={() => onGrade(submission.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        Chấm bài
                    </button>
                ) : (
                    <button
                        onClick={() => onView(submission.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                        Xem lại
                    </button>
                )}
            </td>
        </tr>
    );
};

export default StudentList;