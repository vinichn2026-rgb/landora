"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CRITICAL ROOT APPLICATION ERROR]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fbfbfa] flex items-center justify-center p-4 font-sans text-slate-800 antialiased">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-rose-200 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
          <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
            Critical Error
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Application Interruption
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            A critical error interrupted the application rendering. Please reload the page to restore your session.
          </p>
          {error.digest && (
            <p className="text-[10px] text-slate-400 font-mono">Digest ID: {error.digest}</p>
          )}
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0c4a3e] text-white rounded-xl text-xs font-bold hover:bg-[#072e27] transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
