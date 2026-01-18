import { useState } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { ArrowLeft, Save, Calendar, Upload, Mail, Database } from 'lucide-react';

interface SystemConfigPageProps {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function SystemConfigPage({ user, onNavigate, onLogout }: SystemConfigPageProps) {
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState('HK1');
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('noreply@university.edu.vn');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In real app, would save to backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cấu hình hệ thống</h2>
          <p className="text-gray-600">Quản lý các thiết lập chung của hệ thống LMS</p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-sm text-success-700">Cấu hình đã được lưu thành công!</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Academic Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Năm học & Học kỳ</h3>
                <p className="text-sm text-gray-600">Cấu hình thời gian học</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học hiện tại
                </label>
                <input
                  id="academicYear"
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="2025-2026"
                />
              </div>

              <div>
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                  Học kỳ hiện tại
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="HK1">Học kỳ 1</option>
                  <option value="HK2">Học kỳ 2</option>
                  <option value="HK3">Học kỳ Hè</option>
                </select>
              </div>
            </div>
          </div>

          {/* Upload Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cài đặt Upload</h3>
                <p className="text-sm text-gray-600">Giới hạn kích thước và định dạng file</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước file tối đa (MB)
                </label>
                <input
                  id="maxFileSize"
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Định dạng file cho phép
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['PDF', 'Word', 'PowerPoint', 'Excel', 'Video (MP4)', 'Ảnh (PNG, JPG)', 'ZIP', 'RAR'].map((format) => (
                    <label key={format} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-gray-700">{format}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SMTP Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cấu hình Email (SMTP)</h3>
                <p className="text-sm text-gray-600">Thiết lập gửi email tự động</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  id="smtpHost"
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  id="smtpPort"
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="587"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 mb-2">
                  Email gửi
                </label>
                <input
                  id="smtpUser"
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="noreply@university.edu.vn"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu SMTP
                </label>
                <input
                  id="smtpPassword"
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Để sử dụng Gmail SMTP, bạn cần bật "App Password" trong cài đặt Google Account.
              </p>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-danger-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cơ sở dữ liệu</h3>
                <p className="text-sm text-gray-600">Quản lý và sao lưu dữ liệu</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Sao lưu tự động</p>
                  <p className="text-sm text-gray-600">Tự động sao lưu mỗi ngày lúc 2:00 AM</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Database className="w-4 h-4" />
                Sao lưu ngay
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              <Save className="w-5 h-5" />
              Lưu cấu hình
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
