import Link from "next/link";
import { Compass, Search, ArrowRight, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Container className="max-w-md text-center space-y-5 bg-white p-8 sm:p-10 rounded-2xl border border-[#e2e8e4] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8 text-[#0c4a3e]" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              404 • Not Found
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight mt-2">
              Property Not Found
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              The property listing or page you requested could not be located. It may have been sold, unpublished, or the link may be outdated.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/properties"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#0c4a3e] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#072e27] transition shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Browse All Properties</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Go to Homepage</span>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
