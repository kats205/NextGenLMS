import { User } from '../../App';
import { LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Header({ user, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">LMS</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Hệ thống quản lý học tập</h1>
              <p className="text-sm text-gray-500">Learning Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role}</div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
