import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { HashLoader } from 'react-spinners';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // res là AxiosResponse, res.data mới là ApiResponse
      const response = await axiosClient.post('/api/auth/login', { email, password });

      // Lấy data từ response.data (ApiResponse)
      const apiResponse = response.data;

      if (apiResponse.success) {
        const { token, refreshToken, fullName, role, userId } = apiResponse.data;

        // Lưu token và user info
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);

        const user = {
          userId,
          email,
          fullName,
          role: role?.toLowerCase() || 'student'
        };
        localStorage.setItem('user', JSON.stringify(user));

        toast.success(`Xin chào ${fullName}!`);

        // Điều hướng theo role
        const roleLower = user.role;
        const roleMap: Record<string, string> = {
          'admin': '/admin/dashboard',
          'lecturer': '/lecturer/dashboard',
          'student': '/student/dashboard'
        };

        const redirectUrl = roleMap[roleLower] || '/student/dashboard';
        navigate(redirectUrl);
      } else {
        // Trường hợp success = false
        setError(apiResponse.message || 'Đăng nhập thất bại');
        toast.error(apiResponse.message || 'Đăng nhập thất bại!');
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">LMS</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
            <p className="text-gray-600 text-sm">Hệ thống quản lý học tập trực tuyến</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="email@university.edu.vn"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Demo accounts toggle button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showDemo ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showDemo ? 'Ẩn tài khoản demo' : 'Xem tài khoản demo'}
            </button>

            {/* Demo accounts info - Collapsible */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${showDemo ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-sm space-y-2 border border-blue-100">
                <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Tài khoản demo:
                </p>
                <div className="space-y-1.5">
                  <p className="text-gray-700">
                    <span className="font-medium">Admin:</span> admintest@gmail.com / 123456
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Sinh viên:</span> sv01test@gmail.com / 123456
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Giảng viên:</span> gv01test@gmail.com / 123456
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            © 2026 NextGenLMS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Loading Overlay Popup - Outside main container */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-6 max-w-sm mx-4 animate-fadeIn">
            {/* HashLoader from react-spinners */}
            <HashLoader
              color="#2563eb"
              size={60}
              speedMultiplier={1.2}
            />

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                Đang đăng nhập...
              </h3>
              <p className="text-gray-500 text-sm">
                Vui lòng chờ trong giây lát
              </p>
            </div>

            {/* Progress dots animation */}
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}