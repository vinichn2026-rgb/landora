import Link from "next/link";
import { CheckCircle2, AlertTriangle, FileCheck, ShieldAlert, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { APP_NAME } from "@/lib/constants";

export default function ListingGuidelinesPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12">
        <Container className="max-w-4xl space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
              Integrity & Trust
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#132a24] tracking-tight mt-2">
              Property Listing Guidelines
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              To keep {APP_NAME} authentic and legally transparent, every landowner, promoter, and agent must adhere to the following standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Permitted & Encouraged */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>What Is Encouraged</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0c4a3e] font-bold">✓</span>
                  <span><strong>Accurate Plot Measurements:</strong> State clear dimensions in cents, sq.ft, or acres with approach road blacktop width.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0c4a3e] font-bold">✓</span>
                  <span><strong>Authentic Photographs:</strong> Upload actual ground photos showing the plot boundary, nearby landmarks, and EB poles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0c4a3e] font-bold">✓</span>
                  <span><strong>Statutory Approval Details:</strong> Disclose whether the layout has DTCP, CMDA, or Village Panchayat regularized approvals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0c4a3e] font-bold">✓</span>
                  <span><strong>Realistic Pricing:</strong> Quote the genuine base price per cent or total consideration in INR without hidden brokerage fees.</span>
                </li>
              </ul>
            </div>

            {/* Strictly Prohibited */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Strictly Prohibited</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>Stock or Stolen Photos:</strong> Generic 3D renders or images downloaded from third-party websites are rejected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>Disputed or Encumbered Lands:</strong> Plots involved in active court injunctions or ambiguous ownership cannot be listed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>Duplicate Listings:</strong> Posting the same plot repeatedly under different localities or phone numbers is prohibited.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✗</span>
                  <span><strong>Misleading Approval Claims:</strong> Claiming DTCP approval for unapproved agricultural conversions leads to immediate banning.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0c4a3e] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm">Ready to post your compliant listing?</h3>
              <p className="text-xs text-emerald-100/80">Listings meeting our guidelines receive priority review within 6 hours.</p>
            </div>
            <Link
              href="/post-property"
              className="bg-[#c59b27] hover:bg-[#dfb33d] text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shrink-0 transition"
            >
              Post Property Now
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
