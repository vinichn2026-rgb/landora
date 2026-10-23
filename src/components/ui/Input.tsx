import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#fbfbfa] text-[#132a24] text-xs sm:text-sm font-medium rounded-xl border border-[#e2e8e4] placeholder-slate-400 px-3 py-2.5 outline-none transition-all duration-200 focus:bg-white focus:border-[#0c4a3e] focus:ring-2 focus:ring-[#0c4a3e]/15 disabled:bg-slate-100 disabled:cursor-not-allowed ${
              leftIcon ? "pl-9" : ""
            } ${rightIcon ? "pr-9" : ""} ${
              error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : ""
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
        )}

        {!error && helperText && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
