import { useState } from 'react';
import { mockAssessments } from '../../data/mockData';
import { Plus, ClipboardList, FileEdit, Calendar, Clock, MoreVertical } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface AssessmentManagementProps {
  courseId: string;
}

export function AssessmentManagement({ courseId }: AssessmentManagementProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'quiz' | 'essay'>('quiz');

  const assessments = mockAssessments.filter(a => a.courseId === courseId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAssessmentStatus = (assessment: typeof assessments[0]) => {
    const now = new Date();
    const openDate = new Date(assessment.openDate);
    const closeDate = new Date(assessment.closeDate);

    if (now < openDate) {
      return { label: 'Sắp mở', variant: 'secondary' as const };
    } else if (now > closeDate) {
      return { label: 'Đã đóng', variant: 'danger' as const };
    } else {
      return { label: 'Đang mở', variant: 'success' as const };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Quản lý bài kiểm tra & bài tập</h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo bài kiểm tra
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="p-6 bg-white border-2 border-primary-300 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">Tạo bài kiểm tra mới</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bài kiểm tra
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="quiz"
                    checked={assessmentType === 'quiz'}
                    onChange={() => setAssessmentType('quiz')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">Trắc nghiệm</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="essay"
                    checked={assessmentType === 'essay'}
                    onChange={() => setAssessmentType('essay')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700">Tự luận</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập tiêu đề bài kiểm tra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={3}
                placeholder="Mô tả về bài kiểm tra..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian mở
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian đóng
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {assessmentType === 'quiz' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian làm bài (phút)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="60"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-primary-600" />
                  <label className="text-sm text-gray-700">Trộn câu hỏi ngẫu nhiên</label>
                </div>
              </>
            )}

            {assessmentType === 'essay' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-primary-600" />
                  <label className="text-sm text-gray-700">Cho phép nộp muộn</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian cho phép nộp muộn (phút)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="1440"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Tạo bài kiểm tra
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessments List */}
      <div className="space-y-4">
        {assessments.map(assessment => {
          const status = getAssessmentStatus(assessment);
          return (
            <div
              key={assessment.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  {assessment.type === 'quiz' ? (
                    <ClipboardList className="w-5 h-5 text-primary-600 mt-1" />
                  ) : (
                    <FileEdit className="w-5 h-5 text-warning-600 mt-1" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{assessment.title}</h4>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant={assessment.type === 'quiz' ? 'primary' : 'warning'}>
                        {assessment.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
                      </Badge>
                    </div>
                    {assessment.description && (
                      <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(assessment.openDate)} - {formatDate(assessment.closeDate)}</span>
                      </div>
                      {assessment.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{assessment.duration} phút</span>
                        </div>
                      )}
                      <span className="font-medium">{assessment.totalPoints} điểm</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {assessments.length === 0 && !isCreating && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Chưa có bài kiểm tra nào</p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tạo bài kiểm tra đầu tiên
          </button>
        </div>
      )}
    </div>
  );
}
