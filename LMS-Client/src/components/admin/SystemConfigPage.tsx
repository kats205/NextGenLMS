// src/components/admin/SystemConfigPage.tsx
import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { ArrowLeft, Calendar, Upload, Mail, Database, Save, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getSystemConfigs,
  updateSystemConfigs,
  backupNow,
  testEmailConfig,
  SystemConfigResponse,
  SystemConfigUpdateRequest
} from '@/api/systemConfig';
import { toast } from 'react-toastify';

interface SystemConfigPageProps {
  user: User;
}

export function SystemConfigPage({ user }: SystemConfigPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<SystemConfigResponse>({
    academicYear: {
      currentAcademicYear: '',
      currentSemester: ''
    },
    fileUpload: {
      maxFileSizeMB: 10,
      allowedFileTypes: []
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      emailSender: '',
      smtpPassword: '',
      enableSsl: true
    },
    backup: {
      autoBackupEnabled: false,
      backupTime: '02:00'
    }
  });

  const fileTypes = [
    { id: 'pdf', label: 'PDF' },
    { id: 'word', label: 'Word' },
    { id: 'powerpoint', label: 'PowerPoint' },
    { id: 'excel', label: 'Excel' },
    { id: 'video', label: 'Video (MP4)' },
    { id: 'image', label: 'Ảnh (PNG, JPG)' },
    { id: 'zip', label: 'ZIP' },
    { id: 'rar', label: 'RAR' }
  ];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await getSystemConfigs();
      setConfig(data);
    } catch (error: any) {
      console.error('Error loading configs:', error);
      toast.error(error.response?.data?.message || 'Không thể tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const request: SystemConfigUpdateRequest = {
        academicYear: config.academicYear,
        fileUpload: config.fileUpload,
        email: config.email,
        backup: config.backup
      };

      await updateSystemConfigs(request);
      toast.success('Lưu cấu hình thành công!');
    } catch (error: any) {
      console.error('Error saving configs:', error);
      toast.error(error.response?.data?.message || 'Lưu cấu hình thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      const fileName = await backupNow();
      toast.success(`Sao lưu thành công! File: ${fileName}`);
    } catch (error: any) {
      console.error('Error backup:', error);
      toast.error(error.response?.data?.message || 'Sao lưu thất bại');
    }
  };

  const handleTestEmail = async () => {
    try {
      await testEmailConfig();
      toast.success('Cấu hình email hợp lệ!');
    } catch (error: any) {
      console.error('Error testing email:', error);
      toast.error(error.response?.data?.message || 'Không thể kết nối với SMTP server');
    }
  };

  const toggleFileType = (type: string) => {
    const types = config.fileUpload.allowedFileTypes;
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    
    setConfig({
      ...config,
      fileUpload: { ...config.fileUpload, allowedFileTypes: newTypes }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải cấu hình...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Cấu hình hệ thống</h2>
          <p className="text-gray-600">Quản lý các thiết lập chung của hệ thống LMS</p>
        </div>

        <div className="space-y-6">
          {/* Academic Year & Semester */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Năm học & Học kỳ</h3>
                <p className="text-sm text-gray-500">Cấu hình thời gian học</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Năm học hiện tại
                </label>
                <input
                  type="text"
                  value={config.academicYear.currentAcademicYear}
                  onChange={(e) => setConfig({
                    ...config,
                    academicYear: { ...config.academicYear, currentAcademicYear: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="2025-2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Học kỳ hiện tại
                </label>
                <select
                  value={config.academicYear.currentSemester}
                  onChange={(e) => setConfig({
                    ...config,
                    academicYear: { ...config.academicYear, currentSemester: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Học kỳ 1">Học kỳ 1</option>
                  <option value="Học kỳ 2">Học kỳ 2</option>
                  <option value="Học kỳ 3">Học kỳ 3</option>
                  <option value="Học kỳ hè">Học kỳ hè</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cài đặt Upload</h3>
                <p className="text-sm text-gray-500">Giới hạn kích thước và định dạng file</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kích thước file tối đa (MB)
              </label>
              <input
                type="number"
                value={config.fileUpload.maxFileSizeMB}
                onChange={(e) => setConfig({
                  ...config,
                  fileUpload: { ...config.fileUpload, maxFileSizeMB: parseInt(e.target.value) || 10 }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Định dạng file cho phép
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {fileTypes.map(type => (
                  <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.fileUpload.allowedFileTypes.includes(type.label)}
                      onChange={() => toggleFileType(type.label)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cấu hình Email (SMTP)</h3>
                <p className="text-sm text-gray-500">Thiết lập gửi email tự động</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={config.email.smtpHost}
                  onChange={(e) => setConfig({
                    ...config,
                    email: { ...config.email, smtpHost: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={config.email.smtpPort}
                  onChange={(e) => setConfig({
                    ...config,
                    email: { ...config.email, smtpPort: parseInt(e.target.value) || 587 }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email gửi
                </label>
                <input
                  type="email"
                  value={config.email.emailSender}
                  onChange={(e) => setConfig({
                    ...config,
                    email: { ...config.email, emailSender: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="noreply@university.edu.vn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu SMTP
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.email.smtpPassword}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { ...config.email, smtpPassword: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                    placeholder="••••••••"
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
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Để sử dụng Gmail SMTP, bạn cần bật "App Password" trong cài đặt Google Account.
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={handleTestEmail}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Test cấu hình Email
              </button>
            </div>
          </div>

          {/* Backup Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cơ sở dữ liệu</h3>
                <p className="text-sm text-gray-500">Quản lý và sao lưu dữ liệu</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <p className="font-medium text-gray-900">Sao lưu tự động</p>
                <p className="text-sm text-gray-500">Tự động sao lưu mỗi ngày lúc 2:00 AM</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.backup.autoBackupEnabled}
                  onChange={(e) => setConfig({
                    ...config,
                    backup: { ...config.backup, autoBackupEnabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <button
              onClick={handleBackupNow}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              Sao lưu ngay
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </main>
    </div>
  );
}