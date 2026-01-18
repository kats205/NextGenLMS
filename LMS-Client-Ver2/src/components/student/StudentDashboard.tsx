import { useState } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { mockCourses } from '../../data/mockData';
import { Search, BookOpen, Clock, TrendingUp, ClipboardList } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onNavigate: (page: string, courseId?: string) => void;
  onLogout: () => void;
}

export function StudentDashboard({ user, onNavigate, onLogout }: StudentDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter courses based on search
  const filteredCourses = mockCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Menu */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            <BookOpen className="w-4 h-4" />
            Khóa học
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <TrendingUp className="w-4 h-4" />
            Tiến độ
          </button>
          <button
            onClick={() => onNavigate('assessment-list')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <ClipboardList className="w-4 h-4" />
            Bài kiểm tra
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Courses List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Khóa học của tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <button
                key={course.id}
                onClick={() => onNavigate('course-player', course.id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-left border border-gray-200 hover:border-primary-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                    {course.code}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.name}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {course.academicYear} - {course.semester}
                </p>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tiến độ</span>
                    <span className="font-medium text-gray-900">50%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Cập nhật 2 ngày trước</span>
                </div>
              </button>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy khóa học nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
