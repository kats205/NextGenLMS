import { useState } from 'react';
import { Search, Download, Mail } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface StudentListProps {
  courseId: string;
}

// Mock student data
const mockStudents = [
  { id: '3', name: 'Lê Minh Tuấn', email: 'student@university.edu.vn', averageScore: 9.0, completionRate: 50 },
  { id: '4', name: 'Nguyễn Thị Lan', email: 'lan.nguyen@university.edu.vn', averageScore: 8.5, completionRate: 75 },
  { id: '5', name: 'Trần Văn Hùng', email: 'hung.tran@university.edu.vn', averageScore: 7.8, completionRate: 60 },
  { id: '6', name: 'Phạm Thị Hoa', email: 'hoa.pham@university.edu.vn', averageScore: 9.2, completionRate: 80 },
  { id: '7', name: 'Hoàng Văn Nam', email: 'nam.hoang@university.edu.vn', averageScore: 6.5, completionRate: 40 },
];

export function StudentList({ courseId }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreBadge = (score: number) => {
    if (score >= 8.5) return <Badge variant="success">Xuất sắc</Badge>;
    if (score >= 7.0) return <Badge variant="primary">Khá</Badge>;
    if (score >= 5.5) return <Badge variant="warning">Trung bình</Badge>;
    return <Badge variant="danger">Yếu</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Danh sách sinh viên</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Mail className="w-4 h-4" />
            Gửi email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm sinh viên..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sinh viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiến độ
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điểm TB
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Xếp loại
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="font-medium text-primary-600">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{student.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex-1 max-w-[100px]">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${student.completionRate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{student.completionRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="font-medium text-gray-900">{student.averageScore.toFixed(1)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getScoreBadge(student.averageScore)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy sinh viên nào
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-500">
          Hiển thị <span className="font-medium">{filteredStudents.length}</span> sinh viên
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            Trước
          </button>
          <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm">
            1
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            2
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
