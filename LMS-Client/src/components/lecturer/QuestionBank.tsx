// src/components/lecturer/QuestionBank.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { Question, QuestionTopic } from './lecturer.types';

interface QuestionBankProps {
    courseId: string;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ courseId }) => {
    const [topics, setTopics] = useState<QuestionTopic[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuestionBank();
    }, [courseId]);

    const loadQuestionBank = async () => {
        try {
            setLoading(true);

            // Load topics
            const topicsData = await lecturerApi.getQuestionTopics();
            setTopics(topicsData);

            // Load all questions
            const allQuestions = await lecturerApi.getQuestionBank();
            setQuestions(allQuestions);
        } catch (error: any) {
            console.error('Failed to load question bank:', error);
            toast.error('Không thể tải ngân hàng câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    const filteredQuestions = selectedTopic === 'all'
        ? questions
        : questions.filter(q => q.topicId === selectedTopic);

    const handleCreateQuestion = () => {
        toast.info('Modal tạo câu hỏi sẽ được hiển thị');
    };

    const handleCreateTopic = () => {
        toast.info('Modal tạo chủ đề sẽ được hiển thị');
    };

    const handleEditQuestion = (questionId: string) => {
        toast.info(`Chỉnh sửa câu hỏi: ${questionId}`);
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

        try {
            await lecturerApi.deleteQuestion(questionId);
            toast.success('Xóa câu hỏi thành công');
            loadQuestionBank();
        } catch (error: any) {
            console.error('Failed to delete question:', error);
            toast.error('Không thể xóa câu hỏi');
        }
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả chủ đề</option>
                        {topics.map(topic => (
                            <option key={topic.id} value={topic.id}>
                                {topic.name} ({topic.totalQuestions})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleCreateTopic}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                        <span>+</span>
                        <span>Tạo chủ đề</span>
                    </button>
                    <button
                        onClick={handleCreateQuestion}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <span>+</span>
                        <span>Tạo câu hỏi</span>
                    </button>
                </div>
            </div>

            {/* Questions Grid */}
            {filteredQuestions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có câu hỏi</h3>
                    <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo câu hỏi mới</p>
                    <button
                        onClick={handleCreateQuestion}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Tạo câu hỏi đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredQuestions.map((question) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            onEdit={handleEditQuestion}
                            onDelete={handleDeleteQuestion}
                        />
                    ))}
                </div>
            )}

            {/* Summary */}
            {filteredQuestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Tổng số câu hỏi: <span className="font-semibold text-gray-900">{filteredQuestions.length}</span></span>
                        <div className="flex items-center space-x-6">
                            <span>Trắc nghiệm: <span className="font-semibold text-gray-900">
                                {filteredQuestions.filter(q => q.type === 'MultipleChoice').length}
                            </span></span>
                            <span>Đúng/Sai: <span className="font-semibold text-gray-900">
                                {filteredQuestions.filter(q => q.type === 'TrueFalse').length}
                            </span></span>
                            <span>Tự luận: <span className="font-semibold text-gray-900">
                                {filteredQuestions.filter(q => q.type === 'Essay').length}
                            </span></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface QuestionCardProps {
    question: Question;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onEdit, onDelete }) => {
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'MultipleChoice': return 'Trắc nghiệm';
            case 'TrueFalse': return 'Đúng/Sai';
            case 'Essay': return 'Tự luận';
            default: return type;
        }
    };

    const getTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'MultipleChoice': return 'bg-blue-100 text-blue-700';
            case 'TrueFalse': return 'bg-green-100 text-green-700';
            case 'Essay': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getDifficultyBadgeClass = (difficulty?: string) => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            case 'HARD': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Question Header */}
                    <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${getTypeBadgeClass(question.type)}`}>
                            {getTypeLabel(question.type)}
                        </span>
                        {question.difficulty && (
                            <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${getDifficultyBadgeClass(question.difficulty)}`}>
                                {question.difficulty}
                            </span>
                        )}
                        <span className="text-xs text-gray-500">
                            Đã dùng: {question.usageCount} lần
                        </span>
                    </div>

                    {/* Question Content */}
                    <p className="text-gray-900 font-medium mb-2">{question.contentText}</p>

                    {/* Answers for Multiple Choice */}
                    {question.type === 'MultipleChoice' && question.answers && question.answers.length > 0 && (
                        <div className="mt-3 space-y-1">
                            {question.answers.map((answer, index) => (
                                <div
                                    key={answer.id}
                                    className={`text-sm px-3 py-1.5 rounded ${answer.isCorrect
                                            ? 'bg-green-50 text-green-700 font-medium'
                                            : 'bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    {String.fromCharCode(65 + index)}. {answer.contentText}
                                    {answer.isCorrect && ' ✓'}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                        <div className="mt-3 flex items-center flex-wrap gap-2">
                            {question.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Topic */}
                    {question.topicName && (
                        <div className="mt-2 text-xs text-gray-500">
                            Chủ đề: {question.topicName}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                    <button
                        onClick={() => onEdit(question.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Chỉnh sửa"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Xóa"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionBank;