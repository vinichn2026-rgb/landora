import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  className = ""
}) => {
  return (
    <div
      className={`bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-900 flex items-start gap-4 ${className}`}
      role="alert"
    >
      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
        <AlertCircle className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <h4 className="font-bold text-sm text-rose-950">{title}</h4>
        <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">{message}</p>

        {onRetry && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="bg-white border-rose-200 text-rose-800 hover:bg-rose-100"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
