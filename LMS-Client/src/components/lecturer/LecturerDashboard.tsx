import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface LecturerDashboardProps {
  user: User;
}

export function LecturerDashboard({ user }: LecturerDashboardProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Gọi API thật khi Backend có endpoint
        const res = await axiosClient.get('/v1/api/lecturer/courses');
        setCourses(res.data);
      } catch (error) {
        console.error("Failed to fetch lecturer courses:", error);
        // Fallback Data
        setCourses([
          { id: '1', name: 'Lập trình .NET nâng cao (Fallback)', code: 'NET102', academicYear: '2025-2026', semester: 'HK1', studentCount: 45 },
          { id: '2', name: 'Đồ án tốt nghiệp', code: 'DATN', academicYear: '2025-2026', semester: 'HK1', studentCount: 5 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const myCourses = courses;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Khóa học của tôi</h2>
          <p className="text-gray-600">Quản lý các khóa học bạn đang giảng dạy</p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map(course => (
            <button
              key={course.id}
              onClick={() => navigate(`/lecturer/courses/${course.id}`)}
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

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{course.studentCount} sinh viên</span>
              </div>
            </button>
          ))}
        </div>

        {myCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Bạn chưa có khóa học nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
