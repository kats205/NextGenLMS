import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { CheckCircle2, Circle, FileText, Video, File, MessageSquare, ArrowLeft, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { MediaViewer } from '../shared/MediaViewer';
import { AssignmentViewer } from './AssignmentViewer';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourseDetail } from '../../hooks/useCourse';
import { CourseContentDto } from '../../api/CourseService';

interface CoursePlayerPageProps {
  user: User;
}

export function CoursePlayerPage({ user }: CoursePlayerPageProps) {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading, error } = useCourseDetail(courseId);
  
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState<CourseContentDto | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Set first content as selected when course loads
  useEffect(() => {
    if (course?.chapters && course.chapters.length > 0) {
      const firstChapter = course.chapters[0];
      if (firstChapter.contents && firstChapter.contents.length > 0) {
        setSelectedContent(firstChapter.contents[0]);
      }
    }
  }, [course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <div className="text-gray-500">Đang tải thông tin khóa học...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách khóa học
          </button>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{error || 'Không tìm thấy khóa học'}</p>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </main>
      </div>
    );
  }

  const totalContents = course.chapters.reduce((acc, chapter) => acc + chapter.contents.length, 0);
  const completedCount = completedItems.length;

  const handleMarkComplete = () => {
    if (selectedContent && !completedItems.includes(selectedContent.id)) {
      setCompletedItems([...completedItems, selectedContent.id]);
    }
  };

  const getContentIcon = (content: CourseContentDto) => {
    switch (content.type) {
      case 'Lesson':
        if (content.fileType === 'Video') {
          return <Video className="w-4 h-4 text-red-600" />;
        } else if (content.fileType === 'PDF') {
          return <FileText className="w-4 h-4 text-red-600" />;
        }
        return <File className="w-4 h-4 text-gray-600" />;
      case 'Quiz':
        return <Circle className="w-4 h-4 text-blue-600" />;
      case 'Assignment':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'Announcement':
        return <MessageSquare className="w-4 h-4 text-yellow-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const getContentBadge = (content: CourseContentDto) => {
    switch (content.type) {
      case 'Lesson':
        return <Badge variant="primary">Bài giảng</Badge>;
      case 'Quiz':
        return <Badge variant="secondary">Bài kiểm tra</Badge>;
      case 'Assignment':
        return <Badge variant="success">Bài tập</Badge>;
      case 'Announcement':
        return <Badge variant="warning">Thông báo</Badge>;
      default:
        return <Badge variant="secondary">Nội dung</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderContentViewer = (content: CourseContentDto) => {
    switch (content.type) {
      case 'Lesson':
        if (content.fileType === 'Video' && content.fileUrl) {
          return (
            <MediaViewer
              type="video"
              src={content.fileUrl}
              title={content.title}
              className="aspect-video mb-6"
            />
          );
        } else if (content.fileType === 'Image' && content.fileUrl) {
          return (
            <MediaViewer
              type="image"
              src={content.fileUrl}
              title={content.title}
              className="max-h-96 mb-6"
            />
          );
        } else if (content.fileType === 'PDF' && content.fileUrl) {
          return (
            <MediaViewer
              type="pdf"
              src={content.fileUrl}
              title={content.title}
              className="aspect-[3/4] mb-6"
            />
          );
        } else if (content.contentHtml) {
          return (
            <div 
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: content.contentHtml }}
            />
          );
        } else {
          return (
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 mb-6 text-center">
              <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nội dung bài giảng</p>
              <p className="text-sm text-gray-500 mt-2">{content.title}</p>
            </div>
          );
        }

      case 'Quiz':
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Circle className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bài kiểm tra</h3>
            <p className="text-gray-600 mb-4">{content.title}</p>
            
            <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-500">
              {content.durationMinutes && content.durationMinutes > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{content.durationMinutes} phút</span>
                </div>
              )}
              {content.openTime && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Mở: {new Date(content.openTime).toLocaleString('vi-VN')}</span>
                </div>
              )}
              {content.closeTime && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Đóng: {new Date(content.closeTime).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>

            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Bắt đầu làm bài
            </button>
          </div>
        );

      case 'Assignment':
        return (
          <AssignmentViewer
            content={content}
            onSubmissionUpdate={() => {
              // Refresh assignment data
            }}
          />
        );

      case 'Announcement':
        return (
          <div className="py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Thông báo</h3>
              </div>
              {content.contentHtml ? (
                <div 
                  className="prose max-w-none text-yellow-800"
                  dangerouslySetInnerHTML={{ __html: content.contentHtml }}
                />
              ) : (
                <p className="text-yellow-800">{content.title}</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 mb-6 text-center">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nội dung không xác định</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách khóa học
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
              <div className="p-4 bg-primary-50 border-b border-primary-200">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{course.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {completedCount}/{totalContents} hoàn thành
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${totalContents > 0 ? (completedCount / totalContents) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {course.chapters.map(chapter => (
                  <div key={chapter.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{chapter.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {chapter.contents.length} nội dung
                      </p>
                    </div>
                    <div>
                      {chapter.contents.map(content => {
                        const isCompleted = completedItems.includes(content.id);
                        const isSelected = selectedContent?.id === content.id;
                        return (
                          <button
                            key={content.id}
                            onClick={() => setSelectedContent(content)}
                            className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${
                              isSelected
                                ? 'bg-primary-50 border-l-4 border-primary-600'
                                : 'hover:bg-gray-50 border-l-4 border-transparent'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getContentIcon(content)}
                                <span className={`text-sm line-clamp-2 ${
                                  isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                                }`}>
                                  {content.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="capitalize">{content.type}</span>
                                {content.durationSeconds && content.durationSeconds > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{formatDuration(content.durationSeconds)}</span>
                                  </>
                                )}
                                {content.fileSize && content.fileSize > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{formatFileSize(content.fileSize)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {selectedContent ? (
                <>
                  {/* Content Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-2xl font-semibold text-gray-900 line-clamp-2 flex-1 mr-4">
                        {selectedContent.title}
                      </h2>
                      {getContentBadge(selectedContent)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Tạo ngày {new Date(selectedContent.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  {/* Content Display */}
                  <div className="p-6">
                    {renderContentViewer(selectedContent)}

                    {/* Action Buttons */}
                    {selectedContent.type === 'Lesson' && (
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleMarkComplete}
                          disabled={completedItems.includes(selectedContent.id)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                            completedItems.includes(selectedContent.id)
                              ? 'bg-success-100 text-success-700 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {completedItems.includes(selectedContent.id) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                        </button>

                        <button
                          onClick={() => setShowFeedback(!showFeedback)}
                          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <MessageSquare className="w-5 h-5" />
                          Phản hồi
                        </button>
                      </div>
                    )}

                    {/* Feedback Form */}
                    {showFeedback && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gửi phản hồi của bạn
                        </label>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          rows={3}
                          placeholder="Nhập phản hồi về nội dung này..."
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            Gửi phản hồi
                          </button>
                          <button 
                            onClick={() => setShowFeedback(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chọn một nội dung để bắt đầu học</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}