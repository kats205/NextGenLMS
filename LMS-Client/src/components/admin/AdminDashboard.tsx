import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { Users, BookOpen, Activity, TrendingUp, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import axiosClient from '../../api/axiosClient';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLecturers: 0,
    totalStudents: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalPageViews: 0,
    avgSessionTime: '0 phút',
  });

  const recentActivity = [
    { type: 'user', action: 'Thêm 5 sinh viên mới', time: '10 phút trước' },
    { type: 'course', action: 'Tạo khóa học "Web Development"', time: '1 giờ trước' },
    { type: 'system', action: 'Cập nhật hệ thống v2.1', time: '2 giờ trước' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Call API here when backend is ready
        // const res = await axiosClient.get('/v1/api/admin/stats');
        // setStats(res.data);

        // Mock data
        setStats({
          totalUsers: 342,
          totalLecturers: 45,
          totalStudents: 289,
          totalCourses: 78,
          activeCourses: 52,
          totalPageViews: 15240,
          avgSessionTime: '28 phút',
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quản trị hệ thống</h2>
          <p className="text-gray-600">Tổng quan và quản lý toàn bộ hệ thống LMS</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left"
          >
            <Users className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Quản lý người dùng</h3>
            <p className="text-sm text-gray-600">Quản lý tài khoản, phân quyền</p>
          </button>

          <button
            onClick={() => navigate('/admin/system')}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left"
          >
            <Settings className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Cấu hình hệ thống</h3>
            <p className="text-sm text-gray-600">Cài đặt năm học, học kỳ, SMTP</p>
          </button>

          <button
            onClick={() => navigate('/admin/courses')}
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-left">
            <BookOpen className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Quản lý khóa học</h3>
            <p className="text-sm text-gray-600">Xem và quản lý khóa học</p>
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Tổng người dùng</div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>GV: {stats.totalLecturers}</span>
              <span>SV: {stats.totalStudents}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-success-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">Tổng khóa học</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs text-success-600 font-medium">{stats.activeCourses} đang hoạt động</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-warning-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">{stats.totalPageViews.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Lượt truy cập</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-3 h-3 text-success-600" />
              <span className="text-xs text-success-600 font-medium">+12% so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">{stats.avgSessionTime}</div>
            <div className="text-sm text-gray-600">Thời gian trung bình</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'user' ? 'bg-primary-100' :
                  activity.type === 'course' ? 'bg-success-100' : 'bg-warning-100'
                  }`}>
                  {activity.type === 'user' && <Users className="w-5 h-5 text-primary-600" />}
                  {activity.type === 'course' && <BookOpen className="w-5 h-5 text-success-600" />}
                  {activity.type === 'system' && <Settings className="w-5 h-5 text-warning-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
