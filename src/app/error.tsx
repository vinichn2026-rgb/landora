"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors to console / monitoring service
    console.error("[LANDORA APPLICATION ERROR BOUNDARY]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Container className="max-w-md text-center space-y-5 bg-white p-8 sm:p-10 rounded-2xl border border-rose-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
              Application Error
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              An unexpected error occurred while rendering this page. Our technical team has been notified.
            </p>
            {error.digest && (
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Error Reference: {error.digest}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#0c4a3e] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#072e27] transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
