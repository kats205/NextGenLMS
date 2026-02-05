import { useParams } from 'react-router-dom';
import { QuizViewer } from './QuizViewer';

export function QuizViewerPage() {
  const { quizId } = useParams<{ quizId: string }>();
  
  if (!quizId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz không tồn tại</h2>
          <p className="text-gray-500">ID quiz không hợp lệ</p>
        </div>
      </div>
    );
  }

  return <QuizViewer quizId={quizId} />;
}