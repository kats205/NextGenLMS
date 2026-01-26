import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { Badge } from '../shared/Badge';
import { ArrowLeft, Search, Plus, Upload, Download, Edit, Trash2, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers, UserListItemDto, createUser, updateUser, deleteUser, getUserById, CreateUserDto, UpdateUserDto } from '@/api/adminUser';
import { toast } from 'react-toastify';

interface UserManagementPageProps {
  user: User;
}

export function UserManagementPage({ user }: UserManagementPageProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    roleName: 'Student',
    departmentId: '',
    studentCode: '',
    password: '',
    isActive: true
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
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
        if (!ignore) {
          setUsers(res?.items || []);
          setTotalItems(res?.totalItems || 0);
          setTotalPages(res?.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        if (!ignore) {
          setUsers([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchUsers();
    return () => { ignore = true; };
  }, [page, pageSize, debouncedSearch, roleFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      roleName: 'Student',
      departmentId: '',
      studentCode: '',
      password: '',
      isActive: true
    });
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!formData.fullName || !formData.email) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn tạo người dùng mới này?')) {
      return;
    }

    try {
      const createData: CreateUserDto = {
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || null,
        roleName: formData.roleName,
        departmentId: formData.departmentId || null,
        studentCode: formData.studentCode || null,
        password: formData.password || null
      };

      await createUser(createData);
      toast.success('Tạo người dùng thành công!');
      setIsCreatingUser(false);
      resetForm();
      
      // Refresh user list
      const res = await getAdminUsers({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setUsers(res?.items || []);
      setTotalItems(res?.totalItems || 0);
      setTotalPages(res?.totalPages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Tạo người dùng thất bại!');
    }
  };

  // Handle edit user - load user data
  const handleEditUserClick = async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      setFormData({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || '',
        roleName: userData.roleName,
        departmentId: userData.departmentId || '',
        studentCode: userData.studentCode || '',
        password: '',
        isActive: userData.isActive
      });
      setEditingUserId(userId);
      setIsEditingUser(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải thông tin người dùng!');
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!formData.fullName || !formData.email || !editingUserId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn cập nhật thông tin người dùng này?')) {
      return;
    }

    try {
      const updateData: UpdateUserDto = {
        userId: editingUserId,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone || null,
        roleName: formData.roleName,
        departmentId: formData.departmentId || null,
        studentCode: formData.studentCode || null,
        isActive: formData.isActive
      };

      await updateUser(editingUserId, updateData);
      toast.success('Cập nhật người dùng thành công!');
      setIsEditingUser(false);
      setEditingUserId(null);
      resetForm();
      
      // Refresh user list
      const res = await getAdminUsers({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setUsers(res?.items || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Cập nhật người dùng thất bại!');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      await deleteUser(userId);
      toast.success('Xóa người dùng thành công!');
      
      // Refresh user list
      const res = await getAdminUsers({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setUsers(res?.items || []);
      setTotalItems(res?.totalItems || 0);
      setTotalPages(res?.totalPages || 1);
      
      // If current page is empty and not first page, go back one page
      if (res.items.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa người dùng thất bại!');
    }
  };

  // Close modals
  const handleCloseCreateForm = () => {
    setIsCreatingUser(false);
    resetForm();
  };

  const handleCloseEditForm = () => {
    setIsEditingUser(false);
    setEditingUserId(null);
    resetForm();
  };

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

        {/* Create User Modal */}
        {isCreatingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Thêm người dùng mới</h3>
                <button
                  onClick={handleCloseCreateForm}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="email@university.edu.vn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0912345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Student">Sinh viên</option>
                      <option value="Lecturer">Giảng viên</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã sinh viên</label>
                    <input
                      type="text"
                      value={formData.studentCode}
                      onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="SV123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Để trống để tạo mật khẩu tự động"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleCreateUser}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Tạo tài khoản
                  </button>
                  <button
                    onClick={handleCloseCreateForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa người dùng</h3>
                <button
                  onClick={handleCloseEditForm}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="email@university.edu.vn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0912345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.roleName}
                      onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Student">Sinh viên</option>
                      <option value="Lecturer">Giảng viên</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mã sinh viên</label>
                    <input
                      type="text"
                      value={formData.studentCode}
                      onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="SV123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm khóa</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Cập nhật
                  </button>
                  <button
                    onClick={handleCloseEditForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
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
                value={searchTerm}
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
                <option value="Admin">Admin</option>
                <option value="Lecturer">Giảng viên</option>
                <option value="Student">Sinh viên</option>
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
                          <button
                            onClick={() => handleEditUserClick(u.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            className="p-2 hover:bg-danger-50 rounded-lg"
                            title="Xóa"
                          >
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
              Hiển thị <span className="font-medium">{users.length}</span> trong tổng số <span className="font-medium">{totalItems}</span> người dùng
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${
                  page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Trước
              </button>
              <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg">
                Trang <b>{page}</b> / {totalPages}
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${
                  page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}