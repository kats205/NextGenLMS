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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map((quiz) => (
                        <QuizCard
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

interface QuizCardProps {
    quiz: Quiz;
    onViewDetail: (id: string) => void;
    onGrade: (id: string) => void;
    onEdit: (id: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onViewDetail, onGrade, onEdit }) => {
    const isFinished = new Date(quiz.endTime) < new Date();
    const isOngoing = new Date(quiz.startTime) <= new Date() && !isFinished;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{quiz.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            🕒 {quiz.durationMinutes} phút
                        </span>
                        <span className="flex items-center gap-1">
                            👥 {quiz.submissionCount} nộp
                        </span>
                        <span className="flex items-center gap-1">
                            🧩 {quiz.totalQuestions} câu
                        </span>
                    </div>
                </div>

                {isOngoing && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        Đang diễn ra
                    </span>
                )}
                {isFinished && (
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        Đã kết thúc
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-1">
                        <span>Bắt đầu:</span>
                        <span className="font-medium text-gray-900">
                            {new Date(quiz.startTime).toLocaleString('vi-VN')}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kết thúc:</span>
                        <span className="font-medium text-gray-900">
                            {new Date(quiz.endTime).toLocaleString('vi-VN')}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onViewDetail(quiz.id)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                        Chi tiết
                    </button>
                    <button
                        onClick={() => onGrade(quiz.id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Chấm bài
                    </button>
                    <button
                        onClick={() => onEdit(quiz.id)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        ⚙️
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentManagement;