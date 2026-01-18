import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { Search, BookOpen, Clock, TrendingUp, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]); // TODO: Define Course Interface
  const [loading, setLoading] = useState(true);

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Gọi API thật: Backend cần endpoint này
        // Tạm thời gọi endpoint test 'GET /v1/api/courses' hoặc tương tự
        // Nếu chưa có API course, nó sẽ 404, ta sẽ handle catch

        // NOTE: Hiện tại backend chưa có API trả về list course
        // Nên tôi sẽ comment lại dòng gọi API và dùng 'fake data' tạm thời trong useEffect này
        // Khi backend sẵn sàng, chỉ cần uncomment

        const res = await axiosClient.get('/v1/api/courses'); // Giả định endpoint
        setCourses(res.data);

        // MOCK TẠM THỜI ĐỂ UI KHÔNG BỊ TRẮNG (XÓA KHI CÓ API)
        /*
        setCourses([
            { id: '1', name: 'Lập trình .NET nâng cao', code: 'NET102', academicYear: '2025-2026', semester: 'HK1' },
            { id: '2', name: 'Cấu trúc dữ liệu & Giải thuật', code: 'DSA101', academicYear: '2025-2026', semester: 'HK1' }
        ]);
        */

      } catch (error) {
        console.error("Failed to fetch courses:", error);
        // Fallback mock nếu lỗi connection để bạn vẫn test được UI
        setCourses([
          { id: '1', name: 'Lập trình .NET nâng cao (Fallback Data)', code: 'NET102', academicYear: '2025-2026', semester: 'HK1' },
          { id: '2', name: 'Cấu trúc dữ liệu & Giải thuật', code: 'DSA101', academicYear: '2025-2026', semester: 'HK1' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Khóa học của tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <button
                key={course.id}
                onClick={() => navigate(`/student/courses/${course.id}`)}
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
