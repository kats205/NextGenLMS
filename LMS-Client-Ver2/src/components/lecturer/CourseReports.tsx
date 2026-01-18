import { BarChart, TrendingUp, Users, Award, Target } from 'lucide-react';

interface CourseReportsProps {
  courseId: string;
}

export function CourseReports({ courseId }: CourseReportsProps) {
  // Mock report data
  const stats = {
    totalStudents: 45,
    averageCompletion: 62,
    averageScore: 7.8,
    passRate: 85,
  };

  const scoreDistribution = [
    { range: '9.0 - 10', count: 8, percentage: 18 },
    { range: '8.0 - 8.9', count: 12, percentage: 27 },
    { range: '7.0 - 7.9', count: 10, percentage: 22 },
    { range: '6.0 - 6.9', count: 8, percentage: 18 },
    { range: '5.0 - 5.9', count: 5, percentage: 11 },
    { range: '< 5.0', count: 2, percentage: 4 },
  ];

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">Báo cáo lớp học</h3>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</div>
          <div className="text-sm text-gray-600">Tổng sinh viên</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-lg border border-success-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-success-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.averageCompletion}%</div>
          <div className="text-sm text-gray-600">Tiến độ trung bình</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg border border-warning-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-warning-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.averageScore.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Điểm trung bình</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-lg border border-success-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-success-600" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.passRate}%</div>
          <div className="text-sm text-gray-600">Tỷ lệ đạt</div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart className="w-5 h-5 text-primary-600" />
          <h4 className="font-medium text-gray-900">Phổ điểm</h4>
        </div>

        <div className="space-y-4">
          {scoreDistribution.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.range}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{item.count} sinh viên</span>
                  <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600 mb-1">Điểm cao nhất</div>
              <div className="font-semibold text-gray-900">9.8</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Điểm thấp nhất</div>
              <div className="font-semibold text-gray-900">4.2</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Trung vị</div>
              <div className="font-semibold text-gray-900">7.5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Mức độ tương tác</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900 mb-1">382</div>
            <div className="text-sm text-gray-600">Lượt xem bài giảng</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900 mb-1">127</div>
            <div className="text-sm text-gray-600">Bài kiểm tra đã nộp</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-semibold text-gray-900 mb-1">45 phút</div>
            <div className="text-sm text-gray-600">Thời gian trung bình/tuần</div>
          </div>
        </div>
      </div>
    </div>
  );
}
