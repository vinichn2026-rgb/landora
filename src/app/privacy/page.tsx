import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { APP_NAME } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12">
        <Container className="max-w-4xl space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#e2e8e4] shadow-xs">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#132a24]">Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">1. Information We Collect</h2>
              <p>
                We collect contact information (name, email address, phone number), property listing data (plot dimensions, photographs, layout details), and device browsing information necessary to connect buyers with sellers and protect users against fraudulent listings.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">2. How Information Is Shared</h2>
              <p>
                When a buyer submits an inquiry on a listing, their name and contact number are securely delivered to the designated seller or promoter of that specific property so they can respond to the inquiry. We do not sell user phone numbers or personal data to bulk telemarketers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">3. Data Security & Storage</h2>
              <p>
                Data is encrypted in transit and stored securely on cloud infrastructure compliant with modern industry standards. Sensitive payment transactions are processed exclusively through secure, RBI-authorized Indian payment gateways.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-slate-900 text-base">4. Contacting the Data Protection Officer</h2>
              <p>
                For questions regarding personal data access, correction, or account deletion, contact us at privacy@landora.in.
              </p>
            </section>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
