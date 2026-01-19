import { useState } from 'react';
import { mockTopics, mockQuestions } from '../../data/mockData';
import { Plus, Folder, HelpCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '../shared/Badge';

interface QuestionBankProps {
  courseId: string;
}

export function QuestionBank({ courseId }: QuestionBankProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  const topics = mockTopics.filter(t => t.courseId === courseId);
  const questions = mockQuestions.filter(q => q.courseId === courseId);
  const filteredQuestions = selectedTopic
    ? questions.filter(q => q.topicId === selectedTopic)
    : questions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Topics Sidebar */}
      <div className="lg:col-span-1">
        <div className="mb-4">
          <button className="w-full flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Thêm chủ đề
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-colors ${
              selectedTopic === null
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="text-sm font-medium">Tất cả</span>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full">
              {questions.length}
            </span>
          </button>

          {topics.map(topic => {
            const topicQuestions = questions.filter(q => q.topicId === topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-colors ${
                  selectedTopic === topic.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span className="text-sm font-medium">{topic.name}</span>
                <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {topicQuestions.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions List */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">
            {selectedTopic
              ? topics.find(t => t.id === selectedTopic)?.name
              : 'Tất cả câu hỏi'}
          </h3>
          <button
            onClick={() => setIsCreatingQuestion(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm câu hỏi
          </button>
        </div>

        {isCreatingQuestion && (
          <div className="mb-6 p-6 bg-white border-2 border-primary-300 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Tạo câu hỏi mới</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại câu hỏi
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>Trắc nghiệm nhiều đáp án</option>
                  <option>Đúng/Sai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câu hỏi
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đáp án
                </label>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-primary-600" />
                      <input
                        type="text"
                        placeholder={`Đáp án ${i}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Chọn các đáp án đúng</p>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Lưu câu hỏi
                </button>
                <button
                  onClick={() => setIsCreatingQuestion(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredQuestions.map(question => (
            <div key={question.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span className="font-medium text-gray-900">{question.questionText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-danger-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-danger-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3 ml-7">
                {question.options.map((option, index) => {
                  const isCorrect = question.correctAnswers.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isCorrect ? 'bg-success-50 border border-success-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-600">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-sm text-gray-700">{option.text}</span>
                      {isCorrect && <Badge variant="success" size="sm">Đúng</Badge>}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 ml-7">
                <Badge variant="primary" size="sm">{question.type === 'multiple-choice' ? 'Trắc nghiệm' : 'Đúng/Sai'}</Badge>
                <span className="text-sm text-gray-500">{question.points} điểm</span>
              </div>
            </div>
          ))}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Chưa có câu hỏi nào</p>
            <button
              onClick={() => setIsCreatingQuestion(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Tạo câu hỏi đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
