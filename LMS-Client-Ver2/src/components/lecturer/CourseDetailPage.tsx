import { useState } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { mockCourses } from '../../data/mockData';
import { ArrowLeft, FileText, HelpCircle, ClipboardList, Users, BarChart3 } from 'lucide-react';
import { ContentManagement } from './ContentManagement';
import { QuestionBank } from './QuestionBank';
import { AssessmentManagement } from './AssessmentManagement';
import { StudentList } from './StudentList';
import { CourseReports } from './CourseReports';

interface CourseDetailPageProps {
  user: User;
  courseId: string;
  onNavigate: (page: string, courseId?: string) => void;
  onLogout: () => void;
}

type Tab = 'content' | 'questions' | 'assessments' | 'students' | 'reports';

export function CourseDetailPage({ user, courseId, onNavigate, onLogout }: CourseDetailPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const course = mockCourses.find(c => c.id === courseId);

  if (!course) {
    return <div>Course not found</div>;
  }

  const tabs = [
    { id: 'content' as Tab, label: 'Nội dung', icon: FileText },
    { id: 'questions' as Tab, label: 'Ngân hàng câu hỏi', icon: HelpCircle },
    { id: 'assessments' as Tab, label: 'Bài kiểm tra', icon: ClipboardList },
    { id: 'students' as Tab, label: 'Sinh viên', icon: Users },
    { id: 'reports' as Tab, label: 'Báo cáo', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button and course header */}
        <button
          onClick={() => onNavigate('lecturer-dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách khóa học
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
                <span className="text-sm font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                  {course.code}
                </span>
              </div>
              <p className="text-gray-600">
                {course.academicYear} - {course.semester} • {course.studentCount} sinh viên
              </p>
              {course.description && (
                <p className="text-sm text-gray-500 mt-2">{course.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'content' && <ContentManagement courseId={courseId} />}
            {activeTab === 'questions' && <QuestionBank courseId={courseId} />}
            {activeTab === 'assessments' && <AssessmentManagement courseId={courseId} />}
            {activeTab === 'students' && <StudentList courseId={courseId} />}
            {activeTab === 'reports' && <CourseReports courseId={courseId} />}
          </div>
        </div>
      </main>
    </div>
  );
}
