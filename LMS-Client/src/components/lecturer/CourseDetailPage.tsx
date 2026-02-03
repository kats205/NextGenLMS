import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { Course } from './lecturer.types';
import { ContentManagement } from './ContentManagement';
import { AssessmentManagement } from './AssessmentManagement';
import { QuestionBank } from './QuestionBank';
import { StudentList } from './StudentList';
import { CourseReports } from './CourseReports';

type TabType = 'content' | 'assessments' | 'questions' | 'students' | 'reports';

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('content');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const loadCourse = async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const data = await lecturerApi.getCourseById(courseId);
            setCourse(data);
        } catch (error: any) {
            console.error('Failed to load course:', error);
            toast.error('Không thể tải thông tin khóa học');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/lecturer/dashboard');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Không tìm thấy khóa học</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            ← Quay lại
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-gray-900">{course.name}</h1>
                            <p className="text-sm text-gray-600">
                                {course.courseCode} • {course.semesterName}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>👥 {course.totalStudents} sinh viên</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <TabButton
                            active={activeTab === 'content'}
                            onClick={() => setActiveTab('content')}
                            label="Khóa học của tôi"
                        />
                        <TabButton
                            active={activeTab === 'assessments'}
                            onClick={() => setActiveTab('assessments')}
                            label="Bài kiểm tra"
                        />
                        <TabButton
                            active={activeTab === 'questions'}
                            onClick={() => setActiveTab('questions')}
                            label="Ngân hàng câu hỏi"
                        />
                        <TabButton
                            active={activeTab === 'students'}
                            onClick={() => setActiveTab('students')}
                            label="Chấm bài"
                        />
                        <TabButton
                            active={activeTab === 'reports'}
                            onClick={() => setActiveTab('reports')}
                            label="Báo cáo lớp"
                        />
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'content' && <ContentManagement courseId={course.id} />}
                {activeTab === 'assessments' && <AssessmentManagement courseId={course.id} />}
                {activeTab === 'questions' && <QuestionBank courseId={course.id} />}
                {activeTab === 'students' && <StudentList courseId={course.id} />}
                {activeTab === 'reports' && <CourseReports courseId={course.id} />}
            </main>
        </div>
    );
};

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label }) => {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
        >
            {label}
        </button>
    );
};

export default CourseDetailPage;