import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, FileText, ArrowLeft } from 'lucide-react';
import { useQuizSubmission } from '../../hooks/useQuiz';
import { QuestionType } from '../../api/QuizService/quizService';

export function QuizResult() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { submission, loading, error } = useQuizSubmission(submissionId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Đang tải kết quả...</div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải kết quả</h2>
          <p className="text-gray-500 mb-4">{error}</p>
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

  const totalQuestions = submission.questions.length;
  const multipleChoiceQuestions = submission.questions.filter(q => q.type === QuestionType.MultipleChoice);
  const essayQuestions = submission.questions.filter(q => q.type === QuestionType.Essay);
  const correctAnswers = multipleChoiceQuestions.filter(q => q.isCorrect).length;
  const totalPoints = submission.questions.reduce((sum, q) => sum + q.pointsAchieved, 0);
  const maxPoints = submission.questions.length * 10; // Assuming 10 points per question

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-100 border-green-200';
    if (percentage >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Kết quả Quiz</h1>
        </div>

        {/* Score Summary */}
        <div className={`bg-white rounded-xl shadow-sm border-2 p-8 mb-8 ${getScoreBgColor(totalPoints, maxPoints)}`}>
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
              {totalPoints >= maxPoints * 0.8 ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {totalPoints >= maxPoints * 0.8 ? 'Chúc mừng!' : 'Cần cố gắng thêm'}
            </h2>
            
            <div className={`text-4xl font-bold mb-4 ${getScoreColor(totalPoints, maxPoints)}`}>
              {totalPoints.toFixed(1)} / {maxPoints}
            </div>
            
            <div className="text-lg text-gray-600">
              Tỷ lệ đúng: {multipleChoiceQuestions.length > 0 ? Math.round((correctAnswers / multipleChoiceQuestions.length) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Tổng câu hỏi</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Trắc nghiệm đúng</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {correctAnswers} / {multipleChoiceQuestions.length}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Thời gian làm bài</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {submission.endTime && submission.startTime ? (
                Math.round((new Date(submission.endTime).getTime() - new Date(submission.startTime).getTime()) / (1000 * 60))
              ) : 0} phút
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Chi tiết từng câu</h3>
          
          <div className="space-y-6">
            {submission.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    question.type === QuestionType.MultipleChoice
                      ? question.isCorrect 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{question.questionText}</h4>
                      <div className="flex items-center gap-2">
                        {question.type === QuestionType.MultipleChoice && (
                          question.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )
                        )}
                        <span className="text-sm font-medium text-gray-600">
                          {question.pointsAchieved} điểm
                        </span>
                      </div>
                    </div>

                    {question.type === QuestionType.MultipleChoice && (
                      <div className="space-y-2">
                        {question.answers.map((answer) => {
                          const isSelected = question.studentAnswer?.includes(answer.id);
                          
                          return (
                            <div
                              key={answer.id}
                              className={`p-3 rounded-lg border ${
                                isSelected
                                  ? question.isCorrect
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-red-200 bg-red-50'
                                  : 'border-gray-200 bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  isSelected
                                    ? question.isCorrect
                                      ? 'border-green-600 bg-green-600'
                                      : 'border-red-600 bg-red-600'
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                                <span className={`${
                                  isSelected
                                    ? question.isCorrect
                                      ? 'text-green-900'
                                      : 'text-red-900'
                                    : 'text-gray-700'
                                }`}>
                                  {answer.contentText}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.type === QuestionType.Essay && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">Câu trả lời của bạn:</div>
                        <div className="text-gray-900">
                          {question.studentAnswer || <em className="text-gray-500">Chưa trả lời</em>}
                        </div>
                        {question.pointsAchieved === 0 && (
                          <div className="mt-2 text-sm text-yellow-600">
                            ⏳ Đang chờ giảng viên chấm điểm
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essay Notice */}
        {essayQuestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Lưu ý về câu tự luận:</p>
                <p>
                  Bạn có {essayQuestions.length} câu tự luận đang chờ giảng viên chấm điểm. 
                  Điểm số cuối cùng có thể thay đổi sau khi giảng viên hoàn tất việc chấm bài.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}