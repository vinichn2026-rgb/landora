import Link from "next/link";
import { HelpCircle, ChevronRight, Search, ShieldCheck, FileText, PhoneCall } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { APP_NAME } from "@/lib/constants";

export default function HelpCentrePage() {
  const faqs = [
    {
      q: "How do I verify if a plot is DTCP or CMDA approved?",
      a: "Always request the DTCP / CMDA layout approval number from the promoter or owner. You can cross-verify this number on the official Tamil Nadu DTCP portal (tn.gov.in/tcp) or verify the layout map approved by the local planning authority."
    },
    {
      q: "What due diligence should I perform before purchasing agricultural land?",
      a: "Verify the Patta, Chitta, Adangal revenue records, Encumbrance Certificate (EC) for at least 30 years via the Tamil Nadu TNREGINET portal, and confirm access rights to the approach road before finalizing payments."
    },
    {
      q: "Are there any listing fees to post a property on Landora?",
      a: "Individual owners can post their first basic property listing for free. Promoters, builders, and brokers with multiple plots can choose our Silver or Gold listing tiers for premium placement and priority buyer leads."
    },
    {
      q: "How do I report a suspicious or duplicate listing?",
      a: "Every listing card and detail page has a 'Report Listing' option. Alternatively, you can visit our Report Listing page with the Property ID and our moderation team will review and take down fraudulent submissions."
    },
    {
      q: "Does Landora act as a broker or charge brokerage fees?",
      a: "No. Landora is a transparent discovery marketplace. We do not act as property brokers, nor do we collect commissions from transactions. Buyers deal directly with owners and authorized layout promoters."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12">
        <Container className="max-w-4xl space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
              Knowledge Base & Support
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#132a24] tracking-tight mt-2">
              {APP_NAME} Help Centre
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Clear guidance on real estate due diligence, listing management, and Tamil Nadu land documentation.
            </p>
          </div>

          {/* Quick Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/listing-guidelines"
              className="bg-white p-5 rounded-xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0c4a3e] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Listing Guidelines</h4>
                <p className="text-[11px] text-slate-500">Rules for posting plots</p>
              </div>
            </Link>

            <Link
              href="/report-listing"
              className="bg-white p-5 rounded-xl border border-[#e2e8e4] hover:border-rose-400 transition shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Report an Issue</h4>
                <p className="text-[11px] text-slate-500">Flag fake or sold plots</p>
              </div>
            </Link>

            <Link
              href="/contact"
              className="bg-white p-5 rounded-xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0c4a3e] flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Contact Support</h4>
                <p className="text-[11px] text-slate-500">Coimbatore desk</p>
              </div>
            </Link>
          </div>

          {/* FAQ Accordion Section */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-[#132a24]">Frequently Asked Questions</h2>
            <div className="divide-y divide-slate-100 space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="pt-4 first:pt-0 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-start gap-2">
                    <span className="text-[#0c4a3e] font-black">Q:</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
