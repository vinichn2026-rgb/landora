import Link from "next/link";
import { ShieldCheck, Compass, CheckCircle2, MapPin, Building, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { APP_NAME } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-gradient-to-r from-[#072e27] via-[#0c4a3e] to-[#0d5c4e] text-white py-16 px-4">
          <Container className="text-center max-w-3xl">
            <span className="text-[10px] font-black uppercase text-[#dfb33d] tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Our Vision & Mission
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
              About {APP_NAME}
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base mt-3 leading-relaxed">
              India&apos;s transparent marketplace dedicated to residential plots, agricultural farmlands, independent homes, and commercial spaces starting from Coimbatore and Tamil Nadu.
            </p>
          </Container>
        </section>

        {/* Content Section */}
        <Container className="py-14 max-w-4xl space-y-12">
          {/* Mission */}
          <div className="bg-white p-8 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#132a24]">
              Bridging Land Buyers and Genuine Owners
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In the Indian real estate market, discovering legally sound plots and land parcels has historically been burdened by lack of transparency, unauthorized intermediaries, inflated prices, and unclear documentation.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {APP_NAME} was founded to address this challenge by delivering clear plot dimensions, statutory approval classifications (DTCP, CMDA, RERA), direct owner contact details, and fair marketplace pricing.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-[#c59b27]" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Statutory Clarity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear labeling of DTCP approved layouts, panchayat approvals, and agricultural survey parcels.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-[#0c4a3e]" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Direct Communication</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct inquiries to owners and verified promoters without misleading commission structures.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5 text-[#0c4a3e]" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Hyper-Local Tamil Nadu</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                In-depth locality focus on Coimbatore, Chennai, Madurai, Tiruppur, and key industrial corridors.
              </p>
            </div>
          </div>

          {/* Office & Operations */}
          <div className="bg-[#0c4a3e] text-white p-8 rounded-2xl border border-[#c59b27]/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-black text-white">Coimbatore Headquarters</h3>
              <p className="text-xs text-emerald-100/80 mt-1">
                Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu - 641004
              </p>
              <p className="text-xs text-emerald-200 mt-2">
                Helpline: +91 422 2345678 • Email: support@landora.in
              </p>
            </div>
            <Link
              href="/contact"
              className="bg-[#c59b27] hover:bg-[#dfb33d] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs shrink-0 transition"
            >
              Contact Our Team
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
