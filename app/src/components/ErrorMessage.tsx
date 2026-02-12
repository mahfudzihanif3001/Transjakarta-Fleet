import { AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className,
  onRetry 
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <p className="text-sm font-medium">Error</p>
      </div>
      <p className="text-sm text-red-700 text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
};
