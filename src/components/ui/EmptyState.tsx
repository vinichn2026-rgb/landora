import React from "react";
import { FolderSearch } from "lucide-react";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#e2e8e4] p-10 text-center max-w-lg mx-auto flex flex-col items-center justify-center shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#f0f5f3] text-[#0c4a3e] flex items-center justify-center mb-4">
        {icon || <FolderSearch className="w-7 h-7" />}
      </div>
      <h3 className="text-base sm:text-lg font-black text-[#132a24] tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
