import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, X } from 'lucide-react';
import { CourseContentDto } from '../../api/CourseService';
import { assignmentService } from '../../api/AssignmentService/assignmentService';

interface AssignmentSubmissionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: CourseContentDto;
  onSubmissionSuccess: () => void;
}

export function AssignmentSubmissionPopup({ 
  isOpen, 
  onClose, 
  assignment, 
  onSubmissionSuccess
}: AssignmentSubmissionPopupProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Basic file size check (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} quá lớn (tối đa 50MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await assignmentService.createSubmission({
        assignmentId: assignment.id,
        textContent: textContent || undefined,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
        saveAsDraft: false
      });

      if (response.success) {
        alert('Nộp bài thành công!');
        onSubmissionSuccess();
        onClose();
        
        // Reset form
        setSelectedFiles([]);
        setTextContent('');
      } else {
        setError(response.message || 'Có lỗi xảy ra khi nộp bài');
      }
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-[40000]"
        onClick={onClose}
      />
      
      {/* Popup centered in viewport */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 z-[50000] animate-in slide-in-from-top-2 duration-200 flex flex-col"
        style={{
          width: '910px',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Nộp bài tập</h3>
            <p className="text-base text-gray-600 mt-2">{assignment.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          {/* Assignment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-8 text-base">
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">Điểm tối đa:</span>
                <span className="text-blue-700">{assignment.maxScore}</span>
              </div>
              {assignment.dueDate && (
                <div className="flex justify-between">
                  <span className="font-medium text-blue-900">Hạn nộp:</span>
                  <span className="text-blue-700">
                    {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-800 text-base">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column - Text Content */}
            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-4">
                  Nội dung bài làm
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Nhập nội dung bài làm của bạn..."
                  className="w-full h-80 p-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-base"
                />
              </div>
            </div>

            {/* Right Column - File Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-4">
                  Tải file lên
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-base text-gray-600 mb-5">
                    Kéo thả file vào đây hoặc click để chọn
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg text-base hover:bg-blue-700 transition-colors"
                  >
                    Chọn file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                  />
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <p className="text-base font-medium text-gray-700">File đã chọn:</p>
                    <div className="max-h-48 overflow-y-auto space-y-3">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg text-base">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <FileText className="w-6 h-6 text-gray-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-base"
          >
            Hủy
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (selectedFiles.length === 0 && !textContent.trim())}
            className="px-10 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base font-medium"
          >
            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      </div>
    </>
  );
}