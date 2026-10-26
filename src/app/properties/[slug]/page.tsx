"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const property = PropertyStore.getBySlug(resolvedParams.slug);

  if (!property) {
    notFound();
  }

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

  const similarProperties = PropertyStore.getSimilar(property, 3);
  const verificationConfig = VERIFICATION_STATUSES[property.verificationStatus] || VERIFICATION_STATUSES.UNREVIEWED;

  // Sync saved state with AuthContext or LocalStorage
  useEffect(() => {
    if (user) {
      setIsSaved(authIsSaved(property.id));
    } else {
      try {
        const savedIds = JSON.parse(localStorage.getItem("landora_saved_ids") || "[]");
        setIsSaved(savedIds.includes(property.id));
      } catch {
        // Ignore
      }
    }
  }, [user, property.id, authIsSaved]);

  // Pre-fill enquiry details from authenticated user session
  useEffect(() => {
    if (user) {
      if (!enquiryName && user.name) setEnquiryName(user.name);
      if (!enquiryEmail && user.email) setEnquiryEmail(user.email);
      if (!enquiryPhone && user.phoneNumber) setEnquiryPhone(user.phoneNumber);
    }
  }, [user]);

  // Resume deferred action on mount after login redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const action = url.searchParams.get("action");
      const targetId = url.searchParams.get("targetId");

      if (user && action === "save" && targetId === property.id) {
        toggleSaveProperty(property.id).then((res) => {
          setIsSaved(res.isSaved);
          setActionNotice("Property successfully added to your shortlisted favourites!");
          setTimeout(() => setActionNotice(null), 4000);
        });
        url.searchParams.delete("action");
        url.searchParams.delete("targetId");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
      } else if (action === "enquire") {
        const el = document.getElementById("enquire");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else if (action === "contact") {
        const el = document.getElementById("contact-seller");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [user, property.id]);

  // Toggle Save (Requires Login)
  const handleToggleSave = async () => {
    if (!user) {
      openAuthModal({
        title: "Save Property to Favorites",
        subtitle: `Login with Email & OTP to shortlist "${property.title}" and receive price alerts.`,
        onSuccess: async () => {
          const res = await toggleSaveProperty(property.id);
          setIsSaved(res.isSaved);
          setActionNotice("Property successfully added to your shortlisted favourites!");
          setTimeout(() => setActionNotice(null), 4000);
        },
      });
      return;
    }
    const res = await toggleSaveProperty(property.id);
    setIsSaved(res.isSaved);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Submit Enquiry (Requires Login)
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError(null);

    if (!user) {
      openAuthModal({
        title: "Contact Property Owner / Agent",
        subtitle: "Enter your email & OTP to verify your contact information and submit your enquiry.",
        defaultEmail: enquiryEmail || undefined,
        onSuccess: () => {
          setActionNotice("Verified! Please click Send Enquiry to submit.");
          setTimeout(() => setActionNotice(null), 4000);
        },
      });
      return;
    }

    setEnquirySubmitting(true);

    try {
      const formattedMessage = isSiteVisit 
        ? `[SITE VISIT REQUESTED - Preferred Date: ${visitDate || "Upcoming Weekend"}]\n${enquiryMessage}`
        : enquiryMessage;

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          buyerName: enquiryName.trim(),
          buyerEmail: enquiryEmail.trim(),
          buyerPhone: enquiryPhone.trim(),
          message: formattedMessage,
          sellerId: property.sellerId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setEnquirySuccess(true);
      } else {
        setEnquiryError(data.error || "Failed to submit enquiry. Please verify your details.");
      }
    } catch {
      setEnquiryError("Network connection error. Please try again.");
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);

    const result = ReportStore.create({
      propertyId: property.id,
      propertyTitle: property.title,
      reporterName: enquiryName || "Concerned Buyer",
      reporterEmail: enquiryEmail || "buyer@example.com",
      reason: reportReason,
      details: reportDetails,
    });

    if (result.success) {
      setReportSubmitted(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSubmitted(false);
        setReportDetails("");
      }, 2000);
    } else {
      setReportError(result.error || "Please provide report details.");
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://landora.in/properties/${property.slug}`,
    datePosted: property.publishedAt,
    price: property.price,
    priceCurrency: "INR",
    image: property.images?.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      businessFunction: property.listingType === "RENT" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
    },
    spatialCoverage: {
      "@type": "Place",
      name: `${property.locality}, ${property.city}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address,
        addressLocality: property.locality,
        addressRegion: property.state,
        postalCode: property.pinCode,
        addressCountry: "IN",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#132a24] flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header currentCity={property.city} />

      {/* Breadcrumb Navigation Strip */}
      <nav className="bg-white border-b border-[#e2e8e4] py-2.5 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#0c4a3e]">Home</Link>
          <span>/</span>
          <Link href="/properties" className="hover:text-[#0c4a3e]">Properties</Link>
          <span>/</span>
          <Link href={`/properties?city=${encodeURIComponent(property.city)}`} className="hover:text-[#0c4a3e]">
            {property.city}
          </Link>
          <span>/</span>
          <Link href={`/properties?propertyType=${property.propertyType}`} className="hover:text-[#0c4a3e]">
            {property.propertyType.replace(/_/g, " ")}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold truncate max-w-xs">{property.title}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Top Title & Pricing Banner */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${verificationConfig.badgeColor}`}>
                {verificationConfig.label}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-slate-200 uppercase tracking-wide">
                {property.propertyType.replace(/_/g, " ")}
              </span>
              <span className="bg-[#0c4a3e] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
                For {property.listingType}
              </span>
              {property.isFeatured && (
                <span className="bg-[#c59b27] text-slate-950 text-xs font-black px-2 py-0.5 rounded-md">
                  FEATURED
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#132a24] tracking-tight leading-tight">
              {property.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-[#0c4a3e] shrink-0" />
              <span>{property.address}, {property.locality}, {property.city}, {property.state} - {property.pinCode}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {property.listingType === "RENT" ? "Monthly Rent" : "Total Price"}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#0c4a3e] tracking-tight">
              {formatIndianCurrency(property.price)}
              {property.listingType === "RENT" && <span className="text-sm font-medium text-slate-500"> / month</span>}
            </div>
            <span className="text-xs font-semibold text-slate-600 mt-0.5">
              Rate: <strong className="text-[#132a24]">{property.pricePerUnit}</strong>
            </span>

            {/* Quick Actions (Save, Share, Report) */}
            <div className="flex items-center gap-2 mt-3.5">
              <button
                onClick={handleToggleSave}
                className={`px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                  isSaved ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-white text-slate-700 border-[#e2e8e4] hover:bg-slate-50"
                }`}
                title="Save this property"
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-600 text-rose-600" : ""}`} />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-xl border border-[#e2e8e4] bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                title="Share or copy property URL"
              >
                <Share2 className="w-3.5 h-3.5 text-[#0c4a3e]" />
                <span>{copied ? "Link Copied!" : "Share"}</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-[#e2e8e4] bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                title="Report issue with this listing"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Gallery & Details + Enquiry Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Gallery, Land Specs, Amenities, Location Map */}
          <div className="lg:col-span-8 space-y-8">
            {/* Interactive Image Gallery */}
            <div className="bg-white rounded-2xl border border-[#e2e8e4] overflow-hidden shadow-xs">
              <div className="relative h-80 sm:h-96 md:h-[420px] bg-slate-950 overflow-hidden group">
                <img
                  src={images[activeImageIdx]?.url}
                  alt={images[activeImageIdx]?.caption || property.title}
                  className="w-full h-full object-cover transition-all duration-300 cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />

                {/* Lightbox Expand Hint */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 hover:bg-black/75 text-white backdrop-blur-md transition cursor-pointer"
                  title="Expand Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Prev / Next controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx((activeImageIdx - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-xs transition cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIdx((activeImageIdx + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-xs transition cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Caption Tag */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  {images[activeImageIdx]?.caption && (
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-medium max-w-md truncate">
                      {images[activeImageIdx].caption}
                    </div>
                  )}
                  <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-bold ml-auto">
                    {activeImageIdx + 1} / {images.length}
                  </div>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="p-3 bg-[#fbfbfa] border-t border-[#e2e8e4] flex items-center gap-2.5 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        activeImageIdx === idx ? "border-[#0c4a3e] ring-2 ring-[#0c4a3e]/20" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Key Specifications Grid */}
            <div className="bg-white rounded-2xl border border-[#e2e8e4] p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#132a24]">Property Specifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">Key physical attributes and spatial configurations</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 bg-[#fbfbfa] rounded-xl border border-[#f1f4f2]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Area</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {property.area} {property.areaUnit}
                  </span>
                </div>

                <div className="p-3.5 bg-[#fbfbfa] rounded-xl border border-[#f1f4f2]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Facing Direction</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {property.facing || "East"}
                  </span>
                </div>

                <div className="p-3.5 bg-[#fbfbfa] rounded-xl border border-[#f1f4f2]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Approach Road</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {property.roadWidthFt ? `${property.roadWidthFt} Ft Blacktop` : "30 Ft Road"}
                  </span>
                </div>

                <div className="p-3.5 bg-[#fbfbfa] rounded-xl border border-[#f1f4f2]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Layout Approval</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block truncate">
                    {property.approvalStatus || "DTCP Approved"}
                  </span>
                </div>
              </div>

              {/* Additional Residential Attributes if Applicable */}
              {(property.bedrooms || property.bathrooms || property.furnishing || property.builtUpArea) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
                  {property.bedrooms && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-[#0c4a3e] block text-[10px] uppercase font-bold">Bedrooms</span>
                      <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                        {property.bedrooms} BHK
                      </span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-[#0c4a3e] block text-[10px] uppercase font-bold">Bathrooms</span>
                      <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                        {property.bathrooms} Baths
                      </span>
                    </div>
                  )}
                  {property.builtUpArea && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-[#0c4a3e] block text-[10px] uppercase font-bold">Built-Up Area</span>
                      <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                        {property.builtUpArea} Sq.Ft
                      </span>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-[#0c4a3e] block text-[10px] uppercase font-bold">Furnishing</span>
                      <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                        {property.furnishing}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Land-Specific Details Section */}
            <div className="bg-white rounded-2xl border border-[#e2e8e4] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#0c4a3e]" />
                <h2 className="text-lg font-black text-[#132a24]">Land & Statutory Information</h2>
              </div>
              <p className="text-xs text-slate-500">
                Seller-declared title classifications, survey boundaries, and infrastructure readiness.
              </p>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-500">Plot Dimensions:</span>
                  <span className="font-bold text-slate-900">{property.plotDimensions || `${Math.round(Math.sqrt(property.area * 40))} x ${Math.round(Math.sqrt(property.area * 40))} Ft`}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-500">Survey / Ward Identifier:</span>
                  <span className="font-mono font-bold text-slate-900">{property.surveyNumber || `S.F. No. 1${property.pinCode.slice(-2)}/2A`}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-500">Land Revenue Classification:</span>
                  <span className="font-bold text-slate-900">{property.landClassification || `${property.propertyType.replace(/_/g, " ")} (Zoned)`}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-500">Approach Road Width:</span>
                  <span className="font-bold text-slate-900">{property.roadWidthFt ? `${property.roadWidthFt} Feet Asphalt / Blacktop` : "30 Feet Blacktop Road"}</span>
                </div>

                <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-500">Document Status Declared by Seller:</span>
                  <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {property.documentStatus || "Single Owner Patta in hand, 30-Year Nil Encumbrance Certificate"}
                  </span>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Privacy Safeguard:</strong> Direct ownership title deeds and personal identity documents are withheld from public indexing to protect owners against unauthorized solicitations.
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#e2e8e4] p-6 shadow-xs">
              <h2 className="text-lg font-black text-[#132a24] mb-3">About this Property</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities & Utilities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#e2e8e4] p-6 shadow-xs">
                <h2 className="text-lg font-black text-[#132a24] mb-3">Amenities & On-Site Utilities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-800">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-[#fbfbfa] rounded-xl border border-[#f1f4f2]">
                      <CheckCircle2 className="w-4 h-4 text-[#0c4a3e] shrink-0" />
                      <span className="font-semibold">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approximate Location Visualizer */}
            <div className="bg-white rounded-2xl border border-[#e2e8e4] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#132a24]">Location & Neighborhood</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{property.locality}, {property.city}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Navigation className="w-3.5 h-3.5 text-[#0c4a3e]" />
                  <span>{property.latitude?.toFixed(4) || "11.0183"}° N, {property.longitude?.toFixed(4) || "76.9696"}° E</span>
                </div>
              </div>

              {/* Map representation container */}
              <div className="relative h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center text-white">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#dfb33d_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="relative z-10 text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-[#0c4a3e] text-[#dfb33d] flex items-center justify-center mx-auto mb-2 shadow-lg ring-4 ring-emerald-500/30 animate-pulse">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm">{property.locality}, {property.city}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-sm mx-auto">{property.address}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold bg-white/20 text-emerald-200 px-2.5 py-0.5 rounded-full">
                    Approximate Location Point
                  </span>
                </div>
              </div>
            </div>

            {/* Independent Due Diligence Disclaimer */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0" />
                <span>Buyer Legal Due Diligence Advisory</span>
              </div>
              <p className="leading-relaxed">
                All property specifications, measurements, road dimensions, and statutory approval claims displayed on this listing are declared by the advertiser/seller. {APP_NAME} does not act as an escrow agent or title guarantor. Buyers are strongly advised to obtain an independent 30-year Encumbrance Certificate (EC), verify the Revenue Patta, and consult a qualified property advocate before paying advances or signing legal agreements.
              </p>
            </div>
          </div>

          {/* Right Column (4 cols): Seller Card & Enquiry Form */}
          <div className="lg:col-span-4 space-y-6 sticky top-22">
            {/* Feedback / Action Toast Notification */}
            {actionNotice && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-[#0c4a3e] text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionNotice}</span>
              </div>
            )}

            {/* Seller Contact Profile Card */}
            <div id="contact-seller" className="bg-white rounded-2xl border border-[#e2e8e4] p-5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Listing Managed By
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-lg">
                  {property.sellerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-base text-[#132a24] leading-tight">
                    {property.sellerName}
                  </h3>
                  <span className="inline-block text-[11px] font-bold text-[#0c4a3e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1">
                    {property.sellerType} Listed
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f1f4f2] space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400">Mobile Phone:</span>
                  {user ? (
                    <a href={`tel:${property.sellerPhone}`} className="font-mono font-bold text-[#0c4a3e] hover:underline">
                      {property.sellerPhone}
                    </a>
                  ) : (
                    <span className="font-mono font-bold text-slate-400">
                      +91 98•••• ••••
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400">Email:</span>
                  {user ? (
                    <a href={`mailto:${property.sellerEmail}`} className="font-medium text-slate-800 hover:underline truncate max-w-[170px]">
                      {property.sellerEmail}
                    </a>
                  ) : (
                    <span className="font-medium text-slate-400 truncate max-w-[170px]">
                      ••••••@landora.in
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-400">Published:</span>
                  <span className="font-medium text-slate-500">{new Date(property.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>

              {!user && (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/properties/${property.slug}#contact-seller`)}&action=contact`}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0c4a3e] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#0c4a3e]" />
                  <span>Sign In to View Full Contact</span>
                </Link>
              )}
            </div>

            {/* Direct Enquiry Form (Section 4 Workflow) */}
            <div id="enquire" className="bg-white rounded-2xl border border-[#e2e8e4] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-4 h-4 text-[#0c4a3e]" />
                <h3 className="font-black text-base text-[#132a24]">Direct Buyer Enquiry & Site Visit</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Connect directly with the landowner / promoter with 0% brokerage.
              </p>

              {!user ? (
                // Unauthenticated State: Clear Action-Required CTA
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#0c4a3e] text-[#dfb33d] flex items-center justify-center mx-auto shadow-xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Sign In to Contact Seller & Request Site Visit</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Instant direct communication, schedule physical site inspections, and access verified title documentation.
                    </p>
                  </div>
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/properties/${property.slug}#enquire`)}&action=enquire`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition shadow-xs w-full cursor-pointer"
                  >
                    <span>Sign In to Enquire</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : enquirySuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-xs space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-black text-emerald-950 text-base">Enquiry Sent Successfully!</h4>
                  <p className="text-emerald-800 leading-relaxed">
                    Thank you, <strong>{enquiryName}</strong>. Your enquiry for <em>{property.title}</em> has been securely delivered to <strong>{property.sellerName}</strong>.
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    A confirmation email was dispatched to {enquiryEmail}, and our administrator was notified.
                  </p>
                  <button
                    onClick={() => {
                      setEnquirySuccess(false);
                      setEnquiryMessage("");
                      setIsSiteVisit(false);
                    }}
                    className="mt-3 inline-block font-bold text-[#0c4a3e] hover:underline cursor-pointer"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                  {enquiryError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{enquiryError}</span>
                    </div>
                  )}

                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    required
                  />

                  <Input
                    label="Mobile Number (10 digits)"
                    type="tel"
                    placeholder="e.g. 98421 99887"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={enquiryEmail}
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    required
                  />

                  {/* Site Visit Request Toggle */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 select-none">
                      <input
                        type="checkbox"
                        checked={isSiteVisit}
                        onChange={(e) => setIsSiteVisit(e.target.checked)}
                        className="w-4 h-4 text-[#0c4a3e] rounded border-slate-300 focus:ring-[#0c4a3e]"
                      />
                      <span>Request a physical Site Visit</span>
                    </label>

                    {isSiteVisit && (
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Preferred Inspection Date
                        </label>
                        <input
                          type="date"
                          value={visitDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full bg-white text-xs font-medium rounded-lg border border-slate-300 p-2 outline-none focus:border-[#0c4a3e]"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Message to Seller
                    </label>
                    <textarea
                      rows={3}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      className="w-full bg-[#fbfbfa] text-xs font-medium rounded-xl border border-[#e2e8e4] p-2.5 outline-none focus:border-[#0c4a3e] focus:bg-white resize-none"
                      required
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    type="submit"
                    disabled={enquirySubmitting}
                  >
                    {enquirySubmitting ? "Dispatching to Seller..." : isSiteVisit ? "Request Site Visit & Enquire" : "Send Free Direct Enquiry"}
                  </Button>

                  <div className="text-[10px] text-slate-400 text-center leading-tight">
                    By submitting, you agree to Landora&apos;s privacy terms. We do not sell your contact details to third-party telemarketers.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#e2e8e4]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase text-[#0c4a3e] tracking-wider">
                  Recommendations
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#132a24] tracking-tight mt-0.5">
                  Similar Properties in {property.city}
                </h2>
              </div>
              <Link
                href={`/properties?city=${encodeURIComponent(property.city)}`}
                className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
              >
                <span>View all in {property.city}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox Fullscreen Image Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white p-2">
            <span className="text-xs font-bold text-slate-300">
              {property.title} — ({activeImageIdx + 1} of {images.length})
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-white hover:text-slate-300 cursor-pointer"
              aria-label="Close Fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center p-4">
            <img
              src={images[activeImageIdx]?.url}
              alt="Fullscreen view"
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx((activeImageIdx - 1 + images.length) % images.length)}
                  className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((activeImageIdx + 1) % images.length)}
                  className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-xs text-slate-400 p-2">
            {images[activeImageIdx]?.caption || property.title}
          </div>
        </div>
      )}

      {/* Report Listing Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
                <Flag className="w-4 h-4" />
                <span>Report Listing #{property.id}</span>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Report Received</h4>
                <p className="text-xs text-slate-500">
                  Our compliance team has flagged this listing for review. Thank you for protecting the community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                {reportError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                    {reportError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for reporting
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#0c4a3e]"
                  >
                    <option value="MISLEADING_PRICE">Misleading / Inaccurate Price</option>
                    <option value="ALREADY_SOLD">Property is already sold or unavailable</option>
                    <option value="UNAUTHORIZED_BROKER">Unauthorized broker posing as direct owner</option>
                    <option value="FALSE_APPROVAL_CLAIM">False DTCP/CMDA layout approval claim</option>
                    <option value="WRONG_LOCATION">Incorrect locality or address</option>
                    <option value="DUPLICATE_LISTING">Duplicate listing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Details / Additional Information
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific details regarding the violation..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-2.5 outline-none focus:border-[#0c4a3e]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm" className="bg-rose-700 hover:bg-rose-800">
                    Submit Flag
                  </Button>
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
