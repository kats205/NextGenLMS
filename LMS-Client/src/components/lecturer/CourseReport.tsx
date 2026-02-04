import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import lecturerApi from "../../api/lecturerApi";
import { Button } from "../ui/button";
import { Download, FileText, X, CheckCircle, Circle, Clock } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const CourseReport = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any>(null); // State for selected student detail
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

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

    // Helper to remove accents for PDF
    const convertViToEn = (str: string) => {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("BAO CAO LOP HOC", 14, 22);

        doc.setFontSize(11);
        doc.text(`Khoa hoc: ${convertViToEn(report.courseName)}`, 14, 32);
        doc.text(`Ma khoa hoc: ${report.courseCode}`, 14, 38);
        doc.text(`Ngay xuat: ${new Date().toLocaleDateString()}`, 14, 44);

        // Stats Summary
        doc.text(`Tong sinh vien: ${report.totalStudents}`, 14, 54);
        doc.text(`Tien do TB: ${report.averageProgress}%`, 70, 54);
        doc.text(`Diem Quiz TB: ${report.averageQuizScore}`, 120, 54);

        // Table
        const tableColumn = ["STT", "Ten Sinh Vien", "MSSV", "Tien Do", "Diem Quiz", "Tham Gia"];
        const tableRows: any[] = [];

        students.forEach((student: any, index: number) => {
            const rowData = [
                index + 1,
                convertViToEn(student.fullName),
                student.studentCode,
                `${student.progress}%`,
                `${student.avgQuizScore}/10`,
                `${student.participationRate}%`
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`BaoCao_${report.courseCode}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleViewDetail = async (student: any) => {
        setSelectedStudent(student); // Set basic info first
        setShowDetailModal(true);
        setLoadingDetail(true);

        try {
            if (courseId) {
                const detail = await lecturerApi.getStudentDetail(courseId, student.studentId || student.id);
                setSelectedStudent(detail); // Update with full detail
            }
        } catch (error) {
            console.error("Failed to load student detail:", error);
            toast.error("Không thể tải chi tiết sinh viên");
        } finally {
            setLoadingDetail(false);
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
                    <Button
                        variant="outline"
                        className="gap-2 bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        onClick={handleExportPDF}
                    >
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
                                            <button
                                                className="text-blue-600 hover:underline font-medium text-xs"
                                                onClick={() => handleViewDetail(student)}
                                            >
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Student Detail Modal */}
            {showDetailModal && selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.fullName}</h3>
                                <p className="text-gray-500 text-sm mt-1">MSSV: {selectedStudent.studentCode}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <p className="text-blue-600 text-sm font-medium mb-1">Tiến độ chung</p>
                                    <p className="text-2xl font-bold text-blue-700">{selectedStudent.progress}%</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg text-center">
                                    <p className="text-orange-600 text-sm font-medium mb-1">ĐTB Trắc nghiệm</p>
                                    <p className="text-2xl font-bold text-orange-700">{selectedStudent.avgQuizScore}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <p className="text-green-600 text-sm font-medium mb-1">Tỷ lệ tham gia</p>
                                    <p className="text-2xl font-bold text-green-700">{selectedStudent.participationRate}%</p>
                                </div>
                            </div>

                            {/* Detailed Content */}
                            {loadingDetail ? (
                                <div className="text-center py-12">Đang tải chi tiết...</div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Lessons Progress */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            Chi tiết bài học
                                        </h4>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Bài học</th>
                                                        <th className="px-4 py-3 text-center">Trạng thái</th>
                                                        <th className="px-4 py-3 text-right">Ngày học</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {selectedStudent.lessons && selectedStudent.lessons.length > 0 ? (
                                                        selectedStudent.lessons.map((lesson: any) => (
                                                            <tr key={lesson.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-gray-700">
                                                                    <div className="font-medium">{lesson.title}</div>
                                                                    <div className="text-xs text-gray-500">{lesson.chapterTitle}</div>
                                                                </td>
                                                                <td className="px-4 py-3 flex justify-center">
                                                                    {lesson.isCompleted ? (
                                                                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium px-2 py-1 bg-green-50 rounded-full">
                                                                            <CheckCircle className="w-3 h-3" /> Hoàn thành
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-gray-400 text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">
                                                                            <Circle className="w-3 h-3" /> Chưa học
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                                    {lesson.lastAccess ? new Date(lesson.lastAccess).toLocaleDateString() : "-"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-4 py-3 text-center text-gray-500">Chưa có bài học nào trong khóa học</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Quizzes Results */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-orange-500" />
                                            Kết quả kiểm tra
                                        </h4>
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">Bài kiểm tra</th>
                                                        <th className="px-4 py-3 text-center">Điểm số</th>
                                                        <th className="px-4 py-3 text-right">Ngày làm</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {selectedStudent.quizzes && selectedStudent.quizzes.length > 0 ? (
                                                        selectedStudent.quizzes.map((quiz: any) => (
                                                            <tr key={quiz.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-gray-700">{quiz.title}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {quiz.score !== null ? (
                                                                        <span className={`font-bold ${quiz.score >= 5 ? 'text-green-600' : 'text-red-500'}`}>
                                                                            {quiz.score}/{quiz.maxScore}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-xs">Chưa làm</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                                    {quiz.submittedAt ? new Date(quiz.submittedAt).toLocaleDateString() : "-"}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="px-4 py-3 text-center text-gray-500">Chưa có bài kiểm tra nào</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
