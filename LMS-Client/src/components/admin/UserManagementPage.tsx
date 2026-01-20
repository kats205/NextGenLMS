import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { Badge } from '../shared/Badge';
import { ArrowLeft, Search, Plus, Upload, Download, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers, UserListItemDto } from '@/api/adminUser';
// import axiosClient from '../../api/axiosClient';

interface UserManagementPageProps {
  user: User;
}

export function UserManagementPage({ user }: UserManagementPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [users, setUsers] = useState<UserListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
      return () => clearTimeout(t);
    }, [searchTerm]);
  
  useEffect(() => {
    let ignore = false;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await getAdminUsers({
           page, 
           pageSize,
           search: debouncedSearch || undefined,
           role: roleFilter !== 'all' ? roleFilter : undefined,
          });
        if(!ignore){
          setUsers(res?.items || []);
          setTotalItems(res?.totalItems || 0);
          setTotalPages(res?.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        if(!ignore) setLoading(false);
      }
    };
    fetchUsers();
    return() => {ignore = true;};
  }, [page, pageSize, debouncedSearch, roleFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

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
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quản lý người dùng</h2>
          <p className="text-gray-600">Quản lý tài khoản, phân quyền và đồng bộ dữ liệu</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreatingUser(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Thêm người dùng
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Đồng bộ từ SIS
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>

        {/* Create User Form */}
        {isCreatingUser && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thêm người dùng mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="email@university.edu.vn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="student">Sinh viên</option>
                  <option value="lecturer">Giảng viên</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Khoa/Bộ môn</label>
                 <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="student">Khoa Công Nghệ Thông tin</option>
                  <option value="lecturer">Khoa Khoa học và Kỹ thuật</option>
                  <option value="admin">Khoa Vận Tải</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Tạo tài khoản
              </button>
              <button
                onClick={() => setIsCreatingUser(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={debouncedSearch}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="lecturer">Giảng viên</option>
                <option value="student">Sinh viên</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {users.length === 0 ? (
              <div className="w-full py-12 text-center">
                <p className="text-gray-500 text-lg">Không có dữ liệu người dùng</p>
                <p className="text-gray-400 text-sm mt-2">Hãy thêm người dùng mới hoặc kiểm tra bộ lọc</p>
              </div>
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khoa/Bộ môn
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-primary-600">
                            {u.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{u.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.role.toString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.department || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {u.status === 'active' ? (
                        <Badge variant="success">Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Tạm khóa</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-danger-50 rounded-lg">
                          <Trash2 className="w-4 h-4 text-danger-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium">{users.length}</span> người dùng
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Trước
              </button>
              <button className="px-3 py-1 bg-primary-600 text-white text-sm">
                Trang <b>{page}</b> / {totalPages}
              </button>
              <button 
                disabled={page >= totalPages}
                onClick = {() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                Sau
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
