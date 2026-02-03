import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Upload, 
  Link as LinkIcon, 
  MessageSquare, 
  Send, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';
import { CourseContentDto } from '../../api/CourseService';
import { useMySubmission, useSubmissionActions, useSubmissionComments } from '../../hooks/useAssignment';
import { AssignmentSubmissionDto } from '../../api/AssignmentService/assignmentService';

interface AssignmentViewerProps {
  content: CourseContentDto;
  onSubmissionUpdate: () => void;
}

export function AssignmentViewer({ content, onSubmissionUpdate }: AssignmentViewerProps) {
  const { submission, loading: submissionLoading, refetch: refetchSubmission } = useMySubmission(content.id);
  const { 
    loading: actionLoading, 
    error: actionError, 
    createSubmission, 
    updateSubmission, 
    submitAssignment, 
    unsubmitAssignment,
    clearError 
  } = useSubmissionActions();
  const { 
    comments, 
    createComment, 
    loading: commentsLoading 
  } = useSubmissionComments(submission?.id);

  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // Form states
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [links, setLinks] = useState<string[]>(['']);
  const [newComment, setNewComment] = useState('');

  // Initialize form with existing submission data
  useEffect(() => {
    if (submission && showSubmissionForm) {
      setTextContent(submission.textContent || '');
      setLinks(submission.links.length > 0 ? submission.links.map(l => l.url) : ['']);
    }
  }, [submission, showSubmissionForm]);

  // Clear error when component unmounts or changes
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      const submitData = {
        assignmentId: content.id,
        textContent: textContent.trim() || undefined,
        files: files ? Array.from(files) : undefined,
        links: links.filter(link => link.trim()).length > 0 ? links.filter(link => link.trim()) : undefined,
        saveAsDraft: isDraft
      };

      let result: AssignmentSubmissionDto | null = null;
      
      if (submission) {
        // Update existing submission
        result = await updateSubmission(submission.id, {
          textContent: submitData.textContent,
          files: submitData.files,
          links: submitData.links,
          saveAsDraft: isDraft
        });
      } else {
        // Create new submission
        result = await createSubmission(submitData);
      }

      if (result) {
        await refetchSubmission();
        setShowSubmissionForm(false);
        setFiles(null);
        onSubmissionUpdate();
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const handleFinalSubmit = async () => {
    if (!submission) return;
    
    const result = await submitAssignment(submission.id);
    if (result) {
      await refetchSubmission();
      onSubmissionUpdate();
    }
  };

  const handleUnsubmit = async () => {
    if (!submission) return;
    
    const result = await unsubmitAssignment(submission.id);
    if (result) {
      await refetchSubmission();
      onSubmissionUpdate();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !submission) return;
    
    const result = await createComment({
      submissionId: submission.id,
      content: newComment.trim(),
      isPrivate: false
    });
    
    if (result) {
      setNewComment('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = content.dueDate ? new Date() > new Date(content.dueDate) : false;
  const timeRemaining = content.dueDate ? new Date(content.dueDate).getTime() - new Date().getTime() : null;
  const daysRemaining = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : null;

  const isLoading = submissionLoading || actionLoading;

  if (submissionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Đang tải bài tập...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{content.title}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                {content.maxScore && (
                  <span>Điểm tối đa: {content.maxScore}</span>
                )}
                {content.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Hạn nộp: {new Date(content.dueDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          {submission && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              submission.status === 'Graded' 
                ? 'bg-blue-100 text-blue-800'
                : submission.status === 'Submitted'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {submission.status === 'Graded' ? 'Đã chấm điểm' :
               submission.status === 'Submitted' ? 'Đã nộp' : 'Bản nháp'}
            </div>
          )}
        </div>

        {/* Time Warning */}
        {!isOverdue && daysRemaining !== null && daysRemaining <= 3 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              {daysRemaining === 0 ? 'Hôm nay là hạn cuối nộp bài!' : 
               daysRemaining === 1 ? 'Còn 1 ngày để nộp bài!' :
               `Còn ${daysRemaining} ngày để nộp bài!`}
            </span>
          </div>
        )}

        {isOverdue && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Đã quá hạn nộp bài</span>
          </div>
        )}

        {/* Assignment Description */}
        {content.description && (
          <div className="prose max-w-none mb-4">
            <div dangerouslySetInnerHTML={{ __html: content.description }} />
          </div>
        )}

        {/* Error Display */}
        {actionError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{actionError}</span>
          </div>
        )}
      </div>

      {/* Submission Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Bài nộp của tôi</h4>
          {submission && submission.status !== 'Graded' && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 disabled:opacity-50"
              >
                <Edit3 className="w-4 h-4" />
                {submission ? 'Chỉnh sửa' : 'Tạo bài nộp'}
              </button>
              {submission && submission.status === 'Draft' && (
                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Nộp bài
                </button>
              )}
              {submission && submission.status === 'Submitted' && (
                <button
                  onClick={handleUnsubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  <Edit3 className="w-4 h-4" />
                  Hủy nộp
                </button>
              )}
            </div>
          )}
        </div>

        {/* Existing Submission Display */}
        {submission && !showSubmissionForm && (
          <div className="space-y-4">
            {/* Text Content */}
            {submission.textContent && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Nội dung văn bản:</h5>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{submission.textContent}</p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {submission.attachments.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">File đính kèm:</h5>
                <div className="space-y-2">
                  {submission.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{attachment.fileName}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {submission.links.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Liên kết:</h5>
                <div className="space-y-2">
                  {submission.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <LinkIcon className="w-5 h-5 text-gray-500" />
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 underline"
                      >
                        {link.title || link.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grade Display */}
            {submission.status === 'Graded' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-blue-900">Kết quả chấm điểm</h5>
                  <span className="text-2xl font-bold text-blue-900">
                    {submission.score}/{content.maxScore}
                  </span>
                </div>
                {submission.feedback && (
                  <p className="text-blue-800">{submission.feedback}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submission Form */}
        {showSubmissionForm && (
          <div className="space-y-4">
            {/* Text Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung văn bản
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Nhập nội dung bài nộp của bạn..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File đính kèm
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary-600 hover:text-primary-800"
                >
                  Chọn file để tải lên
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Hỗ trợ PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                </p>
              </div>
            </div>

            {/* Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Liên kết
              </label>
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = e.target.value;
                      setLinks(newLinks);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                  {index === links.length - 1 && (
                    <button
                      onClick={() => setLinks([...links, ''])}
                      className="px-3 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu nháp'}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Đang nộp...' : 'Nộp bài'}
              </button>
              <button
                onClick={() => setShowSubmissionForm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* No Submission State */}
        {!submission && !showSubmissionForm && (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Bạn chưa có bài nộp cho bài tập này</p>
            <button
              onClick={() => setShowSubmissionForm(true)}
              disabled={isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Tạo bài nộp
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {submission && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Bình luận ({comments.length})
            </h4>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-primary-600 hover:text-primary-800"
            >
              {showComments ? 'Ẩn' : 'Hiện'} bình luận
            </button>
          </div>

          {showComments && (
            <div className="space-y-4">
              {/* Existing Comments */}
              {comments.map(comment => (
                <div key={comment.id} className="border-l-4 border-primary-200 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className="text-sm text-gray-500">({comment.authorRole})</span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {comment.isPrivate && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Riêng tư
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}

              {commentsLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-gray-600">Đang tải bình luận...</span>
                </div>
              )}

              {/* Add Comment */}
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Thêm bình luận..."
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}