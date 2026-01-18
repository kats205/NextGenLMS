import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { mockAssessments, mockQuestions } from '../../data/mockData';
import { ArrowLeft, Clock, Save, Send, Upload, FileText } from 'lucide-react';

interface AssessmentAttemptPageProps {
  user: User;
  assessmentId: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function AssessmentAttemptPage({ user, assessmentId, onNavigate, onLogout }: AssessmentAttemptPageProps) {
  const assessment = mockAssessments.find(a => a.id === assessmentId);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [essayText, setEssayText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(assessment?.duration ? assessment.duration * 60 : 0);
  const [lastSaved, setLastSaved] = useState(new Date());

  useEffect(() => {
    if (assessment?.type === 'quiz' && assessment.duration) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [assessment]);

  if (!assessment) {
    return <div>Assessment not found</div>;
  }

  const questions = assessment.type === 'quiz' 
    ? mockQuestions.filter(q => assessment.questions?.includes(q.id))
    : [];

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [optionId],
    }));
    setLastSaved(new Date());
  };

  const handleSubmit = () => {
    alert('Bài làm đã được nộp thành công!');
    onNavigate('assessment-list');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('assessment-list')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách bài kiểm tra
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{assessment.title}</h1>
          {assessment.description && (
            <p className="text-gray-600 mb-4">{assessment.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Tổng điểm: {assessment.totalPoints}</span>
            {assessment.type === 'quiz' && assessment.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Thời gian: {assessment.duration} phút</span>
              </div>
            )}
          </div>
        </div>

        {/* Timer and Auto-save (for quiz) */}
        {assessment.type === 'quiz' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 sticky top-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-gray-900">
                    Thời gian còn lại: <span className={timeRemaining < 300 ? 'text-danger-600' : 'text-primary-600'}>{formatTime(timeRemaining)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Save className="w-4 h-4 text-success-600" />
                  <span>Tự động lưu: {lastSaved.toLocaleTimeString('vi-VN')}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Send className="w-4 h-4" />
                Nộp bài
              </button>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {assessment.type === 'quiz' && (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-4">{question.questionText}</p>
                    <div className="space-y-3">
                      {question.options.map((option, optIndex) => (
                        <label
                          key={option.id}
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[question.id]?.includes(option.id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            checked={answers[question.id]?.includes(option.id)}
                            onChange={() => handleAnswerChange(question.id, option.id)}
                            className="mt-1 w-4 h-4 text-primary-600"
                          />
                          <div className="flex-1">
                            <span className="text-gray-700">
                              <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                              {option.text}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Đã trả lời: {Object.keys(answers).length}/{questions.length} câu
                </p>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  <Send className="w-5 h-5" />
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Essay */}
        {assessment.type === 'essay' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Nội dung bài làm</h3>
              
              {/* Text Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trả lời (Text)
                </label>
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={12}
                  placeholder="Nhập câu trả lời của bạn..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoặc tải file lên
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Kéo thả file hoặc click để chọn</p>
                  <p className="text-sm text-gray-500">Hỗ trợ: PDF, DOC, DOCX (Tối đa 10MB)</p>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                  <button className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Chọn file
                  </button>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">bai_tap_lon.pdf</p>
                    <p className="text-xs text-gray-500">2.5 MB</p>
                  </div>
                  <button className="text-sm text-danger-600 hover:text-danger-700">Xóa</button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Hạn nộp: 25/01/2026 23:59</p>
                  {assessment.allowLateSubmission && (
                    <p className="text-sm text-gray-500">Cho phép nộp muộn đến {assessment.lateSubmissionMinutes ? assessment.lateSubmissionMinutes / 60 : 0} giờ</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Save className="w-4 h-4" />
                    Lưu nháp
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    <Send className="w-5 h-5" />
                    Nộp bài
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
