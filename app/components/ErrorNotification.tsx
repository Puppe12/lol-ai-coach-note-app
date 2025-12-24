import { AlertCircle, X } from "lucide-react";

interface ErrorNotificationProps {
  message: string;
  details?: string;
  onClose?: () => void;
}

export default function ErrorNotification({ 
  message, 
  details, 
  onClose 
}: ErrorNotificationProps) {
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <h3 className="font-semibold text-red-800">{message}</h3>
          </div>
          {details && (
            <p className="mt-1 text-sm text-red-700 ml-7">{details}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

