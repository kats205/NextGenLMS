import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Trash2, CheckCircle, Clock, AlertCircle, FileIcon } from 'lucide-react';
import { CourseContentDto } from '../../api/CourseService';
import { assignmentService } from '../../api/AssignmentService/assignmentService';

interface SimpleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: CourseContentDto;
  onSubmissionSuccess: () => void;
}

interface SubmissionInfo {
  id: string;
  status: string;
  submittedAt?: string;
  score?: number;
  feedback?: string;
  isLate: boolean;
  attemptNumber: number;
  textContent?: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    createdAt: string;
  }>;
  links: Array<{
    url: string;
    title?: string;
  }>;
}

export function SimpleAssignmentModal({ 
  isOpen, 
  onClose, 
  assignment, 
  onSubmissionSuccess 
}: SimpleAssignmentModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionInfo, setSubmissionInfo] = useState<SubmissionInfo | null>(null);
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false); // General loading state
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing submission when modal opens
  useEffect(() => {
    if (isOpen && assignment.id) {
      loadSubmissionInfo();
    }
  }, [isOpen, assignment.id]);

  // Load submission data into form when submissionInfo changes
  useEffect(() => {
    if (submissionInfo && submissionInfo.status?.toLowerCase() === 'draft') {
      // Load existing text content
      if (submissionInfo.textContent) {
        setTextContent(submissionInfo.textContent);
      }
      
      // Note: Files cannot be pre-loaded into file input for security reasons
      // But we can show existing files in the UI
    }
  }, [submissionInfo]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setTextContent('');
      setError(null);
      setIsLoadingAction(false);
    }
  }, [isOpen]);

  const loadSubmissionInfo = async () => {
    setIsLoadingSubmission(true);
    setError(null);
    try {
      console.log('🔍 Loading submission info for assignment:', assignment.id);
      const response = await assignmentService.getMySubmission(assignment.id);
      console.log('📥 Submission response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Submission data loaded:', response.data);
        setSubmissionInfo(response.data);
      } else {
        console.log('ℹ️ No submission found or error:', response.message);
        setSubmissionInfo(null);
      }
    } catch (error) {
      console.error('❌ Error loading submission:', error);
      setSubmissionInfo(null);
      setError('Không thể tải thông tin bài nộp');
    } finally {
      setIsLoadingSubmission(false);
    }
  };

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionStatusInfo = () => {
    if (!submissionInfo) return null;

    const isLateSubmission = submissionInfo.submittedAt && assignment.dueDate && 
      new Date(submissionInfo.submittedAt) > new Date(assignment.dueDate);
    
    let statusText = '';
    let statusColor = '';
    let statusIcon = null;

    const status = submissionInfo.status?.toLowerCase() || '';

    if (status === 'submitted') {
      if (isLateSubmission) {
        const lateMinutes = Math.floor((new Date(submissionInfo.submittedAt!).getTime() - new Date(assignment.dueDate!).getTime()) / (1000 * 60));
        const lateHours = Math.floor(lateMinutes / 60);
        const remainingMinutes = lateMinutes % 60;
        
        if (lateHours > 0) {
          statusText = `Đã nộp muộn ${lateHours} giờ ${remainingMinutes} phút`;
        } else {
          statusText = `Đã nộp muộn ${remainingMinutes} phút`;
        }
        statusColor = 'bg-orange-100 text-orange-800 border-orange-200';
        statusIcon = <Clock className="w-4 h-4" />;
      } else {
        statusText = 'Đã nộp đúng hạn';
        statusColor = 'bg-green-100 text-green-800 border-green-200';
        statusIcon = <CheckCircle className="w-4 h-4" />;
      }
    } else if (status === 'graded') {
      statusText = `Đã chấm điểm: ${submissionInfo.score}/${assignment.maxScore}`;
      statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
      statusIcon = <CheckCircle className="w-4 h-4" />;
    }

    return { statusText, statusColor, statusIcon, isLateSubmission };
  };

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

  // Handle immediate file deletion (for draft status only)
  const handleDeleteFileImmediately = async (fileId: string, fileName: string) => {
    if (!submissionInfo || submissionInfo.status?.toLowerCase() !== 'draft') {
      alert('Chỉ có thể xóa file khi bài nộp ở trạng thái nháp');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa file "${fileName}"?`)) {
      setIsLoadingAction(true);
      try {
        const response = await assignmentService.updateSubmission(submissionInfo.id, {
          removeAttachmentIds: [fileId],
          saveAsDraft: true
        });

        if (response.success) {
          alert('Đã xóa file thành công');
          // Reload submission info to refresh UI
          await loadSubmissionInfo();
          // Notify parent to reload
          onSubmissionSuccess();
        } else {
          alert(response.message || 'Có lỗi xảy ra khi xóa file');
        }
      } catch (error: any) {
        console.error('Error deleting file:', error);
        alert(error.message || 'Có lỗi xảy ra khi xóa file');
      } finally {
        setIsLoadingAction(false);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsLoadingAction(true);
    setError(null);

    try {
      let response;
      
      // If we have a draft submission, update it; otherwise create new
      if (submissionInfo && submissionInfo.status?.toLowerCase() === 'draft') {
        response = await assignmentService.updateSubmission(submissionInfo.id, {
          textContent: textContent || undefined,
          files: selectedFiles.length > 0 ? selectedFiles : undefined,
          saveAsDraft: false
        });
      } else {
        response = await assignmentService.createSubmission({
          assignmentId: assignment.id,
          textContent: textContent || undefined,
          files: selectedFiles.length > 0 ? selectedFiles : undefined,
          saveAsDraft: false
        });
      }

      if (response.success) {
        alert('Nộp bài thành công!');
        
        // Reset form
        setSelectedFiles([]);
        setTextContent('');
        
        // Notify parent to reload
        onSubmissionSuccess();
        
        // Reload submission info
        await loadSubmissionInfo();
        
        // Close modal
        onClose();
      } else {
        setError(response.message || 'Có lỗi xảy ra khi nộp bài');
      }
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      setError(error.message || 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setIsSubmitting(false);
      setIsLoadingAction(false);
    }
  };

  const statusInfo = getSubmissionStatusInfo();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[50000]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {isLoadingAction && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Đang xử lý...</p>
            </div>
          </div>
        )}
        {/* Header with Status */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{assignment.title}</h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">NEW UI</span>
                {isLoadingSubmission ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-500">Đang tải...</span>
                  </div>
                ) : statusInfo ? (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${statusInfo.statusColor}`}>
                    {statusInfo.statusIcon}
                    {statusInfo.statusText}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium bg-gray-100 text-gray-800 border-gray-200">
                    <AlertCircle className="w-4 h-4" />
                    Chưa nộp bài
                  </div>
                )}
              </div>
              
              {/* Submission Details */}
              {submissionInfo && (
                <div className="text-sm text-gray-600 space-y-1">
                  {submissionInfo.submittedAt && (
                    <div>
                      <span className="font-medium">Thời gian nộp:</span> {formatDateTime(submissionInfo.submittedAt)}
                    </div>
                  )}
                  {submissionInfo.attachments && submissionInfo.attachments.length > 0 && (
                    <div>
                      <span className="font-medium">File đã nộp:</span> {submissionInfo.attachments.length} file
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Show files from draft submission - Display like submitted files with delete option */}
          {submissionInfo && submissionInfo.attachments && submissionInfo.attachments.length > 0 && submissionInfo.status?.toLowerCase() === 'draft' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">File đã nộp:</h4>
              <div className="space-y-2">
                {submissionInfo.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.fileSize)} • {formatDateTime(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Tải xuống
                      </a>
                      <button
                        onClick={() => handleDeleteFileImmediately(file.id, file.fileName)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        disabled={isLoadingAction}
                        title="Xóa file"
                      >
                        {isLoadingAction ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm">
                <p className="text-blue-700">
                  💡 Bạn có thể xóa file cũ và thêm file mới. Thay đổi sẽ được lưu ngay lập tức.
                </p>
              </div>
            </div>
          )}

          {/* Show submitted files with NO delete option */}
          {submissionInfo && submissionInfo.attachments && submissionInfo.attachments.length > 0 && submissionInfo.status?.toLowerCase() === 'submitted' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">File đã nộp:</h4>
              <div className="space-y-2">
                {submissionInfo.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <FileIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.fileSize)} • {formatDateTime(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Tải xuống
                      </a>
                      {/* No delete button for submitted files */}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm">
                <p className="text-blue-700">
                  ℹ️ File đã nộp không thể xóa. Để thay đổi file, hãy hủy bài nộp trước.
                </p>
              </div>
            </div>
          )}

          {/* Show submitted text content if exists and not draft */}
          {submissionInfo && submissionInfo.textContent && submissionInfo.status?.toLowerCase() !== 'draft' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Nội dung đã nộp:</h4>
              <div className="text-gray-700 whitespace-pre-wrap">{submissionInfo.textContent}</div>
            </div>
          )}

          {/* Assignment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Điểm tối đa:</span>
                <span className="ml-2 text-blue-700">{assignment.maxScore}</span>
              </div>
              {assignment.dueDate && (
                <div>
                  <span className="font-medium text-blue-900">Hạn nộp:</span>
                  <span className="ml-2 text-blue-700">
                    {formatDateTime(assignment.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Submission Form - Only show if not submitted or allow resubmission */}
          {(!submissionInfo || submissionInfo.status?.toLowerCase() !== 'submitted') && (
            <div className="space-y-6">
              {/* Text Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung bài làm
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Nhập nội dung bài làm của bạn..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
              </div>

              {/* File Upload */}
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
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                  />
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">File đã chọn:</p>
                    {selectedFiles.map((file, index) => (
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

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isLoadingAction || (selectedFiles.length === 0 && !textContent.trim())}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {isSubmitting ? 'Đang nộp...' : submissionInfo ? 'Nộp lại' : 'Nộp bài'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Show message if already submitted */}
          {submissionInfo && submissionInfo.status?.toLowerCase() === 'submitted' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bài tập đã được nộp</h3>
              <p className="text-gray-600">
                Bạn đã nộp bài tập này vào {submissionInfo.submittedAt ? formatDateTime(submissionInfo.submittedAt) : 'thời gian không xác định'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}