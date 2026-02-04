import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // res là AxiosResponse, res.data mới là ApiResponse<T>
      const response = await axiosClient.post('/api/auth/login', {
        email,
        password
      });

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
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center">
              <span className="font-bold text-white text-2xl">LMS</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            Đăng nhập
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Hệ thống quản lý học tập trực tuyến
          </p>

          {/* Demo accounts info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Tài khoản demo:</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p>Admin: admintest@gmail.com / 123456</p>
              <p>SV: sv01test@gmail.com / 123456</p>
              <p>GV: gv01test@gmail.com / 123456</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <div className="flex justify-between mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2026 Trường Đại học. All rights reserved.
        </p>
      </div>
    </div>
  );
}