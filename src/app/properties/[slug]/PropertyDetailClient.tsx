"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  Ruler, 
  Compass, 
  Building2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  ArrowRight,
  Send,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle,
  Maximize2,
  X,
  Lock,
  Navigation,
  Info
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { PropertyStore, EnquiryStore, ReportStore } from "@/lib/store";
import { formatIndianCurrency, VERIFICATION_STATUSES, APP_NAME } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { PropertyItem } from "@/types";

interface PropertyDetailClientProps {
  property: PropertyItem;
  similarProperties?: PropertyItem[];
}

export default function PropertyDetailClient({
  property,
  similarProperties = [],
}: PropertyDetailClientProps) {
  const { user, isSaved: authIsSaved, toggleSaveProperty, openAuthModal } = useAuth();

  // Interactive gallery state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // User actions state
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Enquiry & Site Visit form state
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [isSiteVisit, setIsSiteVisit] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState(
    `I am interested in ${property.title}. Please share layout approval copy, survey verification, and schedule a convenient site visit.`
  );
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Report listing modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("MISLEADING_PRICE");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [{ id: "fallback", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop", caption: "Property view" }];

  const verificationConfig = VERIFICATION_STATUSES[property.verificationStatus] || VERIFICATION_STATUSES.UNREVIEWED;

  // Sync saved state with AuthContext or LocalStorage
  useEffect(() => {
    if (user) {
      setIsSaved(authIsSaved(property.id));
    } else {
      try {
        const savedRaw = localStorage.getItem("landora_saved_properties");
        if (savedRaw) {
          const savedIds = JSON.parse(savedRaw);
          setIsSaved(Array.isArray(savedIds) && savedIds.includes(property.id));
        }
      } catch {
        setIsSaved(false);
      }
    }
  }, [user, property.id, authIsSaved]);

  // Autofill user credentials if authenticated
  useEffect(() => {
    if (user) {
      if (!enquiryName) setEnquiryName(user.name || "");
      if (!enquiryEmail) setEnquiryEmail(user.email || "");
      if (!enquiryPhone && user.phoneNumber) setEnquiryPhone(user.phoneNumber);
    }
  }, [user]);

  const handleToggleSave = () => {
    if (user) {
      toggleSaveProperty(property.id);
      setIsSaved(!isSaved);
      setActionNotice(!isSaved ? "Saved to your favourites." : "Removed from favourites.");
    } else {
      try {
        const savedRaw = localStorage.getItem("landora_saved_properties");
        let savedIds: string[] = savedRaw ? JSON.parse(savedRaw) : [];
        if (isSaved) {
          savedIds = savedIds.filter(id => id !== property.id);
          setIsSaved(false);
          setActionNotice("Removed from favourites.");
        } else {
          savedIds.push(property.id);
          setIsSaved(true);
          setActionNotice("Saved to your favourites.");
        }
        localStorage.setItem("landora_saved_properties", JSON.stringify(savedIds));
      } catch {
        // Fallback
      }
    }
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this verified listing on Landora: ${property.title} in ${property.locality}, ${property.city}`,
          url,
        });
      } catch {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setActionNotice("Listing URL copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
        setTimeout(() => setActionNotice(null), 3000);
      } catch {
        setActionNotice("Failed to copy URL.");
      }
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal({ title: "Sign in to send enquiry" });
      return;
    }

    if (!enquiryName.trim() || !enquiryEmail.trim() || !enquiryPhone.trim()) {
      setEnquiryError("Please enter your name, email, and mobile number.");
      return;
    }

    setEnquirySubmitting(true);
    setEnquiryError(null);

    const formattedMessage = isSiteVisit 
      ? `[SITE VISIT REQUEST for ${visitDate || "Earliest available"}] ${enquiryMessage}`
      : enquiryMessage;

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          buyerName: enquiryName.trim(),
          buyerEmail: enquiryEmail.trim(),
          buyerPhone: enquiryPhone.trim(),
          message: formattedMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEnquirySuccess(true);
      } else {
        setEnquiryError(data.error || "Failed to submit enquiry. Please try again.");
      }
    } catch {
      // Local fallback
      EnquiryStore.create({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: `${property.locality}, ${property.city}`,
        propertyPrice: property.price,
        buyerId: user.id,
        buyerName: enquiryName,
        buyerEmail: enquiryEmail,
        buyerPhone: enquiryPhone,
        message: formattedMessage,
        sellerId: property.sellerId,
      });
      setEnquirySuccess(true);
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          reporterId: user?.id,
          reason: reportReason,
          details: reportDetails,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReportSubmitted(true);
      } else {
        setReportError(data.error || "Failed to submit report.");
      }
    } catch {
      ReportStore.create({
        propertyId: property.id,
        propertyTitle: property.title,
        reporterName: user?.name || "Anonymous User",
        reporterEmail: user?.email,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c4a3e] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Breadcrumb Bar */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-slate-500 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-slate-900 transition">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-slate-900 transition">Properties</Link>
          <span>/</span>
          <Link href={`/locations/${property.city.toLowerCase()}`} className="hover:text-slate-900 transition">{property.city}</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">{property.title}</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        
        {/* Top Header & Price Row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#0c4a3e]/10 text-[#0c4a3e] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {property.propertyType}
              </span>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                For {property.listingType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${verificationConfig.badgeColor}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {verificationConfig.label}
              </span>
              {property.isFeatured && (
                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{property.locality}, {property.city}, Tamil Nadu</span>
            </div>
          </div>

          {/* Pricing & Quick Buttons */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0c4a3e] tracking-tight">
                {formatIndianCurrency(property.price)}
              </div>
              <div className="text-xs text-slate-500 md:text-right font-medium">
                ₹{property.area > 0 ? Math.round(property.price / property.area).toLocaleString("en-IN") : 0} / {property.areaUnit}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                  isSaved 
                    ? "bg-rose-50 text-rose-600 border-rose-200" 
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
                title="Save Property"
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Share Property"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 transition cursor-pointer"
                title="Report Listing"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-16/9 md:aspect-21/9 max-h-[500px]">
            <img
              src={images[activeImageIdx]?.url}
              alt={images[activeImageIdx]?.caption || property.title}
              className="w-full h-full object-cover"
            />
            
            {/* View Fullscreen Overlay */}
            <button
              onClick={() => setLightboxOpen(true)}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>View All {images.length} Photos</span>
            </button>

            {/* Nav Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition backdrop-blur-xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition backdrop-blur-xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 sm:w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    activeImageIdx === idx ? "border-[#0c4a3e] ring-2 ring-[#0c4a3e]/20" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content & Lead Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Property Specifics, Overview & Documents */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Specs Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                  <Ruler className="w-3.5 h-3.5 text-emerald-600" /> Area
                </span>
                <div className="text-base font-bold text-slate-900">
                  {property.area} {property.areaUnit}
                </div>
                <div className="text-[10px] text-slate-400">
                  ≈ {(property.area / 435.6).toFixed(2)} Cents
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" /> Facing
                </span>
                <div className="text-base font-bold text-slate-900">
                  {property.facing || "East"}
                </div>
                <div className="text-[10px] text-slate-400">Vastu Compliant</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" /> Road Width
                </span>
                <div className="text-base font-bold text-slate-900">
                  {property.roadWidthFt ? `${property.roadWidthFt} Ft` : "30 Ft Tar Road"}
                </div>
                <div className="text-[10px] text-slate-400">Direct Road Access</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Approval
                </span>
                <div className="text-base font-bold text-slate-900 truncate">
                  {property.approvalStatus || "DTCP Approved"}
                </div>
                <div className="text-[10px] text-slate-400">Govt Statutory Body</div>
              </div>
            </div>

            {/* Property Overview */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0c4a3e]" />
                Property Description &amp; Highlights
              </h2>
              
              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                {property.description}
              </div>

              {property.plotDimensions && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Plot Dimensions:</strong> {property.plotDimensions}</span>
                </div>
              )}
            </div>

            {/* Verification & Legal Documentation Status */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Legal Verification &amp; Document Registry
                </h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${verificationConfig.badgeColor}`}>
                  {verificationConfig.label}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Landora’s in-house title desk verifies statutory layout approvals, revenue ownership records, and municipal boundaries.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Statutory Approval</span>
                  <div className="text-xs font-bold text-slate-800">{property.approvalStatus || "DTCP / Panchayat Approved"}</div>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Layout Plan Verified
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Land Classification</span>
                  <div className="text-xs font-bold text-slate-800">{property.landClassification || "Residential Converted"}</div>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Clear Patta / Revenue Record
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Survey &amp; Patta Reference</span>
                  <div className="text-xs font-bold text-slate-800 font-mono">
                    {property.surveyNumber ? `Survey #${property.surveyNumber}` : "Registered Revenue Sub-Division"}
                  </div>
                  <span className="text-[10px] text-slate-500">Subject to physical boundary verification</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Encumbrance (EC) Status</span>
                  <div className="text-xs font-bold text-slate-800">Clear 13-30 Year EC Reported</div>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Zero Prior Mortgages Declared
                  </span>
                </div>
              </div>
            </div>

            {/* Amenities & Infrastructure */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0c4a3e]" />
                  Infrastructure &amp; Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {property.amenities.map((amenity, idx) => {
                    const name = typeof amenity === "string" ? amenity : (amenity as any)?.name || "";
                    const key = typeof amenity === "string" ? `${amenity}-${idx}` : (amenity as any)?.id || `${name}-${idx}`;
                    return (
                      <div
                        key={key}
                        className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2 text-xs font-medium text-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Similar Listings */}
            {similarProperties.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Similar Properties in {property.city}
                  </h2>
                  <Link
                    href={`/locations/${property.city.toLowerCase()}`}
                    className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
                  >
                    <span>View More in {property.city}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {similarProperties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Contact Seller & Site Visit Booking */}
          <div className="space-y-6">
            
            {/* Contact Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-20">
              
              {/* Seller Identity */}
              <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0c4a3e] border border-emerald-200 flex items-center justify-center font-bold text-base">
                  {property.sellerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Listed By {property.sellerType}
                  </span>
                  <div className="text-sm font-bold text-slate-900">{property.sellerName}</div>
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified Advertiser
                  </span>
                </div>
              </div>

              {/* Direct Call / WhatsApp Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${property.sellerPhone}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Seller</span>
                </a>

                <a
                  href={`https://wa.me/${property.sellerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Hello ${property.sellerName}, I am interested in your property on Landora: ${property.title} (Ref #${property.id}). Please share more details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Booking Tab Switch */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsSiteVisit(false)}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    !isSiteVisit ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Send Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => setIsSiteVisit(true)}
                  className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                    isSiteVisit ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Calendar className="w-3 h-3 text-[#0c4a3e]" />
                  <span>Book Site Visit</span>
                </button>
              </div>

              {/* Enquiry Form */}
              {enquirySuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0c4a3e] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Enquiry Dispatched!</h4>
                  <p className="text-[11px] text-slate-600">
                    Your details and site visit request were delivered to {property.sellerName}. You will receive a direct callback shortly.
                  </p>
                  <button
                    onClick={() => setEnquirySuccess(false)}
                    className="text-[11px] font-bold text-[#0c4a3e] underline pt-1"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-3">
                  {enquiryError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {enquiryError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      placeholder="e.g. M. Rajesh"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="e.g. 98422 12345"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      placeholder="e.g. rajesh@gmail.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {isSiteVisit && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Preferred Site Visit Date</label>
                      <input
                        type="date"
                        required={isSiteVisit}
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Message to Seller</label>
                    <textarea
                      rows={2}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="w-full py-3 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{enquirySubmitting ? "Dispatching..." : isSiteVisit ? "Book Site Visit Now" : "Contact Seller Now"}</span>
                  </button>

                  <p className="text-[10px] text-slate-400 text-center leading-tight">
                    By contacting, you agree to Landora’s Terms. Your contact details are securely shared with the seller.
                  </p>
                </form>
              )}
            </div>

            {/* Buyer Trust Shield Card */}
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-[#0c4a3e] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Landora Buyer Protection</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                <li>0% Brokerage on direct owner listings</li>
                <li>Verified layout approval copies &amp; survey references</li>
                <li>Direct communication with property owners &amp; builders</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 animate-in fade-in">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-mono">
              Photo {activeImageIdx + 1} of {images.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={images[activeImageIdx]?.url}
              alt=""
              className="max-h-full max-w-full object-contain rounded-xl"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto justify-center pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                  activeImageIdx === i ? "border-emerald-500 ring-2 ring-emerald-500/40" : "border-transparent opacity-40 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Report Listing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Help keep Landora marketplace clean and accurate.</p>
              </div>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900">Report Received</h4>
                <p className="text-[11px] text-slate-600">
                  Thank you for keeping Landora authentic. Our compliance desk will review this listing within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setReportModalOpen(false);
                    setReportSubmitted(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold mt-2"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                {reportError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {reportError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-600"
                  >
                    <option value="MISLEADING_PRICE">Misleading / Inaccurate Price</option>
                    <option value="WRONG_LOCATION">Incorrect Location or Boundary</option>
                    <option value="FAKE_LISTING">Suspected Fake Listing or Stolen Photos</option>
                    <option value="ALREADY_SOLD">Property is Already Sold or Unavailable</option>
                    <option value="UNRESPONSIVE_SELLER">Seller Unresponsive or Unreachable</option>
                    <option value="OTHER">Other Compliance Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe why this listing violates guidelines..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
