import Link from "next/link";
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { APP_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#072e27] text-emerald-100/90 pt-14 pb-8 border-t border-[#0c4a3e] text-xs">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Post Property Banner CTA */}
        <div className="bg-gradient-to-r from-[#0c4a3e] via-[#0d5c4e] to-[#072e27] rounded-2xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#c59b27]/30 shadow-xl">
          <div className="max-w-xl">
            <span className="inline-block bg-[#c59b27]/20 text-[#dfb33d] border border-[#c59b27]/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wide mb-2">
              SELL OR RENT LAND & HOUSES
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Have a Property to Sell?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              Reach genuine property buyers across Tamil Nadu and South India by publishing your verified property listing.
            </p>
          </div>
          <Link
            href="/post-property"
            className="bg-[#c59b27] hover:bg-[#dfb33d] text-slate-950 font-black px-6 py-3 rounded-xl text-sm shadow-md transition hover:shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Post Your Property</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Directory Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-8 border-b border-emerald-900/60">
          {/* Column 1: Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <BrandLogo variant="light" size="sm" />
            <p className="text-[11px] text-emerald-200/70 leading-relaxed">
              India&apos;s transparent marketplace for residential plots, agricultural farmlands, independent villas, and commercial real estate.
            </p>
            <div className="text-[11px] text-emerald-300/80 space-y-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                Avinashi Road, Coimbatore, TN
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#c59b27]" />
                +91 422 2345678
              </p>
            </div>
          </div>

          {/* Column 2: Buy & Rent */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 pb-1 border-b border-emerald-700/60 inline-block">
              Properties
            </h4>
            <ul className="space-y-2 text-emerald-200/70 text-xs">
              <li><Link href="/buy" className="hover:text-white transition">Buy Property</Link></li>
              <li><Link href="/rent" className="hover:text-white transition">Rent Property</Link></li>
              <li><Link href="/plots" className="hover:text-white transition">Plots & Land</Link></li>
              <li><Link href="/commercial" className="hover:text-white transition">Commercial Spaces</Link></li>
              <li><Link href="/projects" className="hover:text-white transition">New Layout Projects</Link></li>
              <li><Link href="/post-property" className="hover:text-white transition">Post Your Property</Link></li>
            </ul>
          </div>

          {/* Column 3: Top Cities */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 pb-1 border-b border-emerald-700/60 inline-block">
              Top Locations
            </h4>
            <ul className="space-y-2 text-emerald-200/70 text-xs">
              <li><Link href="/locations/coimbatore" className="hover:text-white transition">Plots in Coimbatore</Link></li>
              <li><Link href="/locations/peelamedu" className="hover:text-white transition">Plots in Peelamedu</Link></li>
              <li><Link href="/locations/saravanampatti" className="hover:text-white transition">Saravanampatti IT Belt</Link></li>
              <li><Link href="/locations/chennai" className="hover:text-white transition">Properties in Chennai</Link></li>
              <li><Link href="/locations/madurai" className="hover:text-white transition">Plots in Madurai</Link></li>
              <li><Link href="/locations/bengaluru" className="hover:text-white transition">Properties in Bengaluru</Link></li>
            </ul>
          </div>

          {/* Column 4: Help & Moderation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 pb-1 border-b border-emerald-700/60 inline-block">
              Support & Trust
            </h4>
            <ul className="space-y-2 text-emerald-200/70 text-xs">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/help" className="hover:text-white transition">Help Centre</Link></li>
              <li><Link href="/listing-guidelines" className="hover:text-white transition">Listing Guidelines</Link></li>
              <li><Link href="/report-listing" className="hover:text-white transition text-rose-300">Report a Listing</Link></li>
              <li><Link href="/dashboard/packages" className="hover:text-white transition">Listing Packages</Link></li>
            </ul>
          </div>

          {/* Column 5: Legal & Policies */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 pb-1 border-b border-emerald-700/60 inline-block">
              Legal Policies
            </h4>
            <ul className="space-y-2 text-emerald-200/70 text-xs">
              <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms#cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link href="/help#verification" className="hover:text-white transition">Verification Standards</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-white transition text-emerald-300 font-semibold">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="py-5 text-[11px] text-emerald-300/70 space-y-1.5 border-b border-emerald-900/60 leading-relaxed">
          <p>
            <strong className="text-white">Legal Due Diligence Disclaimer: </strong>
            {APP_NAME} provides a technology marketplace connecting property buyers and sellers. Property details are seller-provided unless an explicit independent verification status is indicated. Buyers are strongly advised to independently verify original land records (Patta, Chitta, FMB sketch, Encumbrance Certificate) and statutory DTCP/CMDA/RERA layout approvals before executing sale agreements or advancing token deposits.
          </p>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
          <p>© {new Date().getFullYear()} {APP_NAME} Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <span>•</span>
            <Link href="/listing-guidelines" className="hover:text-white transition">Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
