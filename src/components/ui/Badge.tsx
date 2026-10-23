import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "gold" | "danger" | "outline" | "forest";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-bold rounded-md leading-none";

  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    forest: "bg-[#0c4a3e] text-white border border-[#072e27]",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-300",
    warning: "bg-amber-50 text-amber-800 border border-amber-300",
    gold: "bg-[#fdfaf2] text-[#a8821d] border border-[#c59b27]/40 font-extrabold",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    outline: "bg-white text-slate-700 border border-[#e2e8e4]"
  };

  const sizeStyles = {
    sm: "text-[9px] px-1.5 py-0.5 gap-1",
    md: "text-[10px] sm:text-[11px] px-2 py-0.5 gap-1.5"
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
