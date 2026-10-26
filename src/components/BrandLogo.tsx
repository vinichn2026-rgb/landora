"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";

interface BrandLogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function BrandLogo({ 
  className = "", 
  variant = "dark",
  size = "md" 
}: BrandLogoProps) {
  const isDark = variant === "dark";

  let tagline = "Property & Land";
  try {
    const { language } = useLanguage();
    if (language === "ta") {
      tagline = "நிலம் & சொத்துகள்";
    }
  } catch {
    // Outside LanguageProvider fallback
  }

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Landora Geometric Monogram Logo */}
      <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#0c4a3e] via-[#0d5c4e] to-[#072e27] border border-[#c59b27]/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Stylized Land Parcel & Gable Roof */}
          <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10Z" stroke="#c59b27" strokeWidth="1.5" />
          <path d="M9 21V12H15V21" stroke="white" strokeWidth="1.5" />
          <path d="M12 3V8" stroke="#dfb33d" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-black tracking-tight leading-none ${sizeClasses[size]} ${isDark ? "text-[#0c4a3e]" : "text-white"}`}>
          {APP_NAME}<span className="text-[#c59b27]">.</span>
        </span>
        <span className={`text-[8.5px] font-bold uppercase tracking-widest leading-none mt-0.5 ${isDark ? "text-slate-500" : "text-emerald-200/80"}`}>
          {tagline}
        </span>
      </div>
    </Link>
  );
}
