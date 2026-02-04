// src/components/lecturer/CourseDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import lecturerApi from '../../api/lecturerApi';
import type { Course } from './lecturer.types';

// Import các tab components
import ContentManagement from './ContentManagement';
import AssessmentManagement from './AssessmentManagement';
import StudentList from './StudentList';
import CourseReports from './CourseReports';
import QuestionBank from './QuestionBank';

type TabType = 'content' | 'assessments' | 'students' | 'reports' | 'questions';

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [activeTab, setActiveTab] = useState<TabType>('content');
    const [course, setCourse] = useState<Course | null>(null);
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

    if (loading) {
        return <div className="text-center py-12">Đang tải...</div>;
    }

    if (!course) {
        return <div className="text-center py-12">Không tìm thấy khóa học</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold">{course.name}</h1>
                    <p className="text-sm text-gray-600">{course.courseCode}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex space-x-8">
                        <TabButton
                            active={activeTab === 'content'}
                            onClick={() => setActiveTab('content')}
                            label="Quản lý nội dung"
                        />
                        <TabButton
                            active={activeTab === 'assessments'}
                            onClick={() => setActiveTab('assessments')}
                            label="Bài kiểm tra"
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
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'content' && <ContentManagement courseId={course.id} />}
                {activeTab === 'assessments' && <AssessmentManagement courseId={course.id} />}
                {activeTab === 'students' && <StudentList courseId={course.id} />}
                {activeTab === 'reports' && <CourseReports courseId={course.id} />}
            </div>
        </div>
    );
};

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`py-4 px-1 border-b-2 font-medium text-sm ${active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
    >
        {label}
    </button>
);

export default CourseDetailPage;