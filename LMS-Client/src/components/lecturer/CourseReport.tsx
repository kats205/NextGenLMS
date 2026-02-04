import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import { Button } from "../ui/button";
import { Download, FileText } from "lucide-react";

export const CourseReport = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            loadReport();
        }
    }, [courseId]);

    const loadReport = async () => {
        try {
            setLoading(true);
            const data = await lecturerApi.getCourseReport(courseId!);
            setReport(data);
        } catch (error) {
            console.error("Failed to load report:", error);
            toast.error("Không thể tải báo cáo");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12">Đang tải báo cáo...</div>;
    if (!report) return <div className="text-center py-12">Chưa có dữ liệu báo cáo</div>;

    const students = report.students || [];

    return (
        <div>
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex justify-between items-center">
                <div>
                    {/* Removed course filter dropdown as requested */}
                    <h2 className="text-lg font-semibold text-gray-800">{report.courseName}</h2>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                        <Download className="w-4 h-4" /> Xuất Excel
                    </Button>
                    <Button variant="outline" className="gap-2 bg-white text-gray-700 border-gray-200 hover:bg-gray-50">
                        <FileText className="w-4 h-4" /> Xuất PDF
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Tổng sinh viên</p>
                    <p className="text-3xl font-bold text-gray-900">{report.totalStudents}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Tiến độ trung bình</p>
                    <p className="text-3xl font-bold text-gray-900">{report.averageProgress}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Điểm TB trắc nghiệm</p>
                    <p className="text-3xl font-bold text-gray-900">{report.averageQuizScore}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm mb-2">Tỷ lệ tham gia</p>
                    <p className="text-3xl font-bold text-gray-900">{report.participationRate}%</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6">Báo cáo chi tiết sinh viên</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">SINH VIÊN</th>
                                <th className="px-6 py-3">TIẾN ĐỘ</th>
                                <th className="px-6 py-3">ĐTB TRẮC NGHIỆM</th>
                                <th className="px-6 py-3">ĐTB TỰ LUẬN</th>
                                <th className="px-6 py-3">THAM GIA</th>
                                <th className="px-6 py-3 text-right">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Chưa có sinh viên nào trong khóa học.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student: any) => (
                                    <tr key={student.studentId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{student.fullName}</div>
                                            <div className="text-gray-500 text-xs">{student.studentCode}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                                                    <div
                                                        className="bg-blue-600 h-1.5 rounded-full"
                                                        style={{ width: `${student.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{student.avgQuizScore}/10</td>
                                        <td className="px-6 py-4 text-gray-700">{student.avgAssignmentScore}/10</td>
                                        <td className="px-6 py-4 text-gray-700">{student.participationRate}%</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 hover:underline font-medium text-xs">Chi tiết</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
