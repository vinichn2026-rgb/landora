import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { APP_NAME } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12">
        <Container className="max-w-4xl space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#e2e8e4] shadow-xs">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#132a24]">Terms of Service</h1>
            <p className="text-xs text-slate-500 mt-1">Last updated: October 2026 • Governed by the laws of India</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">1. Platform Nature & Scope</h2>
              <p>
                {APP_NAME} operates as an online advertising and discovery platform connecting prospective property buyers with property owners, layout promoters, and real estate agents. {APP_NAME} does not act as a broker, real estate agent, escrow agent, or guarantor in any real estate transaction.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">2. Buyer Due Diligence Disclaimer</h2>
              <p>
                All users are strictly advised to undertake independent legal and technical due diligence before entering into any financial transaction or agreement to sell. Verification badges on {APP_NAME} reflect basic phone or statutory submission checks and do not substitute a comprehensive title opinion by a qualified advocate.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">3. Seller & Advertiser Responsibilities</h2>
              <p>
                Listing owners warrant that they hold valid title or express legal authority to market the property. Advertisers must not post misleading measurements, false layout approval numbers, or deceptive pricing.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">4. Content Moderation & Takedown</h2>
              <p>
                {APP_NAME} reserves the unilateral right to suspend or remove any listing reported for fraudulent representations, legal disputes, or copyright infringements without prior notice.
              </p>
            </section>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
