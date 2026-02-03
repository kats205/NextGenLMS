import { useState } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { Search, BookOpen, Clock, TrendingUp, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentCourses } from '../../hooks/useCourse';

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { courses, loading, error } = useStudentCourses();

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Đang tải danh sách khóa học...</div>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Thử lại
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Menu */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            <BookOpen className="w-4 h-4" />
            Khóa học
          </button>
          <button
            onClick={() => navigate('/student/progress')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <TrendingUp className="w-4 h-4" />
            Tiến độ
          </button>
          <button
            onClick={() => navigate('/student/assessments')}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Khóa học của tôi</h2>
            <span className="text-sm text-gray-500">
              {filteredCourses.length} khóa học
            </span>
          </div>
          
          {error && courses.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ {error} (Hiển thị dữ liệu có sẵn)
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <button
                key={course.id}
                onClick={() => navigate(`/student/courses/${course.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 text-left border border-gray-200 hover:border-primary-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img 
                        src={course.thumbnailUrl} 
                        alt={course.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                    {course.courseCode}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.name}
                </h3>

                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-600">
                    {course.academicYearName} - {course.semesterName}
                  </p>
                  {course.lecturerName && (
                    <p className="text-sm text-gray-500">
                      GV: {course.lecturerName}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{course.studentCount} sinh viên</span>
                    <span>{course.chapterCount} chương</span>
                  </div>
                </div>

                {/* Progress bar - TODO: Get real progress from API */}
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
                  <span>
                    Tạo {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Không tìm thấy khóa học nào phù hợp' : 'Bạn chưa đăng ký khóa học nào'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}