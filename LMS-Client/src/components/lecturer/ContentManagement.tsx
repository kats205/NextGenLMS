import { useState } from 'react';
import { mockChapters } from '../../data/mockData';
import { Plus, FileText, Video, File, Link as LinkIcon, CheckCircle2, MoreVertical } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface ContentManagementProps {
  courseId: string;
}

export function ContentManagement({ courseId }: ContentManagementProps) {
  const [expandedChapters, setExpandedChapters] = useState<string[]>(['ch1']);
  const chapters = mockChapters.filter(c => c.courseId === courseId);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-danger-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-primary-600" />;
      case 'word':
        return <File className="w-5 h-5 text-primary-500" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-success-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getItemTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture':
        return <Badge variant="primary">Bài giảng</Badge>;
      case 'assessment':
        return <Badge variant="warning">Bài kiểm tra</Badge>;
      case 'announcement':
        return <Badge variant="secondary">Thông báo</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">Quản lý nội dung khóa học</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-4 h-4" />
          Thêm chương mới
        </button>
      </div>

      {/* Chapters List */}
      <div className="space-y-4">
        {chapters.map(chapter => {
          const isExpanded = expandedChapters.includes(chapter.id);
          return (
            <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                  <span className="font-medium text-gray-900">{chapter.title}</span>
                  <span className="text-sm text-gray-500">({chapter.items.length} mục)</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="divide-y divide-gray-100">
                  {chapter.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(item.fileType)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">{item.title}</span>
                            {getItemTypeBadge(item.type)}
                          </div>
                          {item.duration && (
                            <p className="text-sm text-gray-500 mt-1">
                              {Math.floor(item.duration / 60)} phút
                            </p>
                          )}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                  <div className="p-4 bg-gray-50">
                    <button className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                      <Plus className="w-4 h-4" />
                      Thêm nội dung
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {chapters.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Chưa có nội dung nào</p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Thêm chương đầu tiên
          </button>
        </div>
      )}
    </div>
  );
}
