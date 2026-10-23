import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hoverEffect = false, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-2xl border border-[#e2e8e4] overflow-hidden shadow-xs ${
          hoverEffect
            ? "hover:shadow-md hover:border-[#0c4a3e]/30 transition-all duration-200"
            : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-5 border-b border-[#f1f4f2] ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <h3 className={`font-black text-lg text-[#132a24] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <p className={`text-xs text-slate-500 mt-0.5 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => (
  <div className={`p-4 bg-[#fbfbfa] border-t border-[#f1f4f2] flex items-center ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
