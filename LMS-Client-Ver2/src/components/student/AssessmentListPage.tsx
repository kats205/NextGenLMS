import { User } from '../../App';
import { Header } from '../shared/Header';
import { mockAssessments, mockSubmissions } from '../../data/mockData';
import { BookOpen, TrendingUp, ClipboardList, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface AssessmentListPageProps {
  user: User;
  onNavigate: (page: string, courseId?: string, lessonId?: string, assessmentId?: string) => void;
  onLogout: () => void;
}

export function AssessmentListPage({ user, onNavigate, onLogout }: AssessmentListPageProps) {
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

  const getTimeUntilDue = (closeDate: string) => {
    const now = new Date();
    const due = new Date(closeDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffMs < 0) return 'Đã quá hạn';
    if (diffDays > 0) return `Còn ${diffDays} ngày`;
    if (diffHours > 0) return `Còn ${diffHours} giờ`;
    return 'Sắp hết hạn';
  };

  const isHighPriority = (closeDate: string) => {
    const now = new Date();
    const due = new Date(closeDate);
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 3 && diffDays > 0;
  };

  const isOverdue = (closeDate: string) => {
    return new Date(closeDate) < new Date();
  };

  // Group assessments
  const highPriorityAssessments = mockAssessments.filter(a => {
    const submission = mockSubmissions.find(s => s.assessmentId === a.id && s.studentId === user.id);
    return !submission?.submittedAt && isHighPriority(a.closeDate) && !isOverdue(a.closeDate);
  });

  const quizzes = mockAssessments.filter(a => {
    const submission = mockSubmissions.find(s => s.assessmentId === a.id && s.studentId === user.id);
    return a.type === 'quiz' && !highPriorityAssessments.includes(a) && !submission?.submittedAt && !isOverdue(a.closeDate);
  });

  const essays = mockAssessments.filter(a => {
    const submission = mockSubmissions.find(s => s.assessmentId === a.id && s.studentId === user.id);
    return a.type === 'essay' && !highPriorityAssessments.includes(a) && !submission?.submittedAt && !isOverdue(a.closeDate);
  });

  const getSubmissionStatus = (assessmentId: string) => {
    const submission = mockSubmissions.find(s => s.assessmentId === assessmentId && s.studentId === user.id);
    return submission;
  };

  const renderAssessmentCard = (assessment: typeof mockAssessments[0]) => {
    const submission = getSubmissionStatus(assessment.id);
    const timeUntil = getTimeUntilDue(assessment.closeDate);
    const overdueStatus = isOverdue(assessment.closeDate);

    return (
      <div
        key={assessment.id}
        className={`p-4 border rounded-lg hover:shadow-md transition-all ${
          overdueStatus ? 'border-danger-300 bg-danger-50' : 'border-gray-200 bg-white'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">{assessment.title}</h4>
              <Badge variant={assessment.type === 'quiz' ? 'primary' : 'warning'}>
                {assessment.type === 'quiz' ? 'Trắc nghiệm' : 'Tự luận'}
              </Badge>
              {submission?.status === 'submitted' && <Badge variant="success">Đã nộp</Badge>}
              {submission?.status === 'in-progress' && <Badge variant="warning">Đang làm</Badge>}
              {!submission && overdueStatus && <Badge variant="danger">Quá hạn</Badge>}
            </div>
            {assessment.description && (
              <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Hạn: {formatDate(assessment.closeDate)}</span>
              </div>
              {assessment.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{assessment.duration} phút</span>
                </div>
              )}
              <span className="font-medium">{assessment.totalPoints} điểm</span>
              {!submission?.submittedAt && (
                <span className={`font-medium ${overdueStatus ? 'text-danger-600' : isHighPriority(assessment.closeDate) ? 'text-warning-600' : 'text-gray-600'}`}>
                  {timeUntil}
                </span>
              )}
              {submission?.score !== undefined && (
                <span className="font-medium text-success-600">Điểm: {submission.score}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!submission?.submittedAt ? (
            <button
              onClick={() => onNavigate('assessment-attempt', undefined, undefined, assessment.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                overdueStatus
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
              disabled={overdueStatus}
            >
              {submission?.status === 'in-progress' ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
            </button>
          ) : (
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Xem kết quả
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <BookOpen className="w-4 h-4" />
            Khóa học
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <TrendingUp className="w-4 h-4" />
            Tiến độ
          </button>
          <button
            onClick={() => onNavigate('assessment-list')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
          >
            <ClipboardList className="w-4 h-4" />
            Bài kiểm tra
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Bài kiểm tra & Bài tập</h2>

        {/* High Priority */}
        {highPriorityAssessments.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-warning-600" />
              <h3 className="font-semibold text-gray-900">Sắp đến hạn</h3>
              <Badge variant="warning">{highPriorityAssessments.length}</Badge>
            </div>
            <div className="space-y-4">
              {highPriorityAssessments.map(renderAssessmentCard)}
            </div>
          </div>
        )}

        {/* Quizzes */}
        {quizzes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Bài trắc nghiệm</h3>
              <Badge variant="primary">{quizzes.length}</Badge>
            </div>
            <div className="space-y-4">
              {quizzes.map(renderAssessmentCard)}
            </div>
          </div>
        )}

        {/* Essays */}
        {essays.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-warning-600" />
              <h3 className="font-semibold text-gray-900">Bài tự luận</h3>
              <Badge variant="warning">{essays.length}</Badge>
            </div>
            <div className="space-y-4">
              {essays.map(renderAssessmentCard)}
            </div>
          </div>
        )}

        {highPriorityAssessments.length === 0 && quizzes.length === 0 && essays.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có bài kiểm tra nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
