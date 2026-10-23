"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControl({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationControlProps) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-[#e2e8e4] mt-8 text-xs">
      <div className="text-slate-500 font-medium">
        Showing <strong className="text-slate-900">{startItem}</strong> to{" "}
        <strong className="text-slate-900">{endItem}</strong> of{" "}
        <strong className="text-slate-900">{totalItems}</strong> properties
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-bold transition cursor-pointer ${
            currentPage <= 1
              ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
              : "border-[#e2e8e4] text-slate-700 hover:bg-emerald-50 hover:text-[#0c4a3e] bg-white shadow-2xs"
          }`}
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                currentPage === p
                  ? "bg-[#0c4a3e] text-white shadow-xs"
                  : "bg-white border border-[#e2e8e4] text-slate-700 hover:bg-emerald-50 hover:text-[#0c4a3e]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-bold transition cursor-pointer ${
            currentPage >= totalPages
              ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
              : "border-[#e2e8e4] text-slate-700 hover:bg-emerald-50 hover:text-[#0c4a3e] bg-white shadow-2xs"
          }`}
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
