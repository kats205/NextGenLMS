import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { CheckCircle2, Circle, FileText, Video, File, MessageSquare, ArrowLeft, Clock, Calendar, AlertCircle, Play, Download, Upload, CheckCircle, Trash2 } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { MediaViewer } from '../shared/MediaViewer';
import { SimpleAssignmentModal } from './SimpleAssignmentModal';
import { assignmentService } from '../../api/AssignmentService/assignmentService';
import { useNavigate, useParams } from 'react-router-dom';
import { useCourseDetail } from '../../hooks/useCourse';
import { useLessonProgress } from '../../hooks/useLessonProgress';
import { useQuizCompletionStatus } from '../../hooks/useQuiz';
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
  const [canMarkComplete, setCanMarkComplete] = useState(false);
  const [completeCountdown, setCompleteCountdown] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [watchedSeconds, setWatchedSeconds] = useState(0); // Tổng thời gian đã xem (để tính 70%)
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set()); // Quản lý chapters mở rộng
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Map<string, any>>(new Map()); // Cache submission info
  const [loadingAssignments, setLoadingAssignments] = useState<Set<string>>(new Set()); // Track loading assignments

  const { progress, updateProgress, markComplete } = useLessonProgress(selectedContent?.id);
  const { status: quizStatus } = useQuizCompletionStatus(
    selectedContent?.type === 'Quiz' ? selectedContent.id : undefined
  );

  // Function để toggle chapter expand/collapse
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // Function để load submission info cho assignment với force reload option
  const loadAssignmentSubmission = async (assignmentId: string, forceReload = false) => {
    if (!forceReload && assignmentSubmissions.has(assignmentId)) {
      return assignmentSubmissions.get(assignmentId);
    }

    setLoadingAssignments(prev => new Set([...prev, assignmentId]));

    try {
      const response = await assignmentService.getMySubmission(assignmentId);
      const submissionInfo = response.success && response.data ? response.data : null;
      
      setAssignmentSubmissions(prev => new Map(prev.set(assignmentId, submissionInfo)));
      return submissionInfo;
    } catch (error) {
      console.error('❌ Error loading submission:', error);
      setAssignmentSubmissions(prev => new Map(prev.set(assignmentId, null)));
      return null;
    } finally {
      setLoadingAssignments(prev => {
        const newSet = new Set(prev);
        newSet.delete(assignmentId);
        return newSet;
      });
    }
  };

  // Helper function để reload submission và force re-render
  const reloadSubmission = async (assignmentId: string) => {
    // Clear cache
    setAssignmentSubmissions(prev => {
      const newMap = new Map(prev);
      newMap.delete(assignmentId);
      return newMap;
    });
    
    // Force reload
    await loadAssignmentSubmission(assignmentId, true);
    
    // Force re-render
    setSelectedContent(prev => prev ? { ...prev } : prev);
  };

  // Calculate totals early to avoid hoisting issues
  const totalContents = course?.chapters ? course.chapters.reduce((acc, chapter) => 
    acc + chapter.contents.filter(content => content.type === 'Lesson').length, 0
  ) : 0;
  const completedCount = completedItems.length;

  // Set first content as selected when course loads
  useEffect(() => {
    if (course?.chapters && course.chapters.length > 0) {
      const firstChapter = course.chapters[0];
      if (firstChapter.contents && firstChapter.contents.length > 0) {
        setSelectedContent(firstChapter.contents[0]);
        // Mở rộng chapter đầu tiên
        setExpandedChapters(new Set([firstChapter.id]));
      }
    }
  }, [course]);

  // Mở rộng chapter chứa content được chọn
  useEffect(() => {
    if (selectedContent && course?.chapters) {
      const chapterContainingContent = course.chapters.find(chapter => 
        chapter.contents.some(content => content.id === selectedContent.id)
      );
      if (chapterContainingContent) {
        setExpandedChapters(prev => new Set([...prev, chapterContainingContent.id]));
      }
    }
  }, [selectedContent, course]);

  // Load completed items from existing lesson progress (only check, don't create)
  useEffect(() => {
    if (!course?.chapters) return;

    const loadCompletedItems = async () => {
      try {
        // Import the service dynamically to avoid circular dependencies
        const { lessonProgressService } = await import('../../api/LessonProgressService/lessonProgressService');
        
        // Collect all lesson IDs
        const lessonIds: string[] = [];
        for (const chapter of course.chapters) {
          for (const content of chapter.contents) {
            if (content.type === 'Lesson') {
              lessonIds.push(content.id);
            }
          }
        }

        console.log('🔍 Loading completed items for lessons:', lessonIds);

        // Check progress for all lessons in parallel
        const progressChecks = lessonIds.map(async (lessonId) => {
          try {
            const result = await lessonProgressService.checkProgress(lessonId);
            const isCompleted = result.success && result.data && result.data.isCompleted === true;
            console.log(`📋 Lesson ${lessonId}: completed=${isCompleted}`, result.data);
            return {
              lessonId,
              isCompleted
            };
          } catch (error) {
            console.log(`No progress found for lesson ${lessonId} (this is normal)`);
            return { lessonId, isCompleted: false };
          }
        });

        const results = await Promise.all(progressChecks);
        const completed = results
          .filter(result => result.isCompleted)
          .map(result => result.lessonId);
        
        console.log('✅ Initial completed items loaded:', completed);
        setCompletedItems(completed);
      } catch (error) {
        console.error('Error loading completed items:', error);
      }
    };

    loadCompletedItems();
  }, [course]);

  // Update completed items when current lesson progress changes - only if actually completed
  useEffect(() => {
    // KHÔNG tự động thêm vào completedItems dựa trên progress
    // Chỉ cập nhật khi user thực sự mark complete thông qua handleMarkComplete
    // Effect này chỉ để log, không update state
    if (progress && selectedContent && progress.isCompleted === true) {
      console.log('📊 Lesson progress loaded - already completed in database:', selectedContent.id, progress);
      // KHÔNG update completedItems ở đây để tránh case 1
    }
  }, [progress?.isCompleted, selectedContent?.id]);

  // Load assignment submission when selectedContent changes
  useEffect(() => {
    if (selectedContent?.type === 'Assignment') {
      loadAssignmentSubmission(selectedContent.id);
    }
  }, [selectedContent?.id]);

  // Reset watching state when switching lessons
  useEffect(() => {
    console.log('🔄 Switching to content:', selectedContent?.id, selectedContent?.title);
    setIsWatching(false);
    setCanMarkComplete(false);
    setCompleteCountdown(0);
    setWatchedSeconds(0);
    
    // If switching to a completed lesson, show video directly (không set isWatching = true)
    // Để video hoàn thành hiển thị như ảnh, không có logic phức tạp
  }, [selectedContent?.id]);

  // Khôi phục vị trí video khi progress được tải - sử dụng DurationLastAccessSeconds
  useEffect(() => {
    if (progress && selectedContent?.fileType === 'Video' && progress.durationLastAccessSeconds > 0) {
      // Restore vị trí video từ DurationLastAccessSeconds
      setTimeout(() => {
        const videoElement = document.querySelector('video') as HTMLVideoElement;
        if (videoElement && Math.abs(videoElement.currentTime - progress.durationLastAccessSeconds) > 2) {
          videoElement.currentTime = progress.durationLastAccessSeconds;
          console.log(`Restored video position to ${progress.durationLastAccessSeconds} seconds`);
        }
      }, 1000); // Tăng delay để đảm bảo video đã load
    }
  }, [selectedContent?.id, progress?.durationLastAccessSeconds]); // Chỉ chạy khi chuyển lesson hoặc position thay đổi

  // Update countdown based on actual video progress - chỉ khi chưa hoàn thành
  useEffect(() => {
    if (isWatching && 
        selectedContent?.fileType === 'Video' && 
        selectedContent.durationSeconds && 
        !completedItems.includes(selectedContent.id) && // Chỉ chạy khi chưa hoàn thành
        watchedSeconds !== undefined
    ) {
      const requiredSeconds = Math.floor(selectedContent.durationSeconds * 0.7);
      const remainingSeconds = Math.max(0, requiredSeconds - watchedSeconds);
      
      // Chỉ update countdown nếu thay đổi đáng kể (tránh update liên tục)
      if (Math.abs(completeCountdown - remainingSeconds) > 1 && remainingSeconds > 3) {
        console.log(`📺 Updating countdown based on progress. Watched: ${watchedSeconds}s, Required: ${requiredSeconds}s, Remaining: ${remainingSeconds}s`);
        setCompleteCountdown(remainingSeconds);
      } else if (remainingSeconds === 0 && !canMarkComplete) {
        // Đã đạt 70%, bắt đầu countdown cuối
        setCanMarkComplete(true);
        setCompleteCountdown(3);
      }
    }
  }, [watchedSeconds, completedItems]); // Sử dụng watchedSeconds thay vì progress.videoProgressSeconds

  // Start countdown immediately when watching video (based on remaining time to 70%)
  useEffect(() => {
    if (isWatching && 
        selectedContent?.fileType === 'Video' && 
        selectedContent.durationSeconds && 
        !completedItems.includes(selectedContent.id) &&
        completeCountdown === 0 // Chỉ chạy khi chưa có countdown
    ) {
      const requiredSeconds = Math.floor(selectedContent.durationSeconds * 0.7);
      const currentProgress = progress?.videoProgressSeconds || 0;
      const remainingSeconds = Math.max(0, requiredSeconds - currentProgress);
      
      console.log(`📺 Video watching started. Required: ${requiredSeconds}s, Current: ${currentProgress}s, Remaining: ${remainingSeconds}s`);
      
      // Khởi tạo watchedSeconds từ progress
      setWatchedSeconds(currentProgress);
      
      if (remainingSeconds === 0) {
        // Already watched 70%, can mark complete immediately
        setCanMarkComplete(true);
        setCompleteCountdown(3); // Start 3-second countdown
      } else {
        // Start countdown from remaining time
        setCompleteCountdown(remainingSeconds);
      }
    }
  }, [isWatching, selectedContent?.id]); // Chỉ chạy khi bắt đầu watching hoặc chuyển lesson

  // Countdown timer - counts down to when user can mark complete
  useEffect(() => {
    if (completeCountdown > 0 && 
        isWatching && 
        selectedContent?.fileType === 'Video' &&
        !completedItems.includes(selectedContent.id) // Stop countdown nếu đã hoàn thành
    ) {
      const timer = setInterval(() => {
        setCompleteCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanMarkComplete(true);
            return 3; // Start final 3-second countdown for auto-complete
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [completeCountdown, isWatching, selectedContent, completedItems]); // Thêm completedItems

  // Auto mark complete when final countdown reaches 0
  useEffect(() => {
    if (canMarkComplete && 
        completeCountdown <= 3 && 
        completeCountdown > 0 && 
        selectedContent && 
        !completedItems.includes(selectedContent.id)
    ) {
      const timer = setInterval(() => {
        setCompleteCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto mark complete
            markComplete().then(() => {
              setCompletedItems(prevItems => {
                const newCompleted = [...prevItems, selectedContent.id];
                console.log('📊 Auto-completed, updated items:', newCompleted);
                return newCompleted;
              });
              setIsWatching(false);
              setCanMarkComplete(false);
              setCompleteCountdown(0);
            }).catch(error => {
              console.error('Error auto-marking complete:', error);
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [canMarkComplete, completeCountdown, selectedContent?.id, completedItems, markComplete]); // Sử dụng selectedContent.id thay vì selectedContent

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

  const handleMarkComplete = async () => {
    if (!selectedContent || completedItems.includes(selectedContent.id)) return;

    try {
      console.log('🎯 Attempting to mark lesson complete:', selectedContent.id);
      await markComplete();
      console.log('✅ Lesson marked complete successfully');
      
      // Chỉ update completedItems sau khi API call thành công
      setCompletedItems(prev => {
        if (prev.includes(selectedContent.id)) {
          console.log('⚠️ Lesson already in completed items, skipping');
          return prev;
        }
        const newCompleted = [...prev, selectedContent.id];
        console.log('📊 Updated completed items via handleMarkComplete:', newCompleted);
        return newCompleted;
      });
      
      // Reset video states
      if (selectedContent.fileType === 'Video') {
        setIsWatching(false);
        setCanMarkComplete(false);
        setCompleteCountdown(0);
      }
    } catch (error) {
      console.error('💥 Error in handleMarkComplete:', error);
      
      // Kiểm tra xem có phải lesson đã được đánh dấu hoàn thành trong database không
      try {
        const { lessonProgressService } = await import('../../api/LessonProgressService/lessonProgressService');
        const progressCheck = await lessonProgressService.checkProgress(selectedContent.id);
        
        if (progressCheck.success && progressCheck.data && progressCheck.data.isCompleted) {
          console.log('✅ Lesson was actually completed in database, updating UI');
          setCompletedItems(prev => {
            if (!prev.includes(selectedContent.id)) {
              const newCompleted = [...prev, selectedContent.id];
              console.log('📊 Updated completed items via error recovery:', newCompleted);
              return newCompleted;
            }
            return prev;
          });
          return; // Don't show error if it was actually successful
        }
      } catch (checkError) {
        console.error('Error checking progress after failed mark complete:', checkError);
      }
      
      alert('Có lỗi xảy ra khi đánh dấu hoàn thành. Vui lòng thử lại.');
    }
  };

  const handleStartWatching = async () => {
    if (selectedContent?.fileType === 'Video' && selectedContent.durationSeconds) {
      setIsWatching(true);
      setCanMarkComplete(false); // Reset this when starting to watch
      setCompleteCountdown(0); // Reset countdown
      
      // Auto-play video sau khi component re-render
      setTimeout(() => {
        const videoElement = document.querySelector('video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.play().catch(error => {
            console.error('Auto-play failed:', error);
          });
        }
      }, 100);
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

  const renderAssignmentContent = (content: CourseContentDto) => {
    // Use parsed attachments from backend instead of parsing locally
    const attachments = content.attachments || [];
    const submissionInfo = assignmentSubmissions.get(content.id);
    const isLoadingSubmission = loadingAssignments.has(content.id);
    const isOverdue = content.dueDate && new Date() > new Date(content.dueDate);
    
    // Get submission status info
    const getSubmissionStatusInfo = () => {
      
      if (!submissionInfo) {
        console.log('⚠️ No submission info found');
        return {
          statusText: 'Chưa nộp bài',
          statusColor: 'bg-gray-100 text-gray-800'
        };
      }

      // Safe check for status
      const status = submissionInfo.status?.toLowerCase() || '';
      console.log('📊 Status extracted:', status);
      
      if (!status) {
        console.log('⚠️ No status found in submission info');
        return {
          statusText: 'Chưa nộp bài',
          statusColor: 'bg-gray-100 text-gray-800'
        };
      }
      
      const isLateSubmission = submissionInfo.submittedAt && content.dueDate && 
        new Date(submissionInfo.submittedAt) > new Date(content.dueDate);
      
      let statusText = '';
      let statusColor = '';

      if (status === 'submitted') {
        if (isLateSubmission) {
          const lateMinutes = Math.floor((new Date(submissionInfo.submittedAt).getTime() - new Date(content.dueDate!).getTime()) / (1000 * 60));
          const lateHours = Math.floor(lateMinutes / 60);
          const remainingMinutes = lateMinutes % 60;
          
          if (lateHours > 0) {
            statusText = `Đã nộp muộn ${lateHours} giờ ${remainingMinutes} phút`;
          } else {
            statusText = `Đã nộp muộn ${remainingMinutes} phút`;
          }
          statusColor = 'bg-orange-100 text-orange-800';
        } else {
          statusText = 'Đã nộp đúng hạn';
          statusColor = 'bg-green-100 text-green-800';
        }
      } else if (status === 'graded') {
        statusText = `Đã chấm điểm: ${submissionInfo.score}/${content.maxScore}`;
        statusColor = 'bg-blue-100 text-blue-800';
      } else if (status === 'draft') {
        statusText = 'Đã hủy bài nộp';
        statusColor = 'bg-yellow-100 text-yellow-800';
      } else {
        statusText = 'Chưa nộp bài';
        statusColor = 'bg-gray-100 text-gray-800';
      }

      console.log('📊 Final status info:', { statusText, statusColor });
      return { statusText, statusColor };
    };

    // Handle unsubmit assignment
    const handleUnsubmitAssignment = async () => {
      if (!submissionInfo || !submissionInfo.id) return;

      if (isOverdue) {
        alert('Không thể hủy bài nộp sau hạn nộp');
        return;
      }

      if (confirm('Bạn có chắc chắn muốn hủy bài nộp này? Bài nộp sẽ chuyển về trạng thái nháp và bạn có thể chỉnh sửa lại.')) {
        try {
          const response = await assignmentService.unsubmitAssignment(submissionInfo.id);
          if (response.success) {
            alert('Đã hủy bài nộp thành công');
            // Reload submission
            await reloadSubmission(content.id);
          } else {
            alert(response.message || 'Có lỗi xảy ra khi hủy bài nộp');
          }
        } catch (error: any) {
          console.error('Error unsubmitting assignment:', error);
          alert(error.message || 'Có lỗi xảy ra khi hủy bài nộp');
        }
      }
    };

    // Handle delete file from draft assignment (only allowed for draft status)
    const handleDeleteSubmittedFile = async (fileId: string, fileName: string) => {
      if (!submissionInfo || !submissionInfo.id) return;

      // Only allow deletion for draft status
      if (submissionInfo.status?.toLowerCase() !== 'draft') {
        alert('Chỉ có thể xóa file khi bài nộp ở trạng thái nháp');
        return;
      }

      if (confirm(`Bạn có chắc chắn muốn xóa file "${fileName}"?`)) {
        try {
          setLoadingAssignments(prev => new Set([...prev, content.id]));
          
          const response = await assignmentService.updateSubmission(submissionInfo.id, {
            removeAttachmentIds: [fileId],
            saveAsDraft: true
          });
          
          if (response.success) {
            alert('Đã xóa file thành công');
            // Reload submission
            await reloadSubmission(content.id);
          } else {
            alert(response.message || 'Có lỗi xảy ra khi xóa file');
          }
        } catch (error: any) {
          console.error('Error deleting file:', error);
          alert(error.message || 'Có lỗi xảy ra khi xóa file');
        } finally {
          setLoadingAssignments(prev => {
            const newSet = new Set(prev);
            newSet.delete(content.id);
            return newSet;
          });
        }
      }
    };

    const statusInfo = getSubmissionStatusInfo();
    console.log('📊 Status info result:', statusInfo);
    const canUnsubmit = submissionInfo && 
                       submissionInfo.status?.toLowerCase() === 'submitted' && 
                       !isOverdue;
    
    return (
      <div className="py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Header with Status */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">Bài tập tự luận</h3>
                {isLoadingSubmission ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm text-gray-600">Đang tải...</span>
                  </div>
                ) : statusInfo ? (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.statusColor}`}>
                    {statusInfo.statusText}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Chưa nộp bài
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                {content.maxScore && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Điểm tối đa:</span>
                    <span>{content.maxScore}</span>
                  </div>
                )}
                {content.maxAttempts && content.maxAttempts > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Số lần nộp:</span>
                    <span>{content.maxAttempts}</span>
                  </div>
                )}
              </div>
              
              {/* Submission Details - Show for both submitted and draft */}
              {submissionInfo && (
                <div className="text-sm text-gray-600 space-y-1">
                  {submissionInfo.submittedAt && (
                    <div>
                      <span className="font-medium">Thời gian nộp:</span> {new Date(submissionInfo.submittedAt).toLocaleString('vi-VN')}
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
          </div>

          {/* Show submitted files (only for submitted status - no delete option) */}
          {submissionInfo && submissionInfo.attachments && submissionInfo.attachments.length > 0 && submissionInfo.status?.toLowerCase() === 'submitted' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">File đã nộp:</h4>
              <div className="space-y-2">
                {submissionInfo.attachments.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleString('vi-VN')}
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
            </div>
          )}

          {/* Debug info - temporary */}
          {process.env.NODE_ENV === 'development' && submissionInfo && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>Debug Info:</strong><br/>
              Status: {submissionInfo.status}<br/>
              Attachments: {submissionInfo.attachments?.length || 0}<br/>
              {submissionInfo.attachments?.map((file: any, i: number) => (
                <div key={i}>File {i+1}: {file.fileName}</div>
              ))}
            </div>
          )}

          {/* Show draft files (with delete option) */}
          {/* Show draft files (with delete option) */}
          {(() => {
            const isDraft = submissionInfo?.status?.toLowerCase() === 'draft';
            const hasAttachments = submissionInfo?.attachments && submissionInfo.attachments.length > 0;
            
            console.log('🔍 Draft files check:', {
              hasSubmissionInfo: !!submissionInfo,
              status: submissionInfo?.status,
              statusLower: submissionInfo?.status?.toLowerCase(),
              isDraft,
              hasAttachments,
              attachmentsLength: submissionInfo?.attachments?.length,
              shouldShow: submissionInfo && hasAttachments && isDraft
            });
            
            return submissionInfo && hasAttachments && isDraft;
          })() && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">File đã nộp:</h4>
              <div className="space-y-2">
                {submissionInfo.attachments.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleString('vi-VN')}
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
                        onClick={() => handleDeleteSubmittedFile(file.id, file.fileName)}
                        disabled={isLoadingSubmission}
                        className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa file"
                      >
                        {isLoadingSubmission ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Description */}
          {content.description && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Mô tả bài tập</h4>
              <div className="prose max-w-none text-gray-700">
                <p>{content.description}</p>
              </div>
            </div>
          )}

          {/* Assignment Instructions */}
          {content.instructions && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Hướng dẫn làm bài</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="prose max-w-none text-blue-800">
                  <p>{content.instructions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Teacher's Reference Files */}
          {attachments.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Tài liệu tham khảo từ giảng viên</h4>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <File className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải xuống</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Requirements */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Yêu cầu nộp bài</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${content.requireTextSubmission ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={content.requireTextSubmission ? 'text-gray-900' : 'text-gray-500'}>
                    Nộp văn bản {content.requireTextSubmission ? '(Bắt buộc)' : '(Không bắt buộc)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${content.allowFileSubmission ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={content.allowFileSubmission ? 'text-gray-900' : 'text-gray-500'}>
                    Nộp file {content.allowFileSubmission ? '(Được phép)' : '(Không được phép)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${content.allowLinkSubmission ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={content.allowLinkSubmission ? 'text-gray-900' : 'text-gray-500'}>
                    Nộp link {content.allowLinkSubmission ? '(Được phép)' : '(Không được phép)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${content.allowLateSubmission ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className={content.allowLateSubmission ? 'text-gray-900' : 'text-gray-500'}>
                    Nộp trễ {content.allowLateSubmission ? `(Phạt ${content.latePenaltyPercent}%/ngày)` : '(Không được phép)'}
                  </span>
                </div>
              </div>
              
              {content.allowedFileTypes && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    <strong>Định dạng file cho phép:</strong> {content.allowedFileTypes}
                  </span>
                </div>
              )}
              
              {content.maxFileSize && content.maxFileSize > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    <strong>Kích thước file tối đa:</strong> {formatFileSize(content.maxFileSize)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Assignment Buttons */}
          <div className="flex items-center gap-4">
            {/* Chỉ hiển thị button upload khi chưa nộp hoặc ở trạng thái draft */}
            {(!submissionInfo || submissionInfo.status?.toLowerCase() === 'draft' || !submissionInfo.status) && (
              <button
                onClick={() => {
                  console.log('Submit button clicked, opening modal...');
                  console.log('Current assignment:', content);
                  setShowSubmissionModal(true);
                }}
                disabled={isLoadingSubmission}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoadingSubmission ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                <span>
                  {isLoadingSubmission 
                    ? 'Đang tải...'
                    : submissionInfo?.status?.toLowerCase() === 'draft' 
                      ? 'Nộp bài tập' 
                      : 'Nộp bài tập'
                  }
                </span>
              </button>
            )}

            {/* Button xám khi đã nộp bài */}
            {submissionInfo && submissionInfo.status?.toLowerCase() === 'submitted' && (
              <button
                disabled
                className="flex items-center gap-2 px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-75"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Đã nộp bài</span>
              </button>
            )}
            
            {canUnsubmit && !isLoadingSubmission && (
              <button
                onClick={handleUnsubmitAssignment}
                className="flex items-center gap-2 px-6 py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Hủy bài nộp</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContentViewer = (content: CourseContentDto) => {
    console.log("Content data:", {
      id: content.id,
      title: content.title,
      type: content.type,
      fileUrl: content.fileUrl,
      fileType: content.fileType
    });
    
    switch (content.type) {
      case 'Lesson':
        if (content.fileType === 'Video' && content.fileUrl) {
          console.log("Rendering video with URL:", content.fileUrl);
          console.log("Video file type:", content.fileType);
          console.log("Content type:", content.type);
          
          // Show video directly if lesson is completed or user is watching
          const isCompleted = completedItems.includes(content.id);
          
          if (!isWatching && !isCompleted) {
            return (
              <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg aspect-video mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                <Play className="w-20 h-20 text-white mb-4 relative z-10 transition-all duration-300 hover:scale-110" />
                <button
                  onClick={handleStartWatching}
                  className="btn-animated relative z-10 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
                >
                  Xem bài giảng
                </button>
              </div>
            );
          }

          // Nếu đã hoàn thành, hiển thị video đơn giản như ảnh (không có progress tracking)
          if (isCompleted) {
            return (
              <div>
                <MediaViewer
                  type="video"
                  src={content.fileUrl}
                  title={content.title}
                  className="aspect-video mb-6"
                  durationSeconds={content.durationSeconds || 0}
                  // Không có onProgressUpdate và onCanMarkComplete để tránh case 1
                />
              </div>
            );
          }

          // Nếu đang watching (chưa hoàn thành), có progress tracking
          return (
            <div>
              <MediaViewer
                type="video"
                src={content.fileUrl}
                title={content.title}
                className="aspect-video mb-6"
                durationSeconds={content.durationSeconds || 0}
                onProgressUpdate={(currentTime) => {
                  // Chỉ cập nhật khi có thay đổi đáng kể (tránh spam API)
                  if (currentTime > 0 && Math.floor(currentTime) % 5 === 0) { // Cập nhật mỗi 5 giây
                    setWatchedSeconds(prev => {
                      const newWatched = Math.max(prev, currentTime);
                      // Chỉ gọi API khi có thay đổi
                      if (newWatched !== prev || Math.abs(currentTime - (progress?.durationLastAccessSeconds || 0)) > 5) {
                        console.log(`📹 Updating progress: watched=${newWatched}s, position=${currentTime}s`);
                        updateProgress({ 
                          videoProgressSeconds: Math.floor(newWatched), // Thời gian xem tích lũy
                          durationLastAccessSeconds: Math.floor(currentTime) // Vị trí hiện tại
                        }).catch(error => {
                          console.error('Error updating progress:', error);
                        });
                      }
                      return newWatched;
                    });
                  }
                }}
                onCanMarkComplete={setCanMarkComplete}
              />
            </div>
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
        console.log('Rendering Quiz content:', content);
        console.log('Quiz completion status:', quizStatus);
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

            {/* Quiz completion status */}
            {quizStatus && (
              <div className="mb-6">
                {quizStatus.isCompleted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Đã hoàn thành</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Điểm số: {quizStatus.score?.toFixed(1) || 0}/100
                    </p>
                    {quizStatus.completedAt && (
                      <p className="text-xs text-green-500 mt-1">
                        Hoàn thành lúc: {new Date(quizStatus.completedAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                ) : quizStatus.hasInProgress ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-yellow-700 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Đang làm bài</span>
                    </div>
                    <p className="text-sm text-yellow-600">
                      Bạn có bài làm chưa hoàn thành. Tiếp tục làm bài để hoàn thành.
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                      <Circle className="w-5 h-5" />
                      <span className="font-medium">Chưa làm bài</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Bạn chỉ có một lần làm bài. Hãy chuẩn bị kỹ trước khi bắt đầu.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 space-y-3">
              {quizStatus?.isCompleted ? (
                <div className="text-gray-500 italic">
                  Quiz đã hoàn thành. Bạn không thể làm lại.
                </div>
              ) : (
                <button 
                  onClick={() => {
                    console.log('Quiz button clicked, navigating to:', `/student/quiz/${content.id}`);
                    navigate(`/student/quiz/${content.id}`);
                  }}
                  style={{ 
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                    minWidth: '160px',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                >
                  {quizStatus?.hasInProgress ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
                </button>
              )}
            </div>
            
            {/* Debug info */}
            <div className="mt-4 text-xs text-gray-400">
              Quiz ID: {content.id}
            </div>
          </div>
        );

      case 'Assignment':
        console.log('Rendering Assignment content:', content);
        return renderAssignmentContent(content);

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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{course.name}</h3>
                  <button
                    onClick={() => {
                      if (expandedChapters.size === course.chapters.length) {
                        // Collapse all
                        setExpandedChapters(new Set());
                      } else {
                        // Expand all
                        setExpandedChapters(new Set(course.chapters.map(c => c.id)));
                      }
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-all duration-200 ease-out hover:scale-105 px-2 py-1 rounded-md hover:bg-primary-50"
                    title={expandedChapters.size === course.chapters.length ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                  >
                    <span className="transition-all duration-200">
                      {expandedChapters.size === course.chapters.length ? "Thu gọn" : "Mở rộng"}
                    </span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {completedCount}/{totalContents} bài học hoàn thành
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-700 ease-out transform origin-left" 
                    style={{ 
                      width: `${totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0}%`,
                      '--progress-width': `${totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0}%`
                    } as React.CSSProperties}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0}% hoàn thành
                </p>
              </div>

              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {course.chapters.map(chapter => {
                  const isExpanded = expandedChapters.has(chapter.id);
                  const chapterCompletedCount = chapter.contents.filter(content => 
                    content.type === 'Lesson' && completedItems.includes(content.id)
                  ).length;
                  const chapterTotalLessons = chapter.contents.filter(content => content.type === 'Lesson').length;
                  
                  return (
                    <div key={chapter.id} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-all duration-200 ease-out text-left hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{chapter.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">
                                {chapter.contents.length} nội dung
                              </p>
                              {chapterTotalLessons > 0 && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <p className="text-xs text-gray-500">
                                    {chapterCompletedCount}/{chapterTotalLessons} hoàn thành
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-2">
                            <svg 
                              className={`w-4 h-4 text-gray-500 transition-all duration-300 ease-out ${
                                isExpanded ? 'rotate-90 text-primary-600' : 'rotate-0'
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              style={{
                                transformOrigin: 'center'
                              }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                      
                      {/* Chapter contents với smooth animation */}
                      {isExpanded && (
                        <div 
                          className="bg-white animate-in slide-in-from-top-2 duration-500 ease-out"
                          style={{
                            animation: 'slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
                          }}
                        >
                          {chapter.contents.map((content, index) => {
                            const isCompleted = completedItems.includes(content.id);
                            const isSelected = selectedContent?.id === content.id;
                            return (
                              <button
                                key={content.id}
                                onClick={() => setSelectedContent(content)}
                                className={`w-full flex items-start gap-3 p-3 text-left transition-all duration-200 ease-out ${
                                  isSelected
                                    ? 'bg-primary-50 border-l-4 border-primary-600 scale-[1.01] shadow-sm'
                                    : 'hover:bg-gray-50 border-l-4 border-transparent hover:scale-[1.005] hover:shadow-sm'
                                }`}
                                style={{
                                  animation: `contentFadeIn 0.3s ease-out ${index * 50}ms both`
                                }}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5 transition-all duration-200" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5 transition-all duration-200 hover:text-gray-400" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {getContentIcon(content)}
                                    <span className={`text-sm line-clamp-2 transition-all duration-200 ${
                                      isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                                    }`}>
                                      {content.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="capitalize">
                                      {content.type === 'Lesson' ? 'Bài giảng' : 
                                       content.type === 'Quiz' ? 'Bài kiểm tra' :
                                       content.type === 'Assignment' ? 'Bài tập' :
                                       content.type === 'Announcement' ? 'Thông báo' : content.type}
                                    </span>
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
                      )}
                    </div>
                  );
                })}
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

                    {/* Action Buttons - Always show for lessons */}
                    {selectedContent.type === 'Lesson' && (
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleMarkComplete}
                          disabled={
                            completedItems.includes(selectedContent.id) || 
                            completeCountdown > 0 ||
                            (selectedContent.fileType === 'Video' && !canMarkComplete && !completedItems.includes(selectedContent.id))
                          }
                          className={`btn-animated flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ease-out transform ${
                            completedItems.includes(selectedContent.id)
                              ? 'bg-success-600 text-white cursor-default hover:bg-success-700'
                              : canMarkComplete && completeCountdown <= 3 && completeCountdown > 0
                              ? 'bg-warning-500 text-white cursor-not-allowed animate-pulse'
                              : completeCountdown > 3
                              ? 'bg-primary-500 text-white cursor-not-allowed'
                              : (selectedContent.fileType === 'Video' && !canMarkComplete && !completedItems.includes(selectedContent.id))
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 active:scale-95'
                          }`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {completedItems.includes(selectedContent.id) 
                            ? 'Đã hoàn thành' 
                            : canMarkComplete && completeCountdown <= 3 && completeCountdown > 0
                            ? `Đánh dấu hoàn thành trong ${completeCountdown}s`
                            : completeCountdown > 3
                            ? `Xem thêm ${Math.floor(completeCountdown / 60)}:${(completeCountdown % 60).toString().padStart(2, '0')} để hoàn thành`
                            : selectedContent.fileType === 'Video' && !canMarkComplete && !completedItems.includes(selectedContent.id)
                            ? 'Xem 70% video để hoàn thành'
                            : 'Đánh dấu hoàn thành'}
                        </button>

                        <button
                          onClick={() => setShowFeedback(!showFeedback)}
                          className="btn-animated flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
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
                          <button className="btn-animated px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all duration-300 ease-out">
                            Gửi phản hồi
                          </button>
                          <button 
                            onClick={() => setShowFeedback(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
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

      {/* Assignment Submission Modal */}
      {selectedContent?.type === 'Assignment' && (
        <SimpleAssignmentModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          assignment={selectedContent}
          onSubmissionSuccess={() => {
            console.log('Assignment submitted successfully');
            // Refresh submission info
            if (selectedContent) {
              loadAssignmentSubmission(selectedContent.id);
            }
          }}
        />
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded">
          <div>Selected: {selectedContent?.type}</div>
          <div>Modal: {showSubmissionModal ? 'Open' : 'Closed'}</div>
          <div>Assignment ID: {selectedContent?.type === 'Assignment' ? selectedContent.id : 'N/A'}</div>
        </div>
      )}
    </div>
  );
}