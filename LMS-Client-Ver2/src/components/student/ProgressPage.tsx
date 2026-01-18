import { User } from '../../App';
import { Header } from '../shared/Header';
import { BookOpen, TrendingUp, ClipboardList, Award, CheckCircle2, Clock } from 'lucide-react';

interface ProgressPageProps {
  user: User;
  onNavigate: (page: string, courseId?: string) => void;
  onLogout: () => void;
}

export function ProgressPage({ user, onNavigate, onLogout }: ProgressPageProps) {
  // Mock progress data
  const progressData = {
    activeCourses: 3,
    completedLessons: 12,
    totalLessons: 24,
    completedAssessments: 5,
    totalAssessments: 9,
    averageScore: 8.5,
  };

  const courseProgress = [
    { id: 'c1', name: 'Lập trình căn bản', code: 'IT101', completion: 50, score: 9.0, lastActivity: '2 ngày trước' },
    { id: 'c2', name: 'Cấu trúc dữ liệu và Giải thuật', code: 'IT202', completion: 75, score: 8.5, lastActivity: '1 ngày trước' },
    { id: 'c3', name: 'Cơ sở dữ liệu', code: 'IT303', completion: 30, score: 8.0, lastActivity: '4 ngày trước' },
  ];

  const recentActivity = [
    { type: 'lesson', title: 'Hoàn thành bài 2.1: Biến trong Python', course: 'Lập trình căn bản', time: '2 giờ trước' },
    { type: 'assessment', title: 'Nộp bài kiểm tra giữa kỳ', course: 'Cấu trúc dữ liệu', score: 8.5, time: '1 ngày trước' },
    { type: 'lesson', title: 'Xem video hướng dẫn cài đặt Python', course: 'Lập trình căn bản', time: '2 ngày trước' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <BookOpen className="w-4 h-4" />
            Khóa học
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
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

        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Tiến độ học tập của tôi</h2>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">{progressData.activeCourses}</div>
            <div className="text-sm text-gray-600">Khóa học đang học</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">
              {progressData.completedLessons}/{progressData.totalLessons}
            </div>
            <div className="text-sm text-gray-600">Bài giảng hoàn thành</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-warning-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">
              {progressData.completedAssessments}/{progressData.totalAssessments}
            </div>
            <div className="text-sm text-gray-600">Bài kiểm tra đã làm</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">{progressData.averageScore}</div>
            <div className="text-sm text-gray-600">Điểm trung bình</div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-6">Tiến độ từng khóa học</h3>
          <div className="space-y-6">
            {courseProgress.map(course => (
              <div key={course.id} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{course.name}</h4>
                      <span className="text-xs font-medium px-2 py-1 bg-primary-50 text-primary-700 rounded border border-primary-200">
                        {course.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>Điểm: {course.score}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('course-player', course.id)}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Tiếp tục học
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Hoàn thành</span>
                    <span className="font-medium text-gray-900">{course.completion}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                      style={{ width: `${course.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'lesson' ? 'bg-primary-100' : 'bg-warning-100'
                }`}>
                  {activity.type === 'lesson' ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  ) : (
                    <ClipboardList className="w-5 h-5 text-warning-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                  <p className="text-sm text-gray-600">
                    {activity.course}
                    {activity.score && ` • Điểm: ${activity.score}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
