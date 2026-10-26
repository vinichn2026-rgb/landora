import Link from "next/link";
import Image from "next/image";
import { 
  Compass, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  FileSearch, 
  PhoneCall, 
  Layers, 
  Flag,
  Award,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BannerSearchCard from "@/components/BannerSearchCard";
import PropertyCard from "@/components/PropertyCard";
import { DataAccess } from "@/lib/data-access";
import { APP_NAME, APP_TAGLINE, APP_SUBTITLE, PROPERTY_CATEGORIES } from "@/lib/constants";

// Category images mapped directly to authentic real estate types
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "RESIDENTIAL_PLOT": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
  "AGRICULTURAL_LAND": "https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=800&auto=format&fit=crop",
  "HOUSE": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
  "APARTMENT": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
  "VILLA": "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop",
  "COMMERCIAL_PLOT": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
  "COMMERCIAL_BUILDING": "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop",
  "INDUSTRIAL": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
};

export default async function HomePage() {
  // Query actual properties from database via central data-access layer (Plots #1 Priority)
  const featuredProperties = await DataAccess.getFeaturedProperties(6);
  const featuredPlots = await DataAccess.getFeaturedPlots(4);
  const recentProperties = await DataAccess.getRecentProperties(4);

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#132a24] flex flex-col font-sans">
      {/* SECTION 1: Navigation Header (Merged transparently at top, turns fixed on scroll) */}
      <Header currentCity="Coimbatore" />

      {/* SECTION 2: 99acres-Style Panoramic Hero Banner (Plots as First Priority) */}
      <section className="relative text-slate-900 pt-24 sm:pt-28 lg:pt-32 pb-24 sm:pb-28 lg:pb-36 overflow-hidden">
        {/* Scenic daylight landscape background photo with soft pleasant wash */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop')`
          }}
        />
        {/* Soft daylight overlay: white & airy emerald tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbfdfc]/95 via-[#f4faf6]/90 to-[#ebf4fa]/85" />
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-sky-200/25 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[350px] bg-emerald-200/25 blur-[100px] rounded-full pointer-events-none" />

        {/* Panoramic Banner Content Showcase */}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Block: Partner Branding, Typography & Starting Price */}
            <div className="lg:col-span-4 text-center lg:text-left space-y-3">
              {/* Partner Inscription */}
              <div className="inline-flex items-center gap-2 bg-[#0c4a3e]/10 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#0c4a3e]/20 text-xs font-bold text-[#0c4a3e]">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="tracking-wider uppercase font-black">⭐ SOUTH INDIA&apos;S #1 PLOT MARKETPLACE</span>
              </div>

              {/* Bold Headline */}
              <div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none drop-shadow-2xs">
                  DTCP & RERA
                </div>
                <div className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#0c4a3e] mt-1.5">
                  APPROVED RESIDENTIAL & VILLA PLOTS
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Gated community layouts, clear 30-year patta title & ready-to-build sites.
                </p>
              </div>

              {/* Price Banner */}
              <div className="pt-2">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  PREMIUM PLOTS STARTING AS
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  <span className="text-[#0c4a3e]">₹18 Lakhs</span><span className="text-amber-500 text-lg font-bold">*</span> <span className="text-sm font-semibold text-slate-600">Onwards</span>
                </div>
              </div>
            </div>

            {/* Center Block: High-End Demarcated Layout Render */}
            <div className="lg:col-span-4 flex justify-center items-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] h-56 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop')` 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                  <span className="font-bold flex items-center gap-1 drop-shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    DTCP Layout No. 412/2026
                  </span>
                  <span className="text-amber-300 font-extrabold drop-shadow-sm">Ready to Register</span>
                </div>
              </div>
            </div>

            {/* Right Block: Project Crest, Slogan & RERA Verification QR Block */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4 text-center lg:text-left">
              <div>
                {/* Project Logo Motif */}
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Compass className="w-7 h-7 text-[#0c4a3e]" />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      Emerald Green Valley Township
                    </h3>
                    <p className="text-[11px] text-slate-600 font-semibold">
                      BY LANDORA DEVELOPERS • Peelamedu & Saravanampatti IT Corridor
                    </p>
                  </div>
                </div>

                {/* Slogan */}
                <div className="mt-3">
                  <div className="text-lg sm:text-xl font-black tracking-widest text-[#0c4a3e] uppercase">
                    INVEST IN LAND, BUILD YOUR FUTURE
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    25-ACRE DTCP & TN RERA APPROVED GATED PLOT COMMUNITY WITH 40FT TAR ROADS
                  </p>
                </div>
              </div>

              {/* RERA QR Code & Statutory Box */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 border border-slate-200/90 shadow-sm flex items-center gap-3 text-left">
                {/* SVG QR Code */}
                <svg className="w-13 h-13 bg-white p-1 rounded shrink-0 shadow-xs border border-slate-200" viewBox="0 0 29 29">
                  <path fill="#0c4a3e" d="M0,0 h7 v7 h-7 z M2,2 h3 v3 h-3 z M22,0 h7 v7 h-7 z M24,2 h3 v3 h-3 z M0,22 h7 v7 h-7 z M2,24 h3 v3 h-3 z M9,0 h2 v2 h-2 z M13,0 h3 v2 h-3 z M17,0 h2 v2 h-2 z M9,4 h4 v2 h-4 z M15,4 h3 v3 h-3 z M19,4 h2 v2 h-2 z M9,8 h2 v3 h-2 z M12,8 h2 v2 h-2 z M16,8 h3 v2 h-3 z M21,8 h2 v3 h-2 z M0,9 h2 v2 h-2 z M4,9 h2 v2 h-2 z M6,12 h3 v2 h-3 z M10,12 h2 v2 h-2 z M14,12 h3 v2 h-3 z M18,12 h3 v2 h-3 z M22,12 h2 v2 h-2 z M25,9 h3 v4 h-3 z M9,16 h2 v2 h-2 z M13,16 h4 v3 h-4 z M19,16 h2 v2 h-2 z M23,16 h4 v2 h-4 z M9,20 h3 v3 h-3 z M14,21 h2 v2 h-2 z M18,20 h2 v2 h-2 z M22,20 h2 v3 h-2 z M26,20 h3 v2 h-3 z M9,25 h2 v3 h-2 z M13,24 h2 v4 h-2 z M17,25 h4 v2 h-4 z M23,24 h2 v4 h-2 z M26,24 h3 v4 h-3 z" />
                </svg>

                <div className="text-[10px] text-slate-700 leading-tight space-y-0.5">
                  <p className="font-bold text-slate-900">TN RERA Reg. No.: TN/01/Layout/2026/0412</p>
                  <p className="text-slate-500">DTCP Approved Layout | Ready for Immediate Registration</p>
                  <p className="text-emerald-700 font-bold">100% Clear 30-Yr Legal Title • 80% Bank Loan</p>
                  <p className="text-slate-500">Approved by SBI, HDFC & ICICI Bank</p>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[9px] text-slate-500 leading-tight hidden sm:block">
                *Disclaimer: Visuals and renders are for illustrative purposes. All statutory layout approvals and measurements are verified in public revenue records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Floating Overlapping Search Card (Overlaps the bottom of the banner) */}
      <div className="relative -mt-14 sm:-mt-16 lg:-mt-20 z-20 max-w-5xl mx-auto px-4 w-full">
        <BannerSearchCard />
      </div>

      {/* SECTION 4: Popular Property Categories */}
      <section className="pt-16 pb-14 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <span className="text-xs font-black uppercase text-[#0c4a3e] tracking-wider">
              Browse by Classification
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight mt-1">
              Popular Property Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore residential plots, agricultural acreage, independent homes, and commercial spaces.
            </p>
          </div>
          <Link
            href="/properties"
            className="text-xs font-bold text-[#0c4a3e] hover:text-[#072e27] flex items-center gap-1 transition"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {PROPERTY_CATEGORIES.map((cat) => {
            const imgUrl = CATEGORY_IMAGE_MAP[cat.type] || CATEGORY_IMAGE_MAP["RESIDENTIAL_PLOT"];
            return (
              <Link
                key={cat.id}
                href={`/properties?propertyType=${cat.type}`}
                className="group flex flex-col rounded-xl overflow-hidden bg-white border border-[#e2e8e4] hover:border-[#0c4a3e] shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="relative h-24 bg-slate-900 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundImage: `url('${imgUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="p-2.5 text-center flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-xs text-[#132a24] group-hover:text-[#0c4a3e] transition leading-tight">
                    {cat.label}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 4B: Dedicated Spotlight for Plots & Land (#1 Priority) */}
      <section className="py-14 px-4 bg-[#f0f5f3] border-y border-[#d5e2dc]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#0c4a3e] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider mb-1.5">
                <Compass className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>#1 Priority Category</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
                Verified Plot Layouts & Farmland Parcels
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                DTCP & CMDA approved gated community plots, roadside farmland acreage, and ready-to-register sites with verified revenue patta.
              </p>
            </div>
            <Link
              href="/plots"
              className="inline-flex items-center gap-2 bg-[#0c4a3e] hover:bg-[#072e27] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs shrink-0"
            >
              <span>Explore All Plots & Land</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Plot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredPlots.map((plot) => (
              <PropertyCard key={plot.id} property={plot} />
            ))}
          </div>

          {/* Plot Assurance Bar */}
          <div className="mt-8 bg-white rounded-2xl p-4 sm:p-5 border border-[#d5e2dc] shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold shrink-0">
                <Award className="w-5 h-5 text-[#c59b27]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">DTCP / CMDA Approved</h4>
                <p className="text-[10px] text-slate-500">Sanctioned layout numbers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">30-Yr Clear Patta Title</h4>
                <p className="text-[10px] text-slate-500">Nil encumbrance verification</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold shrink-0">
                <Layers className="w-5 h-5 text-[#0c4a3e]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">30ft & 40ft Tar Roads</h4>
                <p className="text-[10px] text-slate-500">Demarcated boundary stones</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5 text-[#c59b27]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">80% Bank Loan Approved</h4>
                <p className="text-[10px] text-slate-500">SBI, HDFC, ICICI supported</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Featured Properties */}
      <section className="py-14 px-4 bg-white border-y border-[#e2e8e4]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase text-[#0c4a3e] tracking-wider">
                Handpicked Listings
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight mt-1">
                Featured Properties & Plots
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Verified records from Coimbatore, Chennai, and key growth corridors with transparent details.
              </p>
            </div>
            <Link
              href="/properties?isFeatured=true"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c4a3e] hover:text-[#072e27] transition"
            >
              <span>Explore all featured listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Property Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Properties by Location */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase text-[#0c4a3e] tracking-wider">
              Regional Corridors
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight mt-1">
              Properties by Location
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse plots, houses, and land parcels across leading industrial and residential hubs.
            </p>
          </div>
        </div>

        {/* Location Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { city: "Coimbatore", desc: "Avinashi Rd, Peelamedu & IT Corridor", count: "1,420+ Listings", bg: "https://images.unsplash.com/photo-1524813686514-a57563d77d61?q=80&w=800&auto=format&fit=crop" },
            { city: "Peelamedu", desc: "Near Airport & PSG Tech Belt", count: "420+ Listings", bg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" },
            { city: "Saravanampatti", desc: "KCT Tech Park & Chil SEZ", count: "380+ Listings", bg: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop" },
            { city: "Gandhipuram", desc: "Prime Commercial & Residential Core", count: "210+ Listings", bg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop" },
            { city: "Chennai", desc: "OMR IT Highway, ECR & GST Road", count: "3,850+ Listings", bg: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop" },
            { city: "Madurai", desc: "Ring Road, Othakadai & AIIMS", count: "980+ Listings", bg: "https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=800&auto=format&fit=crop" },
            { city: "Tiruppur", desc: "Avinashi & Palladam Highway", count: "650+ Listings", bg: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop" },
            { city: "Bengaluru", desc: "Sarjapur, Whitefield & Electronic City", count: "4,200+ Listings", bg: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop" },
          ].map((loc) => (
            <Link
              key={loc.city}
              href={`/properties?city=${encodeURIComponent(loc.city)}`}
              className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition-all duration-300 h-44 flex flex-col justify-end p-4 text-white"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                style={{ backgroundImage: `url('${loc.bg}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-[#dfb33d] uppercase tracking-wider block">
                  {loc.count}
                </span>
                <h3 className="font-black text-lg text-white group-hover:text-[#dfb33d] transition-colors leading-tight">
                  {loc.city}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {loc.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 7: Recently Added Properties */}
      <section className="py-14 px-4 bg-white border-y border-[#e2e8e4]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase text-[#0c4a3e] tracking-wider">
                Fresh on Market
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight mt-1">
                Recently Added Properties
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ordered by publication date. Connect directly with owners and promoters.
              </p>
            </div>
            <Link
              href="/properties?sortBy=newest"
              className="text-xs font-bold text-[#0c4a3e] hover:text-[#072e27] flex items-center gap-1 transition"
            >
              <span>View all recent listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: Why Choose Us? */}
      <section className="py-16 px-4 bg-[#fbfbfa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#0c4a3e] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Trust & Transparency
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#132a24] tracking-tight mt-2">
              Why Choose {APP_NAME}?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Built specifically to eliminate fraudulent listings and unauthorized middlemen with transparent information.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Easy Property Discovery</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Filter by specific localities, road frontage width, layout approval types (DTCP, CMDA), and budget brackets without cluttered ads.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold mb-4">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Detailed Property Information</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Clear plot dimensions, survey records, facing orientation, approach road blacktop details, and water / EB availability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold mb-4">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Direct Enquiries & Zero Brokerage</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Connect directly with genuine landowners and verified layout promoters. Avoid unauthorized brokers and high commission charges.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Property Listing Management</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Sellers and agents get a dedicated dashboard to track inquiries, update prices, manage multiple plots, and monitor leads.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-6 h-6 text-[#c59b27]" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Transparent Verification Standards</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                We clearly separate unreviewed listings from contact-verified and independently verified revenue document checks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center font-bold mb-4">
                <Flag className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-base font-bold text-[#132a24]">Reporting & Moderation Tools</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Community-driven reporting with administrative review workflows to promptly take down duplicate or misleading properties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: How It Works */}
      <section className="py-16 px-4 bg-white border-y border-[#e2e8e4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
              How {APP_NAME} Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              A transparent, straightforward process for both buyers and property sellers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Buyers */}
            <div className="bg-[#fbfbfa] p-6 sm:p-8 rounded-2xl border border-[#e2e8e4]">
              <div className="inline-flex items-center gap-1.5 bg-[#0c4a3e] text-white text-[11px] font-bold px-3 py-1 rounded-md mb-4">
                <span>FOR PROPERTY BUYERS</span>
              </div>
              <ol className="space-y-4 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Search for properties</strong>
                    <span className="text-slate-500 text-xs">Filter by locality, plot size, budget, and statutory layout approval.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Compare listings</strong>
                    <span className="text-slate-500 text-xs">Compare price per sq.ft, approach road width, and facing directions.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Contact sellers directly</strong>
                    <span className="text-slate-500 text-xs">Send instant enquiries and receive verified owner contact numbers.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Arrange a physical site visit</strong>
                    <span className="text-slate-500 text-xs">Inspect plot boundaries, soil condition, and neighborhood infrastructure.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#c59b27] text-slate-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">5</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Complete independent legal due diligence</strong>
                    <span className="text-slate-500 text-xs">Verify revenue records (Patta/EC) with a qualified property advocate before purchase.</span>
                  </div>
                </li>
              </ol>
            </div>

            {/* For Sellers */}
            <div className="bg-[#fbfbfa] p-6 sm:p-8 rounded-2xl border border-[#e2e8e4]">
              <div className="inline-flex items-center gap-1.5 bg-[#c59b27] text-slate-950 text-[11px] font-bold px-3 py-1 rounded-md mb-4">
                <span>FOR LANDOWNERS & PROMOTERS</span>
              </div>
              <ol className="space-y-4 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Register an account</strong>
                    <span className="text-slate-500 text-xs">Sign up as an owner, agent, or layout developer in 30 seconds.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Add property information</strong>
                    <span className="text-slate-500 text-xs">Provide accurate title, plot area, price, facing, and locality details.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Upload genuine photographs</strong>
                    <span className="text-slate-500 text-xs">Upload clear photos of the plot, approach road, and layout demarcation.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Submit listing for review</strong>
                    <span className="text-slate-500 text-xs">Listing is reviewed by moderation team to maintain high quality standards.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#c59b27] text-slate-950 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">5</span>
                  <div>
                    <strong className="text-slate-900 block font-bold">Respond to buyer enquiries</strong>
                    <span className="text-slate-500 text-xs">Receive direct buyer calls and manage enquiries in your seller dashboard.</span>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
}
