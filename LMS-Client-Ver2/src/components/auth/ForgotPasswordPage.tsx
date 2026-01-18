import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, would call API
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            Quên mật khẩu
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>

          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-sm text-success-700">
                  Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.
                </p>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Quay lại đăng nhập
              </button>
            </div>
          ) : (
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

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Gửi link đặt lại mật khẩu
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full text-gray-600 py-2 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
