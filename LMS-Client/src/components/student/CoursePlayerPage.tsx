import { useState } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { mockCourses, mockChapters } from '../../data/mockData';
import { CheckCircle2, Circle, FileText, Video, File, MessageSquare, ArrowLeft } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { useNavigate, useParams } from 'react-router-dom';

interface CoursePlayerPageProps {
  user: User;
}

export function CoursePlayerPage({ user }: CoursePlayerPageProps) {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const course = mockCourses.find(c => c.id === courseId);
  const chapters = mockChapters.filter(c => c.courseId === courseId);
  const [completedItems, setCompletedItems] = useState<string[]>(['i1', 'i2']);
  const [selectedItemId, setSelectedItemId] = useState('i1');
  const [showFeedback, setShowFeedback] = useState(false);

  if (!course) return <div>Course not found</div>;

  // Find selected item
  let selectedItem = null;
  for (const chapter of chapters) {
    const item = chapter.items.find(i => i.id === selectedItemId);
    if (item) {
      selectedItem = item;
      break;
    }
  }

  const handleMarkComplete = () => {
    if (selectedItemId && !completedItems.includes(selectedItemId)) {
      setCompletedItems([...completedItems, selectedItemId]);
    }
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-danger-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-primary-600" />;
      case 'word':
        return <File className="w-4 h-4 text-primary-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
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
                <h3 className="font-semibold text-gray-900">Mục lục</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {completedItems.length}/{chapters.reduce((acc, ch) => acc + ch.items.length, 0)} hoàn thành
                </p>
              </div>

              <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                {chapters.map(chapter => (
                  <div key={chapter.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900">{chapter.title}</h4>
                    </div>
                    <div>
                      {chapter.items.map(item => {
                        const isCompleted = completedItems.includes(item.id);
                        const isSelected = selectedItemId === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItemId(item.id)}
                            className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${isSelected
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
                                {getFileIcon(item.fileType)}
                                <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                  {item.title}
                                </span>
                              </div>
                              {item.duration && (
                                <p className="text-xs text-gray-500">
                                  {Math.floor(item.duration / 60)} phút
                                </p>
                              )}
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
              {selectedItem && (
                <>
                  {/* Content Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-2xl font-semibold text-gray-900">{selectedItem.title}</h2>
                      {selectedItem.type === 'lecture' && (
                        <Badge variant="primary">Bài giảng</Badge>
                      )}
                      {selectedItem.type === 'assessment' && (
                        <Badge variant="warning">Bài kiểm tra</Badge>
                      )}
                    </div>
                  </div>

                  {/* Content Display */}
                  <div className="p-6">
                    {selectedItem.type === 'lecture' && (
                      <>
                        {selectedItem.fileType === 'video' ? (
                          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-6">
                            <Video className="w-16 h-16 text-gray-400" />
                            <p className="text-white ml-4">Video Player Placeholder</p>
                          </div>
                        ) : selectedItem.fileType === 'pdf' ? (
                          <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
                            <div className="text-center">
                              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-600">PDF Viewer Placeholder</p>
                              <p className="text-sm text-gray-500 mt-2">{selectedItem.title}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                            <File className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-600">Document: {selectedItem.title}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleMarkComplete}
                            disabled={completedItems.includes(selectedItemId)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${completedItems.includes(selectedItemId)
                                ? 'bg-success-100 text-success-700 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                              }`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            {completedItems.includes(selectedItemId) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                          </button>

                          <button
                            onClick={() => setShowFeedback(!showFeedback)}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            <MessageSquare className="w-5 h-5" />
                            Phản hồi
                          </button>
                        </div>

                        {/* Feedback Form */}
                        {showFeedback && (
                          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gửi phản hồi của bạn
                            </label>
                            <textarea
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                              rows={3}
                              placeholder="Nhập phản hồi..."
                            />
                            <button className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                              Gửi
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {selectedItem.type === 'assessment' && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Badge variant="warning">Bài kiểm tra</Badge>
                        </div>
                        <p className="text-gray-600 mb-4">Đây là một bài kiểm tra</p>
                        <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                          Bắt đầu làm bài
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
