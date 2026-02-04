import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import type { QuizSubmission } from "./lecturer.types";
import { Button } from "../ui/button";



export const CourseGrading = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        if (courseId) {
            loadSubmissions();
        }
    }, [courseId]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const data = await lecturerApi.getSubmissionsByCourse(courseId!);
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to load submissions:", error);
            toast.error("Không thể tải danh sách bài nộp");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("vi-VN", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string, score?: number) => {
        if (status === "Graded") {
            return (
                <div className="flex flex-col items-start gap-1">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Đã chấm
                    </span>
                    <span className="text-sm font-semibold text-gray-700">Điểm: {score}/10</span>
                </div>
            );
        }
        return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Chờ chấm
            </span>
        );
    };

    const filteredSubmissions = submissions.filter(s => {
        if (statusFilter === "ALL") return true;
        return s.status === statusFilter; // "Submitted" | "Graded"
    });

    if (loading) return <div className="text-center py-12">Đang tải dữ liệu...</div>;

    return (
        <div>
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
                <select
                    className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="Submitted">Chờ chấm</option>
                    <option value="Graded">Đã chấm</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">SINH VIÊN</th>
                            <th className="px-6 py-4">BÀI KIỂM TRA</th>
                            <th className="px-6 py-4">THỜI GIAN NỘP</th>
                            <th className="px-6 py-4">TRẠNG THÁI</th>
                            <th className="px-6 py-4 text-right">THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSubmissions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <p className="text-base font-medium text-gray-900 mb-1">Không có bài nộp nào</p>
                                        <p className="text-sm text-gray-500">Chưa có sinh viên nào nộp bài hoặc không khớp với bộ lọc.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredSubmissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{sub.studentName}</div>
                                        <div className="text-gray-500 text-xs mt-0.5">{sub.studentCode || sub.studentEmail}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{sub.quizTitle}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {formatDate(sub.endTime)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(sub.status, sub.score)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium h-auto py-1 px-3"
                                            onClick={() => {
                                                toast.info(`Chấm bài (feature coming soon): ${sub.studentName}`);
                                            }}
                                        >
                                            {sub.status === "Graded" ? "Xem lại" : "Chấm bài"}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
