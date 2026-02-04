import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, FileText, Calendar, Clock, Edit, FileQuestion } from "lucide-react";
import { Button } from "../ui/button";
import lecturerApi from "../../api/lecturerApi";
import type { Quiz } from "./lecturer.types";
import { toast } from "react-toastify";

export const CourseQuizzes = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            loadQuizzes();
        }
    }, [courseId]);

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

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Chưa thiết lập";
        return new Date(dateString).toLocaleString("vi-VN");
    };

    if (loading) {
        return <div className="text-center py-12">Đang tải dữ liệu...</div>;
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-3">
                <button
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors shadow-sm"
                    onClick={() => toast.info("Tính năng tạo bài trắc nghiệm đang phát triển")}
                >
                    <Plus className="w-4 h-4" /> Tạo bài trắc nghiệm
                </button>
                <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200">
                    <Plus className="w-4 h-4" /> Tạo bài tự luận
                </Button>
                <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200">
                    <FileQuestion className="w-4 h-4" /> Ngân hàng câu hỏi
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{quiz.title}</h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium inline-block bg-blue-50 text-blue-600">
                                        Trắc nghiệm
                                    </span>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition">
                                    <Edit className="w-4 h-4" />
                                </button>
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
                                        {/* quiz.totalQuestions n/a in list view yet? */}
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
                                        <div className="text-right ml-auto">
                                            <span className="text-gray-500 block">Số lần làm lại:</span>
                                            <span className="font-semibold text-gray-900">{quiz.maxAttempts > 0 ? quiz.maxAttempts : "Không giới hạn"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-3 mt-auto">
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Xem chi tiết</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
