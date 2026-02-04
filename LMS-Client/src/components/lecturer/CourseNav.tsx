import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowLeft, BookOpen, ClipboardCheck, FileText, BarChart3 } from "lucide-react";

interface CourseNavProps {
    courseName?: string;
}

export function CourseNav({ courseName }: CourseNavProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { courseId } = useParams();

    const basePath = `/lecturer/courses/${courseId}`;

    const tabs = [
        { id: "content", label: "Quản lý nội dung", icon: BookOpen, path: basePath },
        { id: "quizzes", label: "Bài kiểm tra", icon: ClipboardCheck, path: `${basePath}/quizzes` },
        { id: "grading", label: "Chấm bài", icon: FileText, path: `${basePath}/grading` },
        { id: "report", label: "Báo cáo lớp", icon: BarChart3, path: `${basePath}/report` },
    ];

    const isActive = (path: string) => {
        if (path === basePath) {
            return location.pathname === basePath || location.pathname === `${basePath}/`;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="mb-6">
            {/* Back to Dashboard */}
            <div className="flex items-center gap-4 mb-4">
                <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-blue-600"
                    onClick={() => navigate("/lecturer/dashboard")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Khóa học của tôi
                </Button>
                {courseName && (
                    <span className="text-gray-400">|</span>
                )}
                {courseName && (
                    <span className="font-medium text-gray-900">{courseName}</span>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab.path);
                    return (
                        <Button
                            key={tab.id}
                            variant={active ? "default" : "ghost"}
                            className={active
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            }
                            onClick={() => navigate(tab.path)}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
