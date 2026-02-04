// src/components/lecturer/AssessmentManagement.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { Quiz } from './lecturer.types';

interface AssessmentManagementProps {
    courseId: string;
}

const AssessmentManagement: React.FC<AssessmentManagementProps> = ({ courseId }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizzes();
    }, [courseId]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await lecturerApi.getQuizzesByCourse(courseId);
            setQuizzes(data);
        } catch (error: any) {
            console.error('Failed to load quizzes:', error);
            toast.error('Không thể tải danh sách bài kiểm tra');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMultipleChoice = () => {
        toast.info('Modal tạo bài trắc nghiệm sẽ được hiển thị');
    };

    const handleCreateEssay = () => {
        toast.info('Modal tạo bài tự luận sẽ được hiển thị');
    };

    const handleOpenQuestionBank = () => {
        toast.info('Chuyển đến Ngân hàng câu hỏi');
    };

    const handleViewDetail = (quizId: string) => {
        toast.info(`Xem chi tiết quiz: ${quizId}`);
    };

    const handleGrade = (quizId: string) => {
        toast.info(`Chấm bài quiz: ${quizId}`);
    };

    const handleEdit = (quizId: string) => {
        toast.info(`Chỉnh sửa quiz: ${quizId}`);
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
            {/* Header Buttons */}
            <div className="flex items-center space-x-3">
                <button
                    onClick={handleCreateMultipleChoice}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                    <span>+</span>
                    <span>Tạo bài trắc nghiệm</span>
                </button>
                <button
                    onClick={handleCreateEssay}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                    <span>+</span>
                    <span>Tạo bài tự luận</span>
                </button>
                <button
                    onClick={handleOpenQuestionBank}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Ngân hàng câu hỏi</span>
                </button>
            </div>

            {/* Quiz Cards Grid */}
            {quizzes.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Chưa có bài kiểm tra nào</p>
                    <button
                        onClick={handleCreateMultipleChoice}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Tạo bài kiểm tra đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.map((quiz) => (
                        <AssessmentCard
                            key={quiz.id}
                            quiz={quiz}
                            onViewDetail={handleViewDetail}
                            onGrade={handleGrade}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface AssessmentCardProps {
    quiz: Quiz;
    onViewDetail: (id: string) => void;
    onGrade: (id: string) => void;
    onEdit: (id: string) => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ quiz, onViewDetail, onGrade, onEdit }) => {
    const getTypeBadge = () => {
        if (quiz.timeLimit && quiz.timeLimit > 0) {
            return { label: 'Trắc nghiệm', class: 'bg-blue-100 text-blue-700' };
        }
        return { label: 'Tự luận', class: 'bg-purple-100 text-purple-700' };
    };

    const badge = getTypeBadge();
    const submittedPercentage = quiz.totalSubmissions > 0
        ? (quiz.completedSubmissions / quiz.totalSubmissions) * 100
        : 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${badge.class}`}>
                            {badge.label}
                        </span>
                    </div>
                    <button
                        onClick={() => onEdit(quiz.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                    {quiz.startDate && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Mở: {new Date(quiz.startDate).toLocaleString('vi-VN')}
                        </div>
                    )}
                    {quiz.endDate && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Đóng: {new Date(quiz.endDate).toLocaleString('vi-VN')}
                        </div>
                    )}
                    {quiz.timeLimit && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {quiz.totalQuestions} câu hỏi • {quiz.timeLimit} phút
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Số lượt làm:</span>
                        <span className="font-semibold text-gray-900">{quiz.totalSubmissions}</span>
                    </div>
                    {quiz.averageScore > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Điểm trung bình:</span>
                            <span className="font-semibold text-gray-900">
                                {quiz.averageScore.toFixed(1)}/{quiz.totalPoints}
                            </span>
                        </div>
                    )}
                    {quiz.completedSubmissions > 0 && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Đã nộp:</span>
                                <span className="font-semibold text-gray-900">
                                    {quiz.completedSubmissions}/{quiz.totalSubmissions}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${submittedPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onViewDetail(quiz.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        Xem chi tiết
                    </button>
                    {quiz.completedSubmissions > 0 && (
                        <button
                            onClick={() => onGrade(quiz.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Chấm bài
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentManagement;