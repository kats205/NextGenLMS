import { useState, useEffect } from 'react';
import { User } from '../../App'; // Import type User của bạn
import { Header } from '../shared/Header';
import { Badge } from '../shared/Badge';
import { 
  ArrowLeft, Search, Plus, Upload, Download, 
  Edit, Trash2, BookOpen, UserCog, X, Users, LayoutList, Calendar 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import Service và DTOs thực tế
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getDepartments,
  getCourseById, 
  getMajors,
  assignLecturer,
  CourseDto,
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilterDto,
  DepartmentDto,
  MajorDto
} from '@/api/adminCourseService'; // Đảm bảo đường dẫn đúng
import { set } from 'react-hook-form';

interface CourseManagementPageProps {
  user: User;
}

export function CourseManagementPage({ user }: CourseManagementPageProps) {
  const navigate = useNavigate();
  
  // --- Search & Pagination States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  
  // Filter state (Mapping deptFilter to majorId for simplicity, or implement separate filters)
  // Trong thực tế bạn cần call API getMajors để lấy list ID cho select box
  const [majorFilter, setMajorFilter] = useState<string>(''); 
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // --- Data States ---
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [majors, setMajors] = useState<MajorDto[]>([]);


  // --- Modal States ---
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Form Data States ---
  // Khởi tạo state khớp với CreateCourseDto/UpdateCourseDto
  const [formData, setFormData] = useState<{
    courseCode: string;
    name: string;
    description: string;
    credits: number;
    semesterId: string;
    academicYearId: string;
    majorId: string;
  }>({
    courseCode: '',
    name: '',
    description: '',
    credits: 0,
    semesterId: '', // Cần ID thực từ DB
    academicYearId: '', // Cần ID thực từ DB
    majorId: '', // Cần ID thực từ DB
  });

  const [assignData, setAssignData] = useState({
    lecturerId: ''
  });

  // --- Effects ---

  // 1. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Fetch Data
  useEffect(() => {
    let ignore = false;
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const filter: CourseFilterDto = {
          pageNumber: page,
          pageSize: pageSize,
          searchTerm: debouncedSearch || undefined,
          majorId: majorFilter || undefined,
        };

        const res = await getCourses(filter);

        if (!ignore && res) {
          setCourses(res.items || []);
          setTotalItems(res.totalCount || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
        if (!ignore) {
          setCourses([]);
          setTotalItems(0);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchCourses();
    return () => { ignore = true; };
  }, [page, pageSize, debouncedSearch, majorFilter]);

  // 3. Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, majorFilter]);

  //4. Fetch Majors for select
  useEffect(() => {
      const fetchMajors = async () => {
        try{
          const majors = await getMajors();

          setMajors(majors || []);
        }
        catch(error){
          console.error("Lỗi khi tải dữ liệu dropdown:", error);
        }
      }
      fetchMajors();
    }, []);

  // --- Helper Functions ---

  const resetForm = () => {
    setFormData({
      courseCode: '',
      name: '',
      description: '',
      credits: 0,
      semesterId: '',
      academicYearId: '',
      majorId: '',
    });
    setEditingId(null);
  };

  const refreshData = async () => {
    try {
      const filter: CourseFilterDto = {
        pageNumber: page,
        pageSize: pageSize,
        searchTerm: debouncedSearch || undefined,
        majorId: majorFilter || undefined,
      };
      const res = await getCourses(filter);
      if (res) {
        setCourses(res.items || []);
        setTotalItems(res.totalCount || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- Handlers ---

  const handleCreateCourse = async () => {
    // Validate required fields
    if (!formData.courseCode || !formData.name || !formData.semesterId || !formData.majorId) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (Mã, Tên, Kỳ học, Ngành)!');
      return;
    }

    try {
      const createData: CreateCourseDto = {
        courseCode: formData.courseCode,
        name: formData.name,
        description: formData.description,
        credits: formData.credits,
        semesterId: formData.semesterId,
        academicYearId: formData.academicYearId,
        majorId: formData.majorId,
        // lecturerId: optional
      };

      await createCourse(createData);
      toast.success('Tạo khóa học thành công!');
      setIsCreating(false);
      resetForm();
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Tạo khóa học thất bại!');
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      const data = await getCourseById(id);
      if (data) {
        setFormData({
          courseCode: data.courseCode,
          name: data.name,
          description: data.description || '',
          credits: 0, // Lưu ý: API GetCourseDetail hiện tại trong CourseDto chưa trả về credits? Nếu có cần map vào.
          semesterId: data.semesterId,
          academicYearId: data.academicYearId,
          majorId: data.majorId,
        });
        setEditingId(id);
        setIsEditing(true);
      }
    } catch (error: any) {
      toast.error('Không thể tải thông tin khóa học!');
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingId || !formData.name) return;

    try {
      const updateData: UpdateCourseDto = {
        name: formData.name,
        description: formData.description,
        credits: formData.credits,
        semesterId: formData.semesterId,
        academicYearId: formData.academicYearId,
        majorId: formData.majorId
        // Lưu ý: Update DTO không cho phép sửa courseCode
      };

      await updateCourse(editingId, updateData);
      toast.success('Cập nhật khóa học thành công!');
      setIsEditing(false);
      resetForm();
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Cập nhật thất bại!');
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${name}"?\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      await deleteCourse(id);
      toast.success('Xóa khóa học thành công!');
      
      // Nếu trang hiện tại trống sau khi xóa, lùi về 1 trang
      if (courses.length === 1 && page > 1) {
        setPage(page - 1);
        // refreshData sẽ được gọi do page thay đổi hoặc gọi thủ công
      } else {
        refreshData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa thất bại!');
    }
  };

  const handleAssignClick = (courseId: string) => {
    setEditingId(courseId);
    setAssignData({ lecturerId: '' }); 
    setIsAssigning(true);
  };

  const handleAssignLecturer = async () => {
    if (!editingId || !assignData.lecturerId) {
      toast.error("Vui lòng nhập ID giảng viên!");
      return;
    }

    try {
      await assignLecturer(editingId, assignData.lecturerId);
      toast.success("Phân công giảng viên thành công!");
      setIsAssigning(false);
      setEditingId(null);
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Phân công thất bại!");
    }
  };

  const handleCloseForms = () => {
    setIsCreating(false);
    setIsEditing(false);
    setIsAssigning(false);
    resetForm();
  };

  if (loading && page === 1 && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải dữ liệu khóa học...</div>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quản lý khóa học</h2>
          <p className="text-gray-600">Tạo mới, cập nhật chương trình học và phân công giảng dạy</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Thêm khóa học
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Xuất danh sách
          </button>
        </div>

        {/* --- Create/Edit Modal --- */}
        {(isCreating || isEditing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {isCreating ? 'Thêm khóa học mới' : 'Cập nhật khóa học'}
                </h3>
                <button
                  onClick={handleCloseForms}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã học phần <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.courseCode}
                      onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="VD: INT1001"
                      disabled={isEditing} // UpdateDto không cho sửa Code
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên học phần <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="VD: Nhập môn Lập trình"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số tín chỉ</label>
                    <input
                      type="number"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  {/* Note: Trong thực tế, các field dưới đây nên là Select box load từ API Semester/Major */}
                  <div>
                    <select 
                      value={formData.majorId}
                      onChange={(e) => setFormData({ ...formData, majorId: e.target.value })}
                      className="block text-sm font-medium text-gray-700 mb-2">
                      <option value="">-- Chọn Ngành học --</option>
                      {majors.map((major) => (
                        <option key={major.id} value={major.id}>
                          {major.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.majorId}
                      onChange={(e) => setFormData({ ...formData, majorId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nhập ID ngành (GUID)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kỳ học (ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.semesterId}
                      onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nhập ID kỳ học (GUID)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Năm học (ID)
                    </label>
                    <input
                      type="text"
                      value={formData.academicYearId}
                      onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Nhập ID năm học (GUID)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Mô tả ngắn về nội dung khóa học..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={isCreating ? handleCreateCourse : handleUpdateCourse}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {isCreating ? 'Tạo khóa học' : 'Lưu thay đổi'}
                  </button>
                  <button
                    onClick={handleCloseForms}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Assign Lecturer Modal --- */}
        {isAssigning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Phân công giảng viên</h3>
                <button onClick={handleCloseForms} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhập ID Giảng viên
                  </label>
                  {/* Trong thực tế nên là Select search từ danh sách User role Lecturer */}
                  <input
                    type="text"
                    value={assignData.lecturerId}
                    onChange={(e) => setAssignData({ lecturerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập GUID của giảng viên..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Giảng viên được chọn sẽ có quyền quản lý nội dung và điểm số.
                  </p>
                </div>
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={handleAssignLecturer}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 w-full"
                  >
                    Xác nhận phân công
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
                placeholder="Tìm kiếm theo mã hoặc tên học phần..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              {/* Note: Value ở đây nên là ID của Major */}
              <input 
                 type="text"
                 placeholder="Lọc theo ID Ngành..."
                 value={majorFilter}
                 onChange={(e) => setMajorFilter(e.target.value)}
                 className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {courses.length === 0 ? (
              <div className="w-full py-12 text-center">
                <p className="text-gray-500 text-lg">Không tìm thấy khóa học nào</p>
                <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc thêm khóa học mới</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã HP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên Học Phần
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngành / Kỳ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giảng Viên
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SV
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map(course => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.courseCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{course.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         <div className="flex flex-col">
                            <span className="flex items-center gap-1"><LayoutList className="w-3 h-3"/> {course.majorName}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3"/> {course.semesterName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {course.lecturerName ? (
                          <div className="flex items-center text-gray-900">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            {course.lecturerName}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Chưa phân công</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {course.studentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAssignClick(course.id)}
                            className="p-2 hover:bg-blue-50 rounded-lg"
                            title="Phân công giảng viên"
                          >
                            <UserCog className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleEditClick(course.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                            className="p-2 hover:bg-danger-50 rounded-lg"
                            title="Xóa khóa học"
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
              Hiển thị <span className="font-medium">{courses.length}</span> trong tổng số <span className="font-medium">{totalItems}</span> khóa học
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