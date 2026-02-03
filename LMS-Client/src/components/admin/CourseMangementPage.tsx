import { useState, useEffect } from 'react';
import { User } from '../../App'; // Import type User c?a b?n
import { Header } from '../shared/Header';
import { 
  ArrowLeft, Search, Plus, Upload, Download, 
  Edit, Trash2, BookOpen, UserCog, X, Users, LayoutList, Calendar 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import Service và DTOs th?c t?
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getCourseById, 
  getMajors,
  assignLecturer,
  CourseDto,
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilterDto,
  MajorDto
} from '@/api/adminCourseService';
import { getAdminUsers, UserListItemDto } from '@/api/adminUser';
import { getAcademicYears, getSemesters, AcademicYearDto, SemesterDto } from '@/api/systemConfig';
import instance from '@/api/axiosClient';

interface CourseManagementPageProps {
  user: User;
}

export function CourseManagementPage({ user }: CourseManagementPageProps) {
  const navigate = useNavigate();
  
  // --- Search & Pagination States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  
  // Filter state (Mapping deptFilter to majorId for simplicity, or implement separate filters)
  // Trong th?c t? b?n c?n call API getMajors ?? l?y list ID cho select box
  const [majorFilter, setMajorFilter] = useState<string>(''); 
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // --- Data States ---
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [majors, setMajors] = useState<MajorDto[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);


  // --- Modal States ---
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Form Data States ---
  // Kh?i t?o state kh?p v?i CreateCourseDto/UpdateCourseDto
  const [formData, setFormData] = useState<{
    courseCode: string;
    name: string;
    description: string;
    thumbnailUrl?: string;
    semesterId: string;
    academicYearId: string;
    majorId: string;
  }>({
    courseCode: '',
    name: '',
    description: '',
    thumbnailUrl: undefined,
    semesterId: '', // C?n ID th?c t? DB
    academicYearId: '', // C?n ID th?c t? DB
    majorId: '', // C?n ID th?c t? DB
  });

  const [assignData, setAssignData] = useState({
    lecturerId: ''
  });

  // --- Lecturer selection states ---
  const [lecturerSearch, setLecturerSearch] = useState('');
  const [debouncedLecturerSearch, setDebouncedLecturerSearch] = useState('');
  const [lecturerOptions, setLecturerOptions] = useState<UserListItemDto[]>([]);
  const [lecturerLoading, setLecturerLoading] = useState(false);

  const [selectedLecturers, setSelectedLecturers] = useState<Array<{ id: string; fullName: string; email: string; isPrimary?: boolean }>>([]);
  const [primaryLecturerId, setPrimaryLecturerId] = useState<string | null>(null);

  // --- Effects ---

  // 1. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce lecturer search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedLecturerSearch(lecturerSearch), 500);
    return () => clearTimeout(t);
  }, [lecturerSearch]);

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

  //4. Fetch Majors, AcademicYears, Semesters for select
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [majorsRes, yearsRes, semestersRes] = await Promise.all([
          getMajors(),
          getAcademicYears(),
          getSemesters()
        ]);
        setMajors(majorsRes || []);
        setAcademicYears(yearsRes || []);
        setSemesters(semestersRes || []);
      } catch (error) {
        console.error("L?i khi t?i d? li?u dropdown:", error);
      }
    };
    fetchLookups();
  }, []);

  // Fetch lecturers options (role = Lecturer). Filter client-side by department if major selected
  useEffect(() => {
    let ignore = false;
    const fetchLecturers = async () => {
      setLecturerLoading(true);
      try {
        const params = {
          page: 1,
          pageSize: 200,
          search: debouncedLecturerSearch || undefined,
          role: 'Lecturer'
        } as any;

        const res = await getAdminUsers(params);
        if (ignore) return;

        let items = res.items || [];

        // If a major is selected, filter by its department name
        if (formData.majorId) {
          const major = majors.find(m => m.id === formData.majorId);
          if (major?.departmentName) {
            items = items.filter(i => i.department === major.departmentName);
          }
        }

        setLecturerOptions(items);
      } catch (err) {
        console.error('Failed to fetch lecturers', err);
        setLecturerOptions([]);
      } finally {
        if (!ignore) setLecturerLoading(false);
      }
    };

    fetchLecturers();
    return () => { ignore = true; };
  }, [debouncedLecturerSearch, formData.majorId, majors]);

  // --- Helper Functions ---

  const resetForm = () => {
    setFormData({
      courseCode: '',
      name: '',
      description: '',
      thumbnailUrl: undefined,
      semesterId: '',
      academicYearId: '',
      majorId: '',
    });
    setEditingId(null);
    setSelectedLecturers([]);
    setPrimaryLecturerId(null);
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

  const getFirstName = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  };

  const addSelectedLecturer = (u: UserListItemDto) => {
    if (!u) return;
    if (selectedLecturers.find(s => s.id === u.id)) return;
    setSelectedLecturers(prev => [...prev, { id: u.id, fullName: u.fullName, email: u.email }]);
    if (!primaryLecturerId) setPrimaryLecturerId(u.id);
  };

  const removeSelectedLecturer = (id: string) => {
    setSelectedLecturers(prev => prev.filter(p => p.id !== id));
    if (primaryLecturerId === id) setPrimaryLecturerId(selectedLecturers[0]?.id ?? null);
  };

  const handleCreateCourse = async () => {
    // Validate required fields
    if (!formData.courseCode || !formData.name || !formData.semesterId || !formData.majorId) {
      toast.error('Vui lòng ?i?n ??y ?? các thông tin b?t bu?c (Mã, Tên, K? h?c, Ngành)!');
      return;
    }

    try {
      const lecturerIds = primaryLecturerId
        ? [primaryLecturerId, ...selectedLecturers.map(s => s.id).filter(i => i !== primaryLecturerId)]
        : selectedLecturers.map(s => s.id);

      const createData: CreateCourseDto = {
        courseCode: formData.courseCode,
        name: formData.name,
        description: formData.description,
        semesterId: formData.semesterId,
        academicYearId: formData.academicYearId,
        majorId: formData.majorId,
        thumbnailUrl: formData.thumbnailUrl,
        lecturerId: lecturerIds
      };

      await createCourse(createData);
      toast.success('T?o khóa h?c thành công!');
      setIsCreating(false);
      resetForm();
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'T?o khóa h?c th?t b?i!');
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
          thumbnailUrl: data.thumbnailUrl,
          semesterId: data.semesterId,
          academicYearId: data.academicYearId,
          majorId: data.majorId,
        });
        setEditingId(id);
        setIsEditing(true);
        // populate selected lecturers from course data
        if (data.lecturers && data.lecturers.length) {
          const list = data.lecturers.map(l => ({ id: l.id, fullName: l.fullName, email: l.email, isPrimary: l.isPrimary }));
          setSelectedLecturers(list);
          const primary = list.find(x => x.isPrimary);
          setPrimaryLecturerId(primary ? primary.id : (list[0]?.id ?? null));
        } else {
          setSelectedLecturers([]);
          setPrimaryLecturerId(null);
        }
      }
    } catch (error: any) {
      toast.error('Không th? t?i thông tin khóa h?c!');
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingId || !formData.name) return;

    try {
      const updateData: UpdateCourseDto = {
        name: formData.name,
        description: formData.description,
        semesterId: formData.semesterId,
        academicYearId: formData.academicYearId,
        majorId: formData.majorId,
        thumbnailUrl: formData.thumbnailUrl
        // L?u ý: Update DTO không cho phép s?a courseCode
      };

      await updateCourse(editingId, updateData);
      // Assign selected lecturers after update (best-effort)
      if (selectedLecturers && selectedLecturers.length) {
        await Promise.all(selectedLecturers.map(s => assignLecturer(editingId, s.id)));
      }
      toast.success('C?p nh?t khóa h?c thành công!');
      setIsEditing(false);
      resetForm();
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'C?p nh?t th?t b?i!');
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`B?n có ch?c ch?n mu?n xóa khóa h?c "${name}"?\nHành ??ng này không th? hoàn tác!`)) {
      return;
    }

    try {
      await deleteCourse(id);
      toast.success('Xóa khóa h?c thành công!');
      
      // N?u trang hi?n t?i tr?ng sau khi xóa, lùi v? 1 trang
      if (courses.length === 1 && page > 1) {
        setPage(page - 1);
        // refreshData s? ???c g?i do page thay ??i ho?c g?i th? công
      } else {
        refreshData();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa th?t b?i!');
    }
  };

  const handleAssignClick = (courseId: string) => {
    setEditingId(courseId);
    setAssignData({ lecturerId: '' }); 
    setIsAssigning(true);
  };

  const handleAssignLecturer = async () => {
    if (!editingId || !assignData.lecturerId) {
      toast.error("Vui lòng nh?p ID gi?ng viên!");
      return;
    }

    try {
      await assignLecturer(editingId, assignData.lecturerId);
      toast.success("Phân công gi?ng viên thành công!");
      setIsAssigning(false);
      setEditingId(null);
      refreshData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Phân công th?t b?i!");
    }
  };

  const handleCloseForms = () => {
    setIsCreating(false);
    setIsEditing(false);
    setIsAssigning(false);
    resetForm();
  };

  const handleThumbnailUpload = async (file: File) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    try {
      const response = await instance.post('/api/upload/image', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { folder: 'courses' }
      });
      const url = response.data?.data?.url as string | undefined;
      if (url) {
        setFormData(prev => ({ ...prev, thumbnailUrl: url }));
        toast.success('T?i ?nh khóa h?c thành công!');
      } else {
        toast.error('Không l?y ???c URL ?nh t? server');
      }
    } catch (error: any) {
      console.error('Upload thumbnail error:', error);
      toast.error(error?.response?.data?.message || 'T?i ?nh khóa h?c th?t b?i!');
    }
  };

  if (loading && page === 1 && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">?ang t?i d? li?u khóa h?c...</div>
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
          Quay l?i Dashboard
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Qu?n lý khóa h?c</h2>
          <p className="text-gray-600">T?o m?i, c?p nh?t ch??ng trình h?c và phân công gi?ng d?y</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Thêm khóa h?c
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Xu?t danh sách
          </button>
        </div>

        {/* --- Create/Edit Modal --- */}
        {(isCreating || isEditing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {isCreating ? 'Thêm khóa h?c m?i' : 'C?p nh?t khóa h?c'}
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
                      Mã h?c ph?n <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.courseCode}
                      onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="VD: INT1001"
                      disabled={isEditing} // UpdateDto không cho s?a Code
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên h?c ph?n <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="VD: Nh?p môn L?p trình"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngành h?c <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.majorId}
                      onChange={(e) => setFormData({ ...formData, majorId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">-- Ch?n Ngành h?c --</option>
                      {majors.map((major) => (
                        <option key={major.id} value={major.id}>
                          {major.name} ({major.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        H?c k? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.semesterId}
                      onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">-- Ch?n H?c k? --</option>
                      {semesters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        N?m h?c
                    </label>
                    <select
                      value={formData.academicYearId}
                      onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">-- Ch?n N?m h?c --</option>
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô t?</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Mô t? ng?n v? n?i dung khóa h?c..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ?nh khóa h?c
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.thumbnailUrl && (
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail"
                          className="w-16 h-16 rounded-lg object-cover border"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleThumbnailUpload(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* --- Lecturer Selector & Selected Table --- */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gi?ng viên</label>
                    <div>
                      <input
                        type="text"
                        value={lecturerSearch}
                        onChange={(e) => setLecturerSearch(e.target.value)}
                        placeholder="Gõ ?? tìm gi?ng viên (email ho?c tên)..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {/* Dropdown suggestions */}
                      {lecturerOptions.length > 0 && lecturerSearch.trim() !== '' && (
                        <ul className="mt-1 border border-gray-200 rounded bg-white max-h-48 overflow-y-auto z-50">
                          {lecturerOptions.map(opt => (
                            <li
                              key={opt.id}
                              onClick={() => { addSelectedLecturer(opt); setLecturerSearch(''); }}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              {opt.email} ({getFirstName(opt.fullName)})
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-gray-400 mt-2">Danh sách l?c theo Khoa (n?u ?ã ch?n Ngành), có th? gõ ?? tìm và ch?n.</p>
                    </div>

                    {/* Selected lecturers table */}
                    {selectedLecturers.length > 0 && (
                      <div className="mt-3 border rounded overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-3 py-2 text-left">H? & Tên</th>
                              <th className="px-3 py-2 text-left">Email</th>
                              <th className="px-3 py-2 text-center">Chính</th>
                              <th className="px-3 py-2 text-center">Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedLecturers.map(s => (
                              <tr key={s.id} className="border-b">
                                <td className="px-3 py-2">{s.fullName}</td>
                                <td className="px-3 py-2">{s.email}</td>
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="radio"
                                    name="primaryLecturer"
                                    checked={primaryLecturerId === s.id}
                                    onChange={() => setPrimaryLecturerId(s.id)}
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button onClick={() => removeSelectedLecturer(s.id)} className="text-sm text-danger-600 hover:underline">Xóa</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={isCreating ? handleCreateCourse : handleUpdateCourse}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {isCreating ? 'T?o khóa h?c' : 'L?u thay ??i'}
                  </button>
                  <button
                    onClick={handleCloseForms}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    H?y
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
                <h3 className="text-xl font-semibold text-gray-900">Phân công gi?ng viên</h3>
                <button onClick={handleCloseForms} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nh?p ID Gi?ng viên
                  </label>
                  {/* Trong th?c t? nên là Select search t? danh sách User role Lecturer */}
                  <input
                    type="text"
                    value={assignData.lecturerId}
                    onChange={(e) => setAssignData({ lecturerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nh?p GUID c?a gi?ng viên..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Gi?ng viên ???c ch?n s? có quy?n qu?n lý n?i dung và ?i?m s?.
                  </p>
                </div>
                <div className="flex gap-2 mt-6">
                  <button 
                    onClick={handleAssignLecturer}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 w-full"
                  >
                    Xác nh?n phân công
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
                placeholder="Tìm ki?m theo mã ho?c tên h?c ph?n..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <select
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">T?t c? ngành</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            {courses.length === 0 ? (
              <div className="w-full py-12 text-center">
                <p className="text-gray-500 text-lg">Không tìm th?y khóa h?c nào</p>
                <p className="text-gray-400 text-sm mt-2">Th? thay ??i b? l?c ho?c thêm khóa h?c m?i</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã HP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên H?c Ph?n
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngành / K?
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gi?ng Viên
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
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt={course.name}
                              className="w-8 h-8 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
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
                        {course.primaryLecturerName ? (
                          <div className="flex items-center text-gray-900">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            {course.primaryLecturerName}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Ch?a phân công</span>
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
                            title="Phân công gi?ng viên"
                          >
                            <UserCog className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleEditClick(course.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Ch?nh s?a thông tin"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                            className="p-2 hover:bg-danger-50 rounded-lg"
                            title="Xóa khóa h?c"
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
              Hi?n th? <span className="font-medium">{courses.length}</span> trong t?ng s? <span className="font-medium">{totalItems}</span> khóa h?c
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${
                  page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                Tr??c
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