import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      children,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1"
          >
            {label}
            {props.required && <span className="text-rose-600 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full bg-[#fbfbfa] text-[#132a24] text-xs sm:text-sm font-semibold rounded-xl border border-[#e2e8e4] px-3 py-2.5 pr-10 outline-none transition-all duration-200 focus:bg-white focus:border-[#0c4a3e] focus:ring-2 focus:ring-[#0c4a3e]/15 cursor-pointer appearance-none disabled:bg-slate-100 disabled:cursor-not-allowed ${
              error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200" : ""
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = "Select";
export default Select;
