import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-[#0c4a3e] hover:bg-[#072e27] text-white shadow-xs hover:shadow-md focus:ring-[#0c4a3e] border border-[#0c4a3e]",
      secondary:
        "bg-white hover:bg-[#f0f5f3] text-[#0c4a3e] border border-[#0c4a3e] focus:ring-[#0c4a3e] shadow-2xs",
      accent:
        "bg-[#c59b27] hover:bg-[#dfb33d] text-[#132a24] font-black shadow-xs hover:shadow-md focus:ring-[#c59b27] border border-[#a8821d]",
      outline:
        "bg-white hover:bg-slate-50 text-slate-700 border border-[#e2e8e4] focus:ring-slate-300 shadow-2xs",
      ghost:
        "bg-transparent hover:bg-[#f0f5f3] text-[#0c4a3e] focus:ring-[#0c4a3e]",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500 border border-rose-600"
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm px-4 py-2.5 gap-2",
      lg: "text-sm sm:text-base px-6 py-3.5 gap-2.5"
    };

    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
