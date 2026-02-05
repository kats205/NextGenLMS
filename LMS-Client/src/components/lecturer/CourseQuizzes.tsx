import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, FileText, Calendar, Clock, Edit, FileQuestion, Trash, Save, Search, CheckSquare, Square, X } from "lucide-react";
import { Button } from "../ui/button";
import lecturerApi from "../../api/lecturerApi";
import type { Quiz, Question, QuestionTopic, CreateQuizRequest } from "./lecturer.types";
import { toast } from "react-toastify";
import QuestionBank from "./QuestionBank";

export const CourseQuizzes = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [chapters, setChapters] = useState<{ id: string, title: string }[]>([]);

    // Create Quiz State
    const [newQuiz, setNewQuiz] = useState<CreateQuizRequest>({
        chapterId: '',
        title: '',
        orderIndex: 0,
        timeLimit: 30,
        totalPoints: 10,
        passingScore: 5,
        isRandomQuestion: false,
        shuffleAnswers: false,
        showAnswersAfterClose: false,
        maxAttempts: 1,
        startDate: undefined,
        endDate: undefined
    });
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

    // Bank Selection State
    const [bankTopics, setBankTopics] = useState<QuestionTopic[]>([]);
    const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<string>('');
    const [showBankModal, setShowBankModal] = useState(false);

    // View Mode State
    const [viewMode, setViewMode] = useState<'quizzes' | 'bank'>('quizzes');

    const [isEditing, setIsEditing] = useState(false);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

    // Đổi tên state này cho đúng ngữ cảnh (Form hiển thị thay vì Modal)
    const [showQuizForm, setShowQuizForm] = useState(false);

    // Quiz Type State
    const [quizType, setQuizType] = useState<'multiple-choice' | 'essay'>('multiple-choice');
    const [essayContent, setEssayContent] = useState('');
    const [essayFile, setEssayFile] = useState<File | null>(null);
    const [deadlineType, setDeadlineType] = useState<'strict' | 'none'>('strict'); // strict=deadline set, none=no deadline


    useEffect(() => {
        if (courseId) {
            loadQuizzes();
            loadChapters();
            loadTopics();
        }
    }, [courseId]);

    // Effect: Khi mở form thì cuộn lên đầu trang
    useEffect(() => {
        if (showQuizForm) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [showQuizForm]);

    const loadChapters = async () => {
        try {
            const data = await lecturerApi.getChaptersByCourse(courseId!);
            setChapters(data.map(c => ({ id: c.id, title: c.title })));
            if (data.length > 0 && !newQuiz.chapterId) {
                setNewQuiz(prev => ({ ...prev, chapterId: data[0].id }));
            }
        } catch (error) {
            console.error(error);
        }
    }

    const loadTopics = async () => {
        try {
            const data = await lecturerApi.getQuestionTopics();
            setBankTopics(data);
        } catch (e) { console.error(e); }
    }

    const loadBankQuestions = async (topicId: string) => {
        try {
            const data = await lecturerApi.getQuestionsByTopic(topicId);
            setBankQuestions(data);
        } catch (e) { console.error(e); }
    }

    useEffect(() => {
        if (selectedTopicId) {
            loadBankQuestions(selectedTopicId);
        }
    }, [selectedTopicId]);

    const loadQuizzes = async () => {
        try {
            setLoading(true);
            const data = await lecturerApi.getQuizzesByCourse(courseId!);
            setQuizzes(data);
        } catch (error) {
            console.error("Failed to load quizzes:", error);
            toast.error("Không thể tải danh sách bài kiểm tra");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveQuiz = async () => {
        if (!newQuiz.title.trim()) {
            toast.warning("Vui lòng nhập tên bài kiểm tra");
            return;
        }

        // Date Validation for Strict Deadline
        if (deadlineType === 'strict' && newQuiz.startDate && newQuiz.endDate) {
            const start = new Date(newQuiz.startDate);
            const end = new Date(newQuiz.endDate);
            const timeLimit = newQuiz.timeLimit || 0;

            if (start >= end) {
                toast.warning("Thời gian mở phải trước thời gian đóng");
                return;
            }

            // Only check time limit validity for multiple choice where time limit matters more
            if (quizType === 'multiple-choice') {
                const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                if (diffMinutes < timeLimit) {
                    toast.warning(`Khoảng thời gian mở phải lớn hơn thời gian làm bài`);
                    return;
                }
            }
        }

        try {
            let quizId = editingQuizId;

            const quizPayload = { ...newQuiz };

            // Adjust payload based on deadline type
            if (deadlineType === 'none') {
                quizPayload.endDate = undefined; // No deadline
            }

            if (isEditing && editingQuizId) {
                await lecturerApi.updateQuiz({ id: editingQuizId, ...quizPayload });
                toast.success("Cập nhật bài kiểm tra thành công");
            } else {
                const createdQuiz = await lecturerApi.createQuiz(quizPayload);
                quizId = createdQuiz.id;

                // Handle Essay Question Creation
                if (quizType === 'essay' && quizId) {
                    let mediaUrl = '';
                    if (essayFile) {
                        try {
                            // Assuming 'question-images' is a valid type logic for upload
                            mediaUrl = await lecturerApi.uploadFile(essayFile, 'question-images');
                        } catch (e) { console.error("File upload failed", e); }
                    }

                    // Use the first available topic or fail gracefully?
                    // Ideally prompts user to select topic, but for now defaulting to first topic to simplify UX as per request
                    const topicId = bankTopics.length > 0 ? bankTopics[0].id : '';

                    if (topicId) {
                        const question = await lecturerApi.createQuestion({
                            topicId: topicId,
                            contentText: essayContent || 'Bài tự luận',
                            mediaUrl: mediaUrl,
                            type: 2, // Essay Type
                            answers: [] // No answers for essay
                        });

                        await lecturerApi.addQuestionsToQuiz({
                            quizId: quizId,
                            questions: [{ questionId: question.id, points: newQuiz.totalPoints }]
                        });
                    } else {
                        toast.warning("Cảnh báo: Không thể tạo câu hỏi vì chưa có chủ đề nào trong ngân hàng.");
                    }
                }

                toast.success("Tạo bài kiểm tra thành công");
            }

            // Only add selected questions for Multiple Choice type
            if (quizType !== 'essay' && quizId && selectedQuestions.length > 0) {
                const questionsPayload = selectedQuestions.map(q => ({
                    questionId: q.id,
                    points: Math.floor(newQuiz.totalPoints / selectedQuestions.length)
                }));
                await lecturerApi.addQuestionsToQuiz({
                    quizId: quizId,
                    questions: questionsPayload
                });
            }

            setShowQuizForm(false); // Đóng form
            setShowBankModal(false); // Đóng modal bank nếu đang mở
            setIsEditing(false);
            setEditingQuizId(null);
            loadQuizzes();
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lưu bài kiểm tra");
        }
    };

    const handleEditQuiz = async (quiz: Quiz) => {
        try {
            setIsEditing(true);
            setEditingQuizId(quiz.id);

            // Determine Quiz Type
            if (quiz.isEssay) {
                setQuizType('essay');
                setDeadlineType(quiz.endDate ? 'strict' : 'none');
            } else {
                setQuizType('multiple-choice');
            }

            setNewQuiz({
                chapterId: quiz.chapterId,
                title: quiz.title,
                orderIndex: quiz.orderIndex,
                timeLimit: quiz.timeLimit || 0,
                totalPoints: quiz.totalPoints,
                passingScore: quiz.passingScore,
                isRandomQuestion: quiz.isRandomQuestion,
                shuffleAnswers: quiz.shuffleAnswers,
                showAnswersAfterClose: quiz.showAnswersAfterClose,
                maxAttempts: quiz.maxAttempts,
                startDate: quiz.startDate,
                endDate: quiz.endDate
            });

            const quizQuestions = await lecturerApi.getQuestionsByQuiz(quiz.id);
            const questions = quizQuestions.map(qq => qq.question!).filter(Boolean);

            // Populate Essay Content if Essay Type
            if (quiz.isEssay && questions.length > 0) {
                const q = questions[0];
                setEssayContent(q.contentText);
                // Note: File input can't be set programmatically due to security.
                // But we could show existing file link if we had UI for it.
                // For now, user has to re-upload if they want to change file.
            }

            setSelectedQuestions(questions);

            setShowQuizForm(true); // Mở form (sẽ trigger scroll top)
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin bài kiểm tra");
        }
    }

    const handleDeleteQuiz = async (quizId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) return;
        try {
            await lecturerApi.deleteQuiz(quizId);
            toast.success("Xóa thành công");
            loadQuizzes();
        } catch (e) {
            toast.error("Lỗi khi xóa");
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Chưa thiết lập";
        return new Date(dateString).toLocaleString("vi-VN");
    };

    const toggleQuestionSelection = (question: Question) => {
        if (selectedQuestions.find(q => q.id === question.id)) {
            setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id));
        } else {
            setSelectedQuestions([...selectedQuestions, question]);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="relative min-h-screen">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-3 sticky top-0 z-10 border-b">
                <Button
                    className={`gap-2 ${quizType === 'multiple-choice' && showQuizForm ? 'bg-blue-700 ring-2 ring-blue-300' : 'bg-blue-600 hover:bg-blue-700'} font-medium`}
                    onClick={() => {
                        setViewMode('quizzes');
                        setQuizType('multiple-choice');
                        setIsEditing(false);
                        setEditingQuizId(null);
                        setNewQuiz({
                            chapterId: chapters.length > 0 ? chapters[0].id : '',
                            title: '',
                            orderIndex: 0,
                            timeLimit: 30,
                            totalPoints: 10,
                            passingScore: 5,
                            isRandomQuestion: false,
                            shuffleAnswers: false,
                            showAnswersAfterClose: false,
                            maxAttempts: 1,
                            startDate: undefined,
                            endDate: undefined
                        });
                        setSelectedQuestions([]);
                        setShowQuizForm(true);
                    }}
                >
                    <Plus className="w-4 h-4" /> Tạo bài trắc nghiệm
                </Button>
                <Button
                    variant="outline"
                    className={`gap-2 ${quizType === 'essay' && showQuizForm ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                    onClick={() => {
                        setViewMode('quizzes');
                        setQuizType('essay');
                        setIsEditing(false);
                        setEditingQuizId(null);
                        setEssayContent('');
                        setEssayFile(null);
                        setDeadlineType('strict');
                        setNewQuiz({
                            chapterId: chapters.length > 0 ? chapters[0].id : '',
                            title: '',
                            orderIndex: 0,
                            timeLimit: 0,
                            totalPoints: 10,
                            passingScore: 5,
                            isRandomQuestion: false,
                            shuffleAnswers: false,
                            showAnswersAfterClose: false,
                            maxAttempts: 1,
                            startDate: undefined,
                            endDate: undefined
                        });
                        setShowQuizForm(true);
                    }}
                >
                    <Plus className="w-4 h-4" /> Tạo bài tự luận
                </Button>
                <Button
                    variant={viewMode === 'bank' ? 'default' : 'outline'}
                    className={`gap-2 ${viewMode === 'bank' ? 'bg-blue-600 hover:bg-blue-700 ' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                    onClick={() => setViewMode('bank')}
                >
                    <FileQuestion className="w-4 h-4" /> Ngân hàng câu hỏi
                </Button>
            </div>
            {/* --- VIEW: Manager Bank (Hiển thị QuestionBank khi ở chế độ bank) --- */}
            {viewMode === 'bank' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up min-h-[600px]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileQuestion className="w-5 h-5 text-blue-600" /> Ngân hàng câu hỏi
                        </h2>
                        {/* Nút đóng hoặc quay lại nếu cần, hiện tại dùng Toolbar để switch */}
                    </div>
                    <div className="p-2">
                        <QuestionBank />
                    </div>
                </div>
            )}

            {/* --- VIEW: Quizzes List & Form (Chỉ hiển thị khi viewMode === 'quizzes') --- */}
            {viewMode === 'quizzes' && (
                <>
                    {/* --- MODAL 2: Nested Bank Selection (Chọn câu hỏi cho bài quiz - Vẫn là Modal để đè lên Form) --- */}
                    {showBankModal && (
                        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-fade-in-up">
                                <div className="p-4 border-b flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Ngân hàng câu hỏi</h3>
                                    <button onClick={() => setShowBankModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 flex gap-4 border-b bg-gray-50">
                                    <div className="w-1/3">
                                        <label className="text-sm font-medium block mb-1">Chủ đề</label>
                                        <select
                                            className="w-full border rounded-lg px-3 py-2 bg-white"
                                            value={selectedTopicId}
                                            onChange={e => setSelectedTopicId(e.target.value)}
                                        >
                                            <option value="">-- Chọn chủ đề --</option>
                                            {bankTopics.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} ({t.totalQuestions})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {!selectedTopicId ? (
                                        <div className="text-center py-12 text-gray-500">Vui lòng chọn chủ đề để xem câu hỏi</div>
                                    ) : bankQuestions.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">Không có câu hỏi nào trong chủ đề này</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {bankQuestions.map(q => {
                                                const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                                                return (
                                                    <div
                                                        key={q.id}
                                                        className={`p-4 border rounded-lg flex gap-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                                                        onClick={() => toggleQuestionSelection(q)}
                                                    >
                                                        <div className={`mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                                                            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900 mb-1">{q.contentText}</div>
                                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{q.type}</span>
                                                                {q.answers.length} đáp án
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                                    <span className="text-sm text-gray-500 self-center mr-auto">
                                        Đã chọn {selectedQuestions.length} câu hỏi
                                    </span>
                                    <Button onClick={() => setShowBankModal(false)}>Đóng</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- FORM SECTION (Hiển thị ngay trên danh sách) --- */}
                    {showQuizForm && (
                        <div className="mb-8 bg-slate-50 border border-blue-200 rounded-xl shadow-lg overflow-hidden animate-fade-in-down">
                            <div className="bg-white p-4 border-b flex justify-between items-center">
                                <h2 className="text-xl font-bold text-blue-800">
                                    {isEditing ? "Chỉnh sửa " : "Tạo "}
                                    {quizType === 'essay' ? "bài tự luận" : "bài kiểm tra trắc nghiệm"}
                                </h2>
                                <div className="flex justify-end gap-3 pt-2 mb-5">
                                    <Button variant="outline" size="lg" onClick={() => {
                                        setShowQuizForm(false);
                                        setShowBankModal(false);
                                    }}>
                                        Hủy bỏ
                                    </Button>
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg" onClick={handleSaveQuiz}>
                                        <Save className="w-5 h-5" /> Lưu bài kiểm tra
                                    </Button>
                                </div>
                            </div>


                            <div className="p-6">
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-8">
                                    {/* Settings Column */}
                                    <div className="col-span-1 space-y-6">
                                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border">
                                            <h3 className="font-semibold text-lg border-b pb-2">Cấu hình chung</h3>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newQuiz.title}
                                                    onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                                    placeholder="Bài kiểm tra chương 1..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Chương</label>
                                                <select
                                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={newQuiz.chapterId}
                                                    onChange={e => setNewQuiz({ ...newQuiz, chapterId: e.target.value })}
                                                >
                                                    <option value="">Chọn chương...</option>
                                                    {chapters.map(c => (
                                                        <option key={c.id} value={c.id}>{c.title}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Thời gian (phút)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                        value={newQuiz.timeLimit}
                                                        onChange={e => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Số lần làm</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                        value={newQuiz.maxAttempts}
                                                        onChange={e => setNewQuiz({ ...newQuiz, maxAttempts: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Tổng điểm</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                        value={newQuiz.totalPoints}
                                                        onChange={e => setNewQuiz({ ...newQuiz, totalPoints: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Điểm đạt</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border rounded-lg px-3 py-2"
                                                        value={newQuiz.passingScore}
                                                        onChange={e => setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Thời gian mở</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full border rounded-lg px-3 py-2"
                                                    value={newQuiz.startDate ? new Date(newQuiz.startDate).toISOString().slice(0, 16) : ''}
                                                    onChange={e => setNewQuiz({ ...newQuiz, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Thời gian đóng</label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full border rounded-lg px-3 py-2"
                                                    value={newQuiz.endDate ? new Date(newQuiz.endDate).toISOString().slice(0, 16) : ''}
                                                    onChange={e => setNewQuiz({ ...newQuiz, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border">
                                            <h3 className="font-semibold text-lg border-b pb-2">Thiết lập nâng cao</h3>
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                        checked={newQuiz.isRandomQuestion}
                                                        onChange={e => setNewQuiz({ ...newQuiz, isRandomQuestion: e.target.checked })}
                                                    />
                                                    <span>Trộn câu hỏi (Shuffle Questions)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                        checked={newQuiz.shuffleAnswers}
                                                        onChange={e => setNewQuiz({ ...newQuiz, shuffleAnswers: e.target.checked })}
                                                    />
                                                    <span>Trộn đáp án (Shuffle Answers)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                        checked={newQuiz.showAnswersAfterClose}
                                                        onChange={e => setNewQuiz({ ...newQuiz, showAnswersAfterClose: e.target.checked })}
                                                    />
                                                    <span>Xem đáp án sau khi đóng</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Questions Column - Hide for Essay */}
                                    {quizType !== 'essay' && (
                                        <div className="col-span-1 lg:col-span-2 space-y-6">
                                            <div className="bg-white p-6 rounded-xl shadow-sm h-full flex flex-col border">
                                                <div className="flex justify-between items-center mb-4 border-b pb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">Danh sách câu hỏi</h3>
                                                        <p className="text-sm text-gray-500">Đã chọn: {selectedQuestions.length} câu</p>
                                                    </div>
                                                    <Button onClick={() => setShowBankModal(true)} className="bg-blue-600 hover:bg-blue-700">
                                                        <Plus className="w-4 h-4 mr-2" /> Chọn từ ngân hàng
                                                    </Button>
                                                </div>

                                                <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar bg-gray-50 rounded-lg p-2">
                                                    {selectedQuestions.length === 0 ? (
                                                        <div className="text-center py-24 text-gray-400">
                                                            <FileQuestion className="w-16 h-16 mx-auto mb-3 opacity-20" />
                                                            <p>Chưa có câu hỏi nào được chọn</p>
                                                            <Button variant="link" onClick={() => setShowBankModal(true)}>+ Thêm câu hỏi ngay</Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {selectedQuestions.map((q, idx) => (
                                                                <div key={q.id} className="p-4 bg-white border rounded-lg flex gap-3 relative group shadow-sm hover:shadow-md transition">
                                                                    <span className="font-bold text-gray-400 w-6">#{idx + 1}</span>
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-800 line-clamp-2">{q.contentText}</p>
                                                                        <div className="text-xs text-gray-500 mt-2 flex gap-2">
                                                                            <span className="bg-gray-100 px-2 py-1 rounded">Loại: {q.type}</span>
                                                                            <span className="bg-gray-100 px-2 py-1 rounded">Mức độ: {q.difficulty || 'Normal'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleQuestionSelection(q)}
                                                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                                                                        title="Xóa khỏi bài thi"
                                                                    >
                                                                        <Trash className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grid danh sách bài kiểm tra (Hiển thị bên dưới Form) */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${showQuizForm ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        {quizzes.length === 0 ? (
                            <div className="col-span-2 text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
                                <div className="mb-4">
                                    <FileQuestion className="w-12 h-12 mx-auto text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Chưa có bài kiểm tra nào</h3>
                                <p className="mt-1">Bắt đầu bằng cách bấm vào nút "Tạo bài trắc nghiệm" ở trên.</p>
                            </div>
                        ) : (
                            quizzes.map((quiz) => (
                                <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{quiz.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${quiz.isEssay ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {quiz.isEssay ? 'Tự luận' : 'Trắc nghiệm'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <button
                                                className="text-gray-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition"
                                                onClick={() => handleEditQuiz(quiz)}
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition"
                                                onClick={() => handleDeleteQuiz(quiz.id)}
                                                title="Xóa"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-grow">
                                        <div className="flex items-center text-sm text-gray-500 gap-2">
                                            <Calendar className="w-4 h-4 flex-shrink-0" />
                                            <span>Mở: {formatDate(quiz.startDate)}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 gap-2">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>Đóng: {formatDate(quiz.endDate)}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 gap-2">
                                            <FileText className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                {quiz.timeLimit ? `${quiz.timeLimit} phút` : "Không giới hạn"}
                                                {quiz.totalPoints ? ` • ${quiz.totalPoints} điểm` : ""}
                                            </span>
                                        </div>
                                        <div className="border-t border-gray-100 my-4 pt-4">
                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <span className="text-gray-500 block">Điểm đạt:</span>
                                                    <span className="font-semibold text-gray-900">{quiz.passingScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-auto">
                                        <Button className="flex-1 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50">Xem chi tiết</Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}


        </div>
    );
};