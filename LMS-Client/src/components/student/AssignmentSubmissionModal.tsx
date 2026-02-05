import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Link, Trash2, Download } from 'lucide-react';
import { CourseContentDto } from '../../api/CourseService';
import { assignmentService, CreateSubmissionRequest, AttachmentDto } from '../../api/AssignmentService/assignmentService';

interface AssignmentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: CourseContentDto;
  onSubmissionSuccess: () => void;
}

export function AssignmentSubmissionModal({ 
  isOpen, 
  onClose, 
  assignment, 
  onSubmissionSuccess 
}: AssignmentSubmissionModalProps) {
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  console.log('Modal rendering with assignment:', assignment);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Check file size
    const maxSize = assignment.maxFileSize || 10485760; // 10MB default
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError(`Các file sau vượt quá kích thước cho phép (${Math.round(maxSize / 1024 / 1024)}MB): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Check file types if restricted
    if (assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0) {
      const allowedTypes = assignment.allowedFileTypes.split(',').map(type => type.trim());
      const invalidFiles = selectedFiles.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !allowedTypes.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        setError(`Các file sau có định dạng không được phép: ${invalidFiles.map(f => f.name).join(', ')}`);
        return;
      }
    }

    setFiles(prev => [...prev, ...selectedFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (assignment.requireTextSubmission && !textContent.trim()) {
        setError('Nội dung văn bản là bắt buộc');
        return;
      }

      if (!assignment.allowFileSubmission && files.length > 0) {
        setError('Bài tập này không cho phép nộp file');
        return;
      }

      if (!assignment.allowLinkSubmission && links.some(link => link.trim())) {
        setError('Bài tập này không cho phép nộp link');
        return;
      }

      const validLinks = links.filter(link => link.trim());

      const request: CreateSubmissionRequest = {
        assignmentId: assignment.id,
        textContent: textContent.trim() || undefined,
        files: files.length > 0 ? files : undefined,
        links: validLinks.length > 0 ? validLinks : undefined,
        saveAsDraft
      };

      const response = await assignmentService.createSubmission(request);

      if (response.success) {
        onSubmissionSuccess();
        onClose();
        
        if (saveAsDraft) {
          alert('Bài làm đã được lưu thành bản nháp');
        } else {
          alert('Bài tập đã được nộp thành công!');
        }
      } else {
        setError(response.message || 'Có lỗi xảy ra khi nộp bài');
      }
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
           style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Nộp bài tập</h2>
            <p className="text-sm text-gray-600 mt-1">{assignment.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Assignment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Điểm tối đa:</span>
                <span className="ml-2 text-blue-700">{assignment.maxScore}</span>
              </div>
              {assignment.dueDate && (
                <div>
                  <span className="font-medium text-blue-900">Hạn nộp:</span>
                  <span className={`ml-2 ${isOverdue ? 'text-red-600 font-medium' : 'text-blue-700'}`}>
                    {new Date(assignment.dueDate).toLocaleString('vi-VN')}
                    {isOverdue && ' (Quá hạn)'}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-blue-900">Số lần nộp tối đa:</span>
                <span className="ml-2 text-blue-700">{assignment.maxAttempts || 'Không giới hạn'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Kích thước file tối đa:</span>
                <span className="ml-2 text-blue-700">{formatFileSize(assignment.maxFileSize || 10485760)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Text Content */}
          {(assignment.requireTextSubmission || assignment.allowFileSubmission) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung bài làm
                {assignment.requireTextSubmission && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Nhập nội dung bài làm của bạn..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                required={assignment.requireTextSubmission}
              />
            </div>
          )}

          {/* File Upload */}
          {assignment.allowFileSubmission && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tải file lên
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Kéo thả file vào đây hoặc click để chọn file
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Chọn file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={assignment.allowedFileTypes || undefined}
                />
              </div>

              {assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Định dạng cho phép: {assignment.allowedFileTypes}
                </p>
              )}

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">File đã chọn:</p>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Links */}
          {assignment.allowLinkSubmission && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liên kết
              </label>
              
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Link className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {links.length > 1 && (
                    <button
                      onClick={() => removeLink(index)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addLink}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                + Thêm liên kết
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu nháp'}
            </button>
            
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}