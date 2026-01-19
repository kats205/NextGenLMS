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
      // Gọi API thật
      const res: any = await axiosClient.post('/login', {
        email,
        password
      });

      // Lưu token và user info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // Giả lập user object từ response (BE chưa trả về full user info thì tạm dùng cái này hoặc decode token)
      // TODO: Cần BE trả về Role trong response login hoặc decode JWT
      // Tạm thời fix cứng logic dựa trên email demo để test router
      let role = 'student';
      if (email.includes('admin')) role = 'admin';
      if (email.includes('lecturer')) role = 'lecturer';

      const user = {
        email: email,
        fullName: res.data.fullName || "User",
        role: role
      };

      localStorage.setItem('user', JSON.stringify(user));

      toast.success(`Xin chào ${user.fullName}!`);

      // Điều hướng
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'lecturer') navigate('/lecturer/dashboard');
      else navigate('/student/dashboard');

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      toast.error('Đăng nhập thất bại!');
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
              <p>Admin: admin@university.edu.vn / admin123</p>
              <p>GV: lecturer@university.edu.vn / lecturer123</p>
              <p>SV: student@university.edu.vn / student123</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your.email@university.edu.vn"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Quên mật khẩu?
            </button>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <LogIn className="w-5 h-5" />
              Đăng nhập
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
