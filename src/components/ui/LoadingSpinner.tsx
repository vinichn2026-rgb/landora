import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  label,
  text,
  className = ""
}) => {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10"
  };

  const displayText = label || text;

  return (
    <div className={`flex flex-col items-center justify-center py-6 gap-2 ${className}`}>
      <Loader2 className={`${sizeMap[size]} animate-spin text-[#0c4a3e]`} />
      {displayText && <p className="text-xs text-slate-500 font-medium">{displayText}</p>}
    </div>
  );
};

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  rounded = "lg",
  className = "",
  ...props
}) => {
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full"
  };

  return (
    <div
      className={`animate-pulse bg-[#f1f4f2] ${roundedClasses[rounded]} ${className}`}
      {...props}
    />
  );
};

export default LoadingSpinner;
