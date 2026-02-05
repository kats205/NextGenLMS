import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({ message, onRetry, retryText = 'Thử lại' }: ErrorMessageProps) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
      <p className="text-gray-500 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          {retryText}
        </button>
      )}
    </div>
  );
}