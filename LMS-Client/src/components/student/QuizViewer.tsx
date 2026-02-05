import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, FileText, Upload } from 'lucide-react';
import { useQuiz, useQuizSubmission, formatTime } from '../../hooks/useQuiz';
import { QuestionType, QuestionSnapshotDto, quizService } from '../../api/QuizService/quizService';

interface QuizViewerProps {
  quizId: string;
}

export function QuizViewer({ quizId }: QuizViewerProps) {
  const navigate = useNavigate();
  const { quiz, loading: quizLoading, error: quizError } = useQuiz(quizId);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [showStartDialog, setShowStartDialog] = useState(true);

  const {
    submission,
    loading: submissionLoading,
    error: submissionError,
    timeRemaining,
    submitAnswer,
    submitEssay,
    submitQuiz,
    startQuiz
  } = useQuizSubmission(submissionId || undefined);

  const handleStartQuiz = async () => {
    if (!quizId) return;

    const result = await startQuiz(quizId);
    if (result) {
      setSubmissionId(result.id);
      setShowStartDialog(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (window.confirm('Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể sửa đổi sau khi nộp.')) {
      const result = await submitQuiz();
      if (result) {
        navigate(`/student/quiz-result/${result.id}`);
      }
    }
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Đang tải quiz...</div>
        </div>
      </div>
    );
  }

  if (quizError || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải quiz</h2>
          <p className="text-gray-500 mb-4">{quizError}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Show start dialog
  if (showStartDialog && !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <FileText className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Số câu hỏi:</span>
              <span className="font-medium">{quiz.questions.length}</span>
            </div>
            
            {quiz.durationMinutes > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium">{quiz.durationMinutes} phút</span>
              </div>
            )}

            {quiz.shuffleQuestions && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <CheckCircle className="w-4 h-4" />
                <span>Câu hỏi sẽ được trộn ngẫu nhiên</span>
              </div>
            )}

            {quiz.shuffleAnswers && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <CheckCircle className="w-4 h-4" />
                <span>Đáp án sẽ được trộn ngẫu nhiên</span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bài làm sẽ được tự động lưu định kỳ</li>
                  <li>Bạn chỉ có thể làm bài một lần</li>
                  {quiz.durationMinutes > 0 && (
                    <li>Bài sẽ tự động nộp khi hết thời gian</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={submissionLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submissionLoading ? 'Đang bắt đầu...' : 'Bắt đầu làm bài'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz interface
  if (submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <QuizInterface
          submission={submission}
          timeRemaining={timeRemaining}
          onSubmitAnswer={submitAnswer}
          onSubmitEssay={submitEssay}
          onSubmitQuiz={handleSubmitQuiz}
          onAutoSave={async () => {
            if (submissionId) {
              try {
                await quizService.autoSave(submissionId);
              } catch (error) {
                console.error('Auto-save failed:', error);
              }
            }
          }}
          error={submissionError}
        />
      </div>
    );
  }

  return null;
}

interface QuizInterfaceProps {
  submission: any;
  timeRemaining: number;
  onSubmitAnswer: (questionId: string, answer: string) => Promise<boolean>;
  onSubmitEssay: (questionId: string, text?: string, fileUrl?: string) => Promise<boolean>;
  onSubmitQuiz: () => void;
  onAutoSave: () => Promise<void>;
  error: string | null;
}

function QuizInterface({ 
  submission, 
  timeRemaining, 
  onSubmitAnswer, 
  onSubmitEssay, 
  onSubmitQuiz, 
  onAutoSave,
  error 
}: QuizInterfaceProps) {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essayTexts, setEssayTexts] = useState<Record<string, string>>({});

  const currentQuestion = submission.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === submission.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Initialize answers from submission
  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    const initialEssays: Record<string, string> = {};
    
    submission.questions.forEach((q: QuestionSnapshotDto) => {
      if (q.studentAnswer) {
        if (q.type === QuestionType.Essay) {
          initialEssays[q.questionId] = q.studentAnswer;
        } else {
          initialAnswers[q.questionId] = q.studentAnswer;
        }
      }
    });
    
    setAnswers(initialAnswers);
    setEssayTexts(initialEssays);
  }, [submission]);

  const handleMultipleChoiceAnswer = async (questionId: string, answerId: string) => {
    const newAnswer = JSON.stringify([answerId]);
    setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
    
    // Auto-save answer
    await onSubmitAnswer(questionId, newAnswer);
  };

  const handleEssayChange = (questionId: string, text: string) => {
    setEssayTexts(prev => ({ ...prev, [questionId]: text }));
  };

  const handleEssayBlur = async (questionId: string) => {
    const text = essayTexts[questionId];
    if (text !== undefined) {
      await onSubmitEssay(questionId, text);
    }
  };

  const getAnsweredCount = () => {
    return submission.questions.filter((q: QuestionSnapshotDto) => q.studentAnswer).length;
  };

  const getAllQuestionsAnswered = () => {
    return submission.questions.every((q: QuestionSnapshotDto) => q.studentAnswer);
  };

  const handleSubmitQuiz = () => {
    if (!getAllQuestionsAnswered()) {
      const unansweredCount = submission.questions.length - getAnsweredCount();
      alert(`Bạn cần trả lời tất cả ${submission.questions.length} câu hỏi trước khi nộp bài. Còn lại ${unansweredCount} câu chưa trả lời.`);
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể sửa đổi sau khi nộp.')) {
      onSubmitQuiz();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quiz đang diễn ra</h1>
          
          {timeRemaining > 0 && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Câu {currentQuestionIndex + 1} / {submission.questions.length}</span>
          <span>Đã trả lời: {getAnsweredCount()} / {submission.questions.length}</span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / submission.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
              {currentQuestionIndex + 1}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentQuestion.questionText}
              </h3>
              {currentQuestion.mediaUrl && (
                <img 
                  src={currentQuestion.mediaUrl} 
                  alt="Question media"
                  className="max-w-full h-auto rounded-lg mb-4"
                />
              )}
            </div>
          </div>
        </div>

        {/* Answer options */}
        {currentQuestion.type === QuestionType.MultipleChoice && (
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => {
              const isSelected = answers[currentQuestion.questionId] === JSON.stringify([answer.id]);
              
              return (
                <label
                  key={answer.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.questionId}`}
                    value={answer.id}
                    checked={isSelected}
                    onChange={() => handleMultipleChoiceAnswer(currentQuestion.questionId, answer.id)}
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="flex-1 text-gray-900">{answer.contentText}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Essay answer */}
        {currentQuestion.type === QuestionType.Essay && (
          <div className="space-y-4">
            <textarea
              value={essayTexts[currentQuestion.questionId] || ''}
              onChange={(e) => handleEssayChange(currentQuestion.questionId, e.target.value)}
              onBlur={() => handleEssayBlur(currentQuestion.questionId)}
              placeholder="Nhập câu trả lời của bạn..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
            />
            
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                <span>Tải file lên</span>
              </button>
              <span className="text-sm text-gray-500">
                Tự động lưu khi bạn rời khỏi ô nhập
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={isFirstQuestion}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Câu trước
        </button>

        <div className="flex gap-3">
          {/* Save and Exit button */}
          <button
            onClick={async () => {
              if (window.confirm('Bạn có muốn lưu bài làm và thoát? Bạn có thể tiếp tục làm bài sau.')) {
                // Auto-save current progress
                await onAutoSave();
                // Navigate back to course
                navigate(-1);
              }
            }}
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            💾 Lưu và Thoát
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(submission.questions.length - 1, prev + 1))}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Câu tiếp theo
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={!getAllQuestionsAnswered()}
              className={`px-6 py-2 rounded-lg font-medium ${
                getAllQuestionsAnswered()
                  ? 'bg-success-600 text-white hover:bg-success-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!getAllQuestionsAnswered() ? 'Bạn cần trả lời tất cả câu hỏi trước khi nộp bài' : ''}
            >
              Nộp bài
            </button>
          )}
        </div>
      </div>

      {/* Question navigation */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-medium text-gray-900 mb-4">Điều hướng câu hỏi</h4>
        <div className="grid grid-cols-10 gap-2">
          {submission.questions.map((q: QuestionSnapshotDto, index: number) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary-600 text-white'
                  : q.studentAnswer
                  ? 'bg-success-100 text-success-700 border border-success-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-600 rounded"></div>
            <span>Câu hiện tại</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success-100 border border-success-200 rounded"></div>
            <span>Đã trả lời</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>Chưa trả lời</span>
          </div>
        </div>
      </div>
    </div>
  );
}