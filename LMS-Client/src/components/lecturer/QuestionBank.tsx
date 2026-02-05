import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { QuestionTopic, Question, CreateQuestionRequest } from './lecturer.types';

const QuestionBank: React.FC = () => {
    // State
    const [topics, setTopics] = useState<QuestionTopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<QuestionTopic | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // Modals
    const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');

    const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
    const [newQuestionData, setNewQuestionData] = useState<CreateQuestionRequest>({
        topicId: '',
        contentText: '',
        mediaUrl: '',
        type: 'MultipleChoice' as any,
        answers: [
            { contentText: '', isCorrect: false },
            { contentText: '', isCorrect: false },
            { contentText: '', isCorrect: false },
            { contentText: '', isCorrect: false },
        ]
    });

    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Helper: Resize Image
    const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                } else {
                    resolve(file); // No resize needed
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], file.name, { type: file.type });
                            resolve(resizedFile);
                        } else {
                            reject(new Error('Canvas to Blob failed'));
                        }
                    }, file.type);
                } else {
                    reject(new Error('Canvas Context failed'));
                }
            };
            img.onerror = (err) => reject(err);
        });
    };

    // Initial Load
    useEffect(() => {
        loadTopics();
    }, []);

    // Load Topics
    const loadTopics = async () => {
        try {
            setLoadingTopics(true);
            const data = await lecturerApi.getQuestionTopics();
            setTopics(data);
            if (data.length > 0 && !selectedTopic) {
                // Select first topic by default
                handleSelectTopic(data[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách chủ đề');
        } finally {
            setLoadingTopics(false);
        }
    };

    // Select Topic & Load Questions
    const handleSelectTopic = async (topic: QuestionTopic) => {
        setSelectedTopic(topic);
        try {
            setLoadingQuestions(true);
            const data = await lecturerApi.getQuestionsByTopic(topic.id);
            setQuestions(data);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách câu hỏi');
        } finally {
            setLoadingQuestions(false);
        }
    };

    // Create Topic
    const handleCreateTopic = async () => {
        if (!newTopicName.trim()) {
            toast.warning('Tên chủ đề không được để trống');
            return;
        }
        try {
            // Send both casing styles to ensure backend binding works
            const newTopic = await lecturerApi.createQuestionTopic({
                name: newTopicName,
                Name: newTopicName
            });
            setTopics([newTopic, ...topics]);
            setNewTopicName('');
            setShowCreateTopicModal(false);
            toast.success('Tạo chủ đề thành công');
            handleSelectTopic(newTopic);
        } catch (error: any) {
            console.error('Create topic error:', error);
            if (error.response?.data) {
                console.error('Error detail:', error.response.data);
            }
            toast.error('Lỗi khi tạo chủ đề');
        }
    };

    // Delete Topic
    const handleDeleteTopic = async (e: React.MouseEvent, topicId: string) => {
        e.stopPropagation();
        if (!window.confirm('Bạn có chắc chắn muốn xóa chủ đề này? Các câu hỏi trong chủ đề cũng sẽ bị xóa.')) return;

        try {
            await lecturerApi.deleteQuestionTopic(topicId);
            setTopics(topics.filter(t => t.id !== topicId));
            if (selectedTopic?.id === topicId) {
                setSelectedTopic(null);
                setQuestions([]);
            }
            toast.success('Xóa chủ đề thành công');
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa chủ đề');
        }
    };

    // Delete Question
    const handleDeleteQuestion = async (e: React.MouseEvent, questionId: string) => {
        e.stopPropagation();
        if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
        try {
            await lecturerApi.deleteQuestion(questionId);
            setQuestions(questions.filter(q => q.id !== questionId));
            toast.success('Xóa câu hỏi thành công');
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa câu hỏi');
        }
    };

    // Question Form Handlers
    const resetQuestionForm = () => {
        setNewQuestionData({
            topicId: selectedTopic?.id || '',
            contentText: '',
            mediaUrl: '',
            type: 'MultipleChoice' as any,
            answers: [
                { contentText: '', isCorrect: false },
                { contentText: '', isCorrect: false },
                { contentText: '', isCorrect: false },
                { contentText: '', isCorrect: false },
            ]
        });
        setEditingQuestionId(null);
    };

    const handleOpenCreateQuestion = () => {
        if (!selectedTopic) return;
        resetQuestionForm();
        setNewQuestionData(prev => ({ ...prev, topicId: selectedTopic.id }));
        setShowCreateQuestionModal(true);
    };

    const handleOpenEditQuestion = (question: Question) => {
        setEditingQuestionId(question.id);
        setNewQuestionData({
            topicId: question.topicId,
            contentText: question.contentText,
            mediaUrl: question.mediaUrl || '',
            type: (question.type as any) === 'MultipleChoice' || (question.type as any) === 1 ? 'MultipleChoice' : question.type as any,
            answers: question.answers.map(a => ({
                contentText: a.contentText,
                isCorrect: a.isCorrect
            }))
        });
        setShowCreateQuestionModal(true);
    };

    const handleAnswerChange = (index: number, value: string) => {
        const updatedAnswers = [...newQuestionData.answers];
        updatedAnswers[index].contentText = value;
        setNewQuestionData({ ...newQuestionData, answers: updatedAnswers });
    };

    const handleCorrectAnswerChange = (index: number) => {
        const updatedAnswers = newQuestionData.answers.map((ans, i) => ({
            ...ans,
            isCorrect: i === index
        }));
        setNewQuestionData({ ...newQuestionData, answers: updatedAnswers });
    };

    const handleAddAnswer = () => {
        setNewQuestionData({
            ...newQuestionData,
            answers: [...newQuestionData.answers, { contentText: '', isCorrect: false }]
        });
    };

    const handleRemoveAnswer = (index: number) => {
        if (newQuestionData.answers.length <= 3) {
            toast.warning('Cần tối thiểu 3 đáp án'); // UI enforcing the >2 rule (>2 means 3+)
            return;
        }
        const updatedAnswers = newQuestionData.answers.filter((_, i) => i !== index);
        setNewQuestionData({ ...newQuestionData, answers: updatedAnswers });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error('Kích thước ảnh không được quá 5MB');
            return;
        }

        try {
            setIsUploading(true);
            // Resize Image to max 600x600
            const resizedFile = await resizeImage(file, 600, 600);

            const url = await lecturerApi.uploadFile(resizedFile, 'question-images');
            setNewQuestionData(prev => ({ ...prev, mediaUrl: url }));
            toast.success('Upload ảnh thành công');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Lỗi khi upload ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveQuestion = async () => {
        // Validation
        if (!newQuestionData.contentText.trim()) {
            toast.warning('Nội dung câu hỏi không được để trống');
            return;
        }

        const validAnswers = newQuestionData.answers.filter(a => a.contentText.trim() !== '');

        // Strict mapping for QuestionType enum
        const typeMap: Record<string, number> = {
            'MultipleChoice': 1,
            'Essay': 2,
            'TrueFalse': 3,
            'FillInTheBlank': 4
        };

        const typeInt = typeMap[newQuestionData.type] || 1;

        // Custom validation based on type
        if (typeInt === 1) { // MultipleChoice
            if (validAnswers.length < 3) {
                toast.warning('Cần ít nhất 3 đáp án hợp lệ cho câu hỏi trắc nghiệm');
                return;
            }
            const hasCorrect = validAnswers.some(a => a.isCorrect);
            if (!hasCorrect) {
                toast.warning('Vui lòng chọn 1 đáp án đúng');
                return;
            }
        }

        try {
            if (editingQuestionId) {
                // Update existing question
                await lecturerApi.updateQuestion({
                    id: editingQuestionId,
                    ...newQuestionData,
                    type: typeInt as any,
                    answers: validAnswers
                });
                toast.success('Cập nhật câu hỏi thành công');
            } else {
                // Create new question
                await lecturerApi.createQuestion({
                    ...newQuestionData,
                    type: typeInt as any,
                    answers: validAnswers
                });
                toast.success('Tạo câu hỏi thành công');
            }

            setShowCreateQuestionModal(false);
            if (selectedTopic) handleSelectTopic(selectedTopic); // Refresh list
        } catch (error: any) {
            console.error(error);
            // Catch specific backend error messages
            const msg = error.response?.data?.message || error.response?.data?.Errors || 'Lỗi khi lưu câu hỏi';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    return (
        <div className="flex min-h-[600px] gap-6">
            {/* Sidebar: Topics */}
            <div className="w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">Chủ đề câu hỏi</h2>
                    <button
                        onClick={() => setShowCreateTopicModal(true)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Thêm chủ đề mới"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loadingTopics ? (
                        <div className="text-center py-4 text-gray-400">Đang tải...</div>
                    ) : topics.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">Chưa có chủ đề nào</div>
                    ) : (
                        topics.map(topic => (
                            <div
                                key={topic.id}
                                onClick={() => handleSelectTopic(topic)}
                                className={`group flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${selectedTopic?.id === topic.id
                                    ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                                    : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                                    }`}
                            >
                                <span className="truncate">{topic.name}</span>
                                <button
                                    onClick={(e) => handleDeleteTopic(e, topic.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content: Questions */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                {selectedTopic ? (
                    <>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg text-gray-800">{selectedTopic.name}</h2>
                                <p className="text-sm text-gray-500">{questions.length} câu hỏi</p>
                            </div>
                            <button
                                onClick={handleOpenCreateQuestion}
                                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2 shadow-sm transition-all "
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                <span>Thêm câu hỏi</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {loadingQuestions ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : questions.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-gray-900 font-medium">Chưa có câu hỏi nào</h3>
                                    <p className="text-gray-500 text-sm mt-1">Hãy bắt đầu bằng cách thêm câu hỏi mới vào chủ đề này.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {questions.map((q, idx) => (
                                        <div key={q.id} className="py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEditQuestion(q)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Chỉnh sửa"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00 2 2h11a2 2 0 00 2-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteQuestion(e, q.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                    title="Xóa câu hỏi"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>

                                            <div className="flex justify-start items-start gap-4 p-4">

                                                <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded text-sm min-w-[32px] text-center h-fit">
                                                    {idx + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <div className=" font-medium text-gray-800 mb-2 whitespace-pre-line">{q.contentText}</div>

                                                    {q.mediaUrl && (
                                                        <div className="mb-4">
                                                            <img src={q.mediaUrl} alt="Question Info" className="max-h-48 rounded-lg border border-gray-200" />
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {q.answers.map((ans) => (
                                                            <div
                                                                key={ans.id}
                                                                className={`p-3 rounded-md border text-sm flex items-center gap-3 ${ans.isCorrect
                                                                    ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                                                                    : 'bg-white border-gray-100 text-gray-600'
                                                                    }`}
                                                            >
                                                                {ans.isCorrect ? (
                                                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                ) : (
                                                                    <div className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"></div>
                                                                )}
                                                                <span>{ans.contentText}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <h3 className="text-xl font-medium text-gray-600">Chọn một chủ đề</h3>
                        <p className="mt-2">Vui lòng chọn hoặc tạo mới một chủ đề để quản lý câu hỏi.</p>
                    </div>
                )}
            </div>

            {/* Create Topic Modal */}
            {showCreateTopicModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                        <h3 className="text-xl font-bold mb-4">Tạo chủ đề mới</h3>
                        <input
                            type="text"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            placeholder="Nhập tên chủ đề..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreateTopicModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateTopic}
                                disabled={!newTopicName.trim()}
                                className="px-5 py-2 bg-blue-600  rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Tạo chủ đề
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Question Modal */}
            {showCreateQuestionModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">{editingQuestionId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</h3>
                            <button onClick={() => setShowCreateQuestionModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                {/* Question Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung câu hỏi</label>
                                    <textarea
                                        value={newQuestionData.contentText}
                                        onChange={(e) => setNewQuestionData({ ...newQuestionData, contentText: e.target.value })}
                                        placeholder="Nhập nội dung câu hỏi..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    ></textarea>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh minh họa (Tùy chọn)</label>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            {isUploading && <p className="text-sm text-blue-600 mt-1">Đang tải ảnh lên...</p>}
                                        </div>
                                        {newQuestionData.mediaUrl && (
                                            <div className="relative group">
                                                <img
                                                    src={newQuestionData.mediaUrl}
                                                    alt="Preview"
                                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    onClick={() => setNewQuestionData(p => ({ ...p, mediaUrl: '' }))}
                                                    className="absolute -top-2 -right-2 bg-red-500  rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Xóa ảnh"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Answers */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">Danh sách đáp án</label>
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            Lưu ý: Chọn 1 đáp án đúng
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {newQuestionData.answers.map((ans, idx) => (
                                            <div key={idx} className="flex items-center gap-3 group">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={ans.isCorrect}
                                                    onChange={() => handleCorrectAnswerChange(idx)}
                                                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={ans.contentText}
                                                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                                    placeholder={`Đáp án ${idx + 1}`}
                                                    className={`flex-1 px-4 py-2 border rounded-lg outline-none transition-colors ${ans.isCorrect
                                                        ? 'border-green-500 ring-1 ring-green-500 bg-green-50'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                                        }`}
                                                />
                                                <button
                                                    onClick={() => handleRemoveAnswer(idx)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa đáp án"
                                                    disabled={newQuestionData.answers.length <= 3}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            onClick={handleAddAnswer}
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Thêm đáp án
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowCreateQuestionModal(false)}
                                className="px-5 px-2 py-1 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSaveQuestion}
                                disabled={isUploading}
                                className="px-5 px-2 py-1 bg-blue-600  rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingQuestionId ? 'Lưu thay đổi' : 'Tạo câu hỏi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;