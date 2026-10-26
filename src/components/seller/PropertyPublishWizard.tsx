"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  MapPin,
  IndianRupee,
  ShieldAlert,
  Building2,
  Compass,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Send,
  Eye,
  Sparkles,
  UserCheck,
  Briefcase,
  Phone,
  Mail,
  Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PROPERTY_CATEGORIES, POPULAR_LOCATIONS, AREA_UNITS } from "@/lib/constants";
import { PropertyItem, PropertyCategoryType, ListingType } from "@/types";

interface PropertyPublishWizardProps {
  initialData?: Partial<PropertyItem>;
  isEditing?: boolean;
  onBackToWelcome?: () => void;
}

export default function PropertyPublishWizard({ 
  initialData, 
  isEditing = false,
  onBackToWelcome 
}: PropertyPublishWizardProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 9;

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Listing Type & MagicBricks Poster Profile
    listingType: initialData?.listingType || "SALE" as ListingType,
    
    // Step 2: Category
    propertyType: initialData?.propertyType || "RESIDENTIAL_PLOT" as PropertyCategoryType,

    // Step 3: Location & Address (Moved from Step 4)
    address: initialData?.address || "",
    locality: initialData?.locality || "",
    city: initialData?.city || "Coimbatore",
    state: initialData?.state || "Tamil Nadu",
    pinCode: initialData?.pinCode || "",

    // Step 4: Area & Land Specifics (Moved from Step 5)
    area: initialData?.area ? String(initialData.area) : "",
    areaUnit: initialData?.areaUnit || "sqft",
    builtUpArea: initialData?.builtUpArea ? String(initialData.builtUpArea) : "",
    plotDimensions: initialData?.plotDimensions || "",
    roadWidthFt: initialData?.roadWidthFt ? String(initialData.roadWidthFt) : "",
    facing: initialData?.facing || "North",
    surveyNumber: initialData?.surveyNumber || "",
    landClassification: initialData?.landClassification || "DTCP Approved",
    documentStatus: initialData?.documentStatus || "Clear Title / Single Owner",
    approvalStatus: initialData?.approvalStatus || "Approved Layout",
    amenities: initialData?.amenities || ["30ft Tar Road", "EB Power Supply", "Water Connection"],

    // Step 5: Photographs (Moved from Step 6)
    images: initialData?.images || [
      {
        id: "default-1",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
        caption: "Main Plot Front View",
        isPrimary: true,
      }
    ],

    // Step 6: Pricing & Basic Information (Converted from Step 3)
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price ? String(initialData.price) : "",
    pricePerUnit: initialData?.pricePerUnit || "",
    isNegotiable: true,
    bedrooms: initialData?.bedrooms ? String(initialData.bedrooms) : "",
    bathrooms: initialData?.bathrooms ? String(initialData.bathrooms) : "",
    furnishing: initialData?.furnishing || "Unfurnished",

    // Seller / Poster Profile (MagicBricks Concept)
    sellerType: initialData?.sellerType || (user?.role === "AGENT" ? "AGENT" : user?.role === "BUILDER" ? "BUILDER" : "OWNER"),
    sellerName: initialData?.sellerName || user?.name || "",
    sellerPhone: initialData?.sellerPhone || user?.phoneNumber || "",
    sellerEmail: initialData?.sellerEmail || user?.email || "",
    sellerWhatsapp: initialData?.sellerWhatsapp || "",
    sellerCompany: (initialData as any)?.sellerCompany || "",
    reraNumber: (initialData as any)?.reraNumber || "",
    bestTimeToCall: "Anytime (9 AM - 8 PM)",
    packageId: initialData?.packageId || "pkg-basic",
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedProperty, setSubmittedProperty] = useState<PropertyItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync user info into seller contact if available
  useEffect(() => {
    if (user && !formData.sellerName) {
      setFormData(prev => ({
        ...prev,
        sellerName: user.name,
        sellerEmail: user.email,
        sellerPhone: user.phoneNumber || prev.sellerPhone,
        sellerType: user.role === "AGENT" ? "AGENT" : user.role === "BUILDER" ? "BUILDER" : "OWNER",
      }));
    }
  }, [user]);

  // Validation before advancing to next step
  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);

    // Step 1: Who is Posting & Transaction Intent
    if (currentStep === 1) {
      if (!formData.sellerName || formData.sellerName.trim().length < 2) {
        setErrorMsg("Please enter your name or contact person name.");
        return false;
      }
      const digits = formData.sellerPhone.replace(/\D/g, "");
      if (!formData.sellerPhone || digits.length < 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number for buyer calls.");
        return false;
      }
      if (!formData.sellerEmail || !formData.sellerEmail.includes("@")) {
        setErrorMsg("Please enter a valid email address for enquiry alerts.");
        return false;
      }
      if (!formData.listingType) {
        setErrorMsg("Please choose whether you want to Sell, Rent, or Lease.");
        return false;
      }
    }

    // Step 3: Location Details (Moved from Step 4)
    if (currentStep === 3) {
      if (!formData.city.trim()) {
        setErrorMsg("Please select or enter the city.");
        return false;
      }
      if (!formData.locality.trim()) {
        setErrorMsg("Please enter the locality or landmark.");
        return false;
      }
      if (!formData.pinCode.trim() || formData.pinCode.replace(/\D/g, "").length !== 6) {
        setErrorMsg("Please enter a valid 6-digit Indian PIN code.");
        return false;
      }
    }

    // Step 4: Area & Land Specifics (Moved from Step 5)
    if (currentStep === 4) {
      if (!formData.area || Number(formData.area) <= 0) {
        setErrorMsg("Please enter a valid land or built-up area.");
        return false;
      }
    }

    // Step 5: Photographs (Moved from Step 6)
    if (currentStep === 5) {
      if (formData.images.length === 0) {
        setErrorMsg("Please add or upload at least one photograph of the property.");
        return false;
      }
    }

    // Step 6: Pricing & Basic Information (Converted from Step 3)
    if (currentStep === 6) {
      if (!formData.title.trim() || formData.title.trim().length < 5) {
        setErrorMsg("Please enter a property title with at least 5 characters.");
        return false;
      }
      if (!formData.price || Number(formData.price) <= 0) {
        setErrorMsg("Please enter a valid price in INR.");
        return false;
      }
      if (!formData.description.trim() || formData.description.trim().length < 15) {
        setErrorMsg("Please enter a property description with at least 15 characters.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Image Upload Handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setUploadingImage(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Size validation: max 5MB
        if (file.size > 5 * 1024 * 1024) {
          setErrorMsg(`"${file.name}" exceeds the 5MB size limit.`);
          continue;
        }

        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const data = await res.json();
        if (data.success && data.image) {
          setFormData(prev => ({
            ...prev,
            images: [
              ...prev.images,
              {
                id: data.image.id,
                url: data.image.url,
                caption: file.name.replace(/\.[^/.]+$/, ""),
                isPrimary: prev.images.length === 0,
              }
            ]
          }));
        } else {
          setErrorMsg(data.error || "Failed to upload photograph.");
        }
      }
    } catch {
      setErrorMsg("Image upload failed. Please check your connection and retry.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith("http://") && !imageUrlInput.startsWith("https://") && !imageUrlInput.startsWith("data:image/")) {
      setErrorMsg("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        {
          id: `img-url-${Date.now()}`,
          url: imageUrlInput.trim(),
          caption: "Property Photograph",
          isPrimary: prev.images.length === 0,
        }
      ]
    }));
    setImageUrlInput("");
    setErrorMsg(null);
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, idx) => idx !== index);
      // If we removed the primary image, make the first remaining primary
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...prev, images: updated };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    }));
  };

  // Toggle Amenities
  const toggleAmenity = (name: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(name)
        ? prev.amenities.filter(a => a !== name)
        : [...prev.amenities, name]
    }));
  };

  // Submit Listing for Moderation
  const handleSubmitListing = async () => {
    for (const s of [1, 3, 4, 5, 6]) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const endpoint = isEditing && initialData?.id 
        ? `/api/seller/listings/${initialData.id}` 
        : "/api/seller/listings";
      
      const method = isEditing && initialData?.id ? "PUT" : "POST";

      const payload = {
        ...formData,
        price: Number(formData.price),
        area: Number(formData.area),
        builtUpArea: formData.builtUpArea ? Number(formData.builtUpArea) : undefined,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        roadWidthFt: formData.roadWidthFt ? Number(formData.roadWidthFt) : undefined,
        isDraft: false,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.listing) {
        setSubmittedProperty(data.listing);
        setSubmissionSuccess(true);
        setStep(9);
      } else {
        setErrorMsg(data.error || "Failed to submit property listing.");
      }
    } catch {
      setErrorMsg("Network error submitting property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Who is Posting" },
    { num: 2, title: "Category" },
    { num: 3, title: "Location" },
    { num: 4, title: "Area & Land" },
    { num: 5, title: "Photographs" },
    { num: 6, title: "Pricing & Info" },
    { num: 7, title: "Amenities" },
    { num: 8, title: "Review" },
    { num: 9, title: "Done" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wizard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? "Edit Property Listing" : "Post Property FREE"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Reach thousands of genuine verified buyers across Coimbatore and Tamil Nadu.
            </p>
          </div>
          <Link
            href="/dashboard/seller"
            className="text-xs font-semibold text-[#0c4a3e] hover:underline px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            Seller Hub →
          </Link>
        </div>

        {/* Step Indicator Bar */}
        <div className="mt-6 hidden md:grid grid-cols-9 gap-1 text-center">
          {stepsList.map(s => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (isCompleted) setStep(s.num);
                }}
                disabled={!isCompleted && !isActive}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition ${
                  isActive
                    ? "bg-[#0c4a3e] text-white border-[#0c4a3e] shadow-xs"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 cursor-pointer"
                    : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                }`}
              >
                <div>Step {s.num}</div>
                <div className="truncate text-[10px] font-normal">{s.title}</div>
              </button>
            );
          })}
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="mt-4 md:hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
            <span>Step {step} of {totalSteps}: {stepsList[step - 1]?.title}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0c4a3e] h-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Required Information Missing:</span>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Form Body */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* STEP 1: Who is Posting & Transaction Details (MagicBricks Concept)        */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-7">
            {/* 1A: Who is posting? (Owner, Agent, Builder) */}
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#0c4a3e] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider mb-2">
                <span>MagicBricks Concept</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                1. Who is Posting this Property?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select your role to connect with the right genuine buyers and get targeted inquiries.
              </p>
            </div>

            {/* Role Cards: Owner / Agent / Builder */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  role: "OWNER",
                  title: "Direct Owner",
                  sub: "I own this land / property",
                  badge: "0% Brokerage",
                  badgeColor: "bg-emerald-100 text-[#0c4a3e]",
                  desc: "Post 100% free with direct buyer phone calls & no commission middlemen.",
                  icon: <UserCheck className="w-5 h-5 text-[#0c4a3e]" />,
                },
                {
                  role: "AGENT",
                  title: "Real Estate Agent",
                  sub: "I am a broker / consultant",
                  badge: "Client Inventory",
                  badgeColor: "bg-blue-100 text-blue-800",
                  desc: "Post listings for clients, access CRM leads & manage multi-property portfolios.",
                  icon: <Briefcase className="w-5 h-5 text-blue-700" />,
                },
                {
                  role: "BUILDER",
                  title: "Builder / Promoter",
                  sub: "I am a layout developer / firm",
                  badge: "Layout Showcase",
                  badgeColor: "bg-amber-100 text-amber-900",
                  desc: "Promote new DTCP & RERA layouts, gated townships and commercial projects.",
                  icon: <Building2 className="w-5 h-5 text-amber-700" />,
                },
              ].map(opt => {
                const isSelected = formData.sellerType === opt.role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => setFormData({ ...formData, sellerType: opt.role as any })}
                    className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0c4a3e] bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                          {opt.icon}
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${opt.badgeColor}`}>
                          {opt.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-slate-900">{opt.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0c4a3e] shrink-0" />}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                        {opt.sub}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* 1B: Contact Coordinates */}
            <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0c4a3e]" />
                <span>Contact Details for Buyer Inquiries</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name / Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.sellerName}
                    onChange={e => setFormData({ ...formData, sellerName: e.target.value })}
                    placeholder="e.g. Sivakumar R."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      value={formData.sellerPhone.replace(/^\+91\s*/, "")}
                      onChange={e => setFormData({ ...formData, sellerPhone: `+91 ${e.target.value.replace(/\D/g, "").slice(0, 10)}` })}
                      placeholder="94433 12345"
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Direct buyer calls will be routed here</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.sellerEmail}
                    onChange={e => setFormData({ ...formData, sellerEmail: e.target.value })}
                    placeholder="e.g. sivakumar@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.sellerWhatsapp}
                    onChange={e => setFormData({ ...formData, sellerWhatsapp: e.target.value })}
                    placeholder="e.g. +91 94433 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">For instant WhatsApp lead notifications</span>
                </div>
              </div>

              {/* Dynamic Agency or Builder Info */}
              {formData.sellerType === "AGENT" && (
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Agency / Firm Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={(formData as any).sellerCompany || ""}
                      onChange={e => setFormData({ ...formData, sellerCompany: e.target.value } as any)}
                      placeholder="e.g. Kongu Prime Realtors"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Agent RERA Registration No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={(formData as any).reraNumber || ""}
                      onChange={e => setFormData({ ...formData, reraNumber: e.target.value } as any)}
                      placeholder="e.g. TN/AGENT/2026/0124"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                    />
                  </div>
                </div>
              )}

              {formData.sellerType === "BUILDER" && (
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Developer / Promoter Brand Name *
                    </label>
                    <input
                      type="text"
                      value={(formData as any).sellerCompany || ""}
                      onChange={e => setFormData({ ...formData, sellerCompany: e.target.value } as any)}
                      placeholder="e.g. Emerald Green Developers"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Layout RERA Registration No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={(formData as any).reraNumber || ""}
                      onChange={e => setFormData({ ...formData, reraNumber: e.target.value } as any)}
                      placeholder="e.g. TN/01/Layout/2026/0412"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#0c4a3e]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 1C: Transaction Intent (I want to Sell, Rent, Lease) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I want to: (Transaction Type)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { type: "SALE", label: "Sell Property", desc: "Outright sale of plot, land, house or commercial space" },
                  { type: "RENT", label: "Rent Out", desc: "Monthly rental lease to verified tenants" },
                  { type: "LEASE", label: "Long-Term Lease", desc: "Agricultural, industrial or commercial lease" },
                ].map(opt => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, listingType: opt.type as ListingType })}
                    className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      formData.listingType === opt.type
                        ? "border-[#0c4a3e] bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">{opt.label}</span>
                      {formData.listingType === opt.type && (
                        <CheckCircle2 className="w-4 h-4 text-[#0c4a3e]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Select Property Category                                         */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">2. Select Property Category</h2>
              <p className="text-xs text-slate-500 mt-1">Select the asset classification that matches your property.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROPERTY_CATEGORIES.map(cat => (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, propertyType: cat.type as PropertyCategoryType })}
                  className={`p-4 rounded-xl border-2 text-left transition cursor-pointer ${
                    formData.propertyType === cat.type
                      ? "border-[#0c4a3e] bg-emerald-50 text-[#0c4a3e] ring-2 ring-emerald-600/20 font-bold shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs sm:text-sm">{cat.label}</span>
                    {formData.propertyType === cat.type && (
                      <CheckCircle2 className="w-4 h-4 text-[#0c4a3e] shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-normal">
                    {cat.type.includes("PLOT") || cat.type.includes("LAND") ? "Land parcel" : "Built property"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Location Details (Moved from Step 4)                              */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">3. Location & Address</h2>
              <p className="text-xs text-slate-500 mt-1">Accurate locality information helps serious nearby buyers discover your plot.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City / Hub *
                </label>
                <select
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0c4a3e]"
                >
                  {POPULAR_LOCATIONS.map(l => (
                    <option key={l.city} value={l.city}>{l.city} ({l.state})</option>
                  ))}
                  <option value="Salem">Salem</option>
                  <option value="Erode">Erode</option>
                  <option value="Trichy">Trichy</option>
                  <option value="Tirunelveli">Tirunelveli</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Locality / Landmark *
                </label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={e => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="e.g. Peelamedu, Near PSG Tech"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Property Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot No / Door No, Street Name, Ward / Village"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  6-digit PIN Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={e => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, "") })}
                  placeholder="e.g. 641004"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Area, Dimensions & Land Specifics (Moved from Step 5)             */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">4. Area & Land Specific Details</h2>
              <p className="text-xs text-slate-500 mt-1">Specify dimensions, road access, and legal classification.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Land / Plot Area *
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. 1800 or 4.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Area Unit *
                </label>
                <select
                  value={formData.areaUnit}
                  onChange={e => setFormData({ ...formData, areaUnit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0c4a3e]"
                >
                  {AREA_UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Plot Dimensions (LxW)
                </label>
                <input
                  type="text"
                  value={formData.plotDimensions}
                  onChange={e => setFormData({ ...formData, plotDimensions: e.target.value })}
                  placeholder="e.g. 30 x 60 ft"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Facing Direction
                </label>
                <select
                  value={formData.facing}
                  onChange={e => setFormData({ ...formData, facing: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0c4a3e]"
                >
                  <option value="East">East (Kizhakku)</option>
                  <option value="North">North (Vadakku)</option>
                  <option value="South">South (Therku)</option>
                  <option value="West">West (Merkku)</option>
                  <option value="North-East">North-East (Easanam)</option>
                  <option value="South-East">South-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-West">South-West</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Road Width (in Ft)
                </label>
                <input
                  type="number"
                  value={formData.roadWidthFt}
                  onChange={e => setFormData({ ...formData, roadWidthFt: e.target.value })}
                  placeholder="e.g. 30 ft or 40 ft"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Survey / Patta Number
                </label>
                <input
                  type="text"
                  value={formData.surveyNumber}
                  onChange={e => setFormData({ ...formData, surveyNumber: e.target.value })}
                  placeholder="e.g. S.F. No. 142/2A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Land Classification
                </label>
                <select
                  value={formData.landClassification}
                  onChange={e => setFormData({ ...formData, landClassification: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0c4a3e]"
                >
                  <option value="DTCP Approved">DTCP Approved Layout</option>
                  <option value="CMDA Approved">CMDA Approved</option>
                  <option value="RERA Registered">RERA Registered Layout</option>
                  <option value="Agricultural Farmland">Agricultural Farmland (Nanjai/Punjai)</option>
                  <option value="Panchayat Approved">Panchayat Approved</option>
                  <option value="Commercial Conversion">Commercial Converted</option>
                  <option value="Industrial Zone">Industrial / SIPCOT / SIDCO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Document Status
                </label>
                <select
                  value={formData.documentStatus}
                  onChange={e => setFormData({ ...formData, documentStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0c4a3e]"
                >
                  <option value="Clear Title / Single Owner">Clear Title / Single Owner</option>
                  <option value="Bank Loan Approved">Bank Loan Available / Approved</option>
                  <option value="Patta Transfer Ready">Patta Transfer Ready</option>
                  <option value="Ancestral Property (Clear NOC)">Ancestral Property (Clear NOC)</option>
                </select>
              </div>
            </div>

            {/* Built-up area if applicable */}
            {(formData.propertyType === "HOUSE" || formData.propertyType === "VILLA" || formData.propertyType === "COMMERCIAL_BUILDING" || formData.propertyType === "APARTMENT") && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Built-Up Area (in Sq.Ft)
                </label>
                <input
                  type="number"
                  value={formData.builtUpArea}
                  onChange={e => setFormData({ ...formData, builtUpArea: e.target.value })}
                  placeholder="e.g. 2200"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: Upload Multiple Photographs (Moved from Step 6)                   */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">5. Property Photographs</h2>
              <p className="text-xs text-slate-500 mt-1">
                Listings with 3+ clear photographs receive 5x more buyer enquiries.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#0c4a3e] bg-slate-50/70 hover:bg-emerald-50/20 p-8 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0c4a3e] flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {uploadingImage ? "Processing & Uploading..." : "Click or drag photos here to upload"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPEG, PNG, and WebP (Up to 5MB each).
              </p>
            </div>

            {/* Or Add Via URL */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                placeholder="Or paste an image link (e.g. https://...)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
              >
                Add Image
              </button>
            </div>

            {/* Image Preview Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Uploaded Photos ({formData.images.length})
                </span>
                <span className="text-[11px] text-slate-400">Click star to set Cover Image</span>
              </div>

              {formData.images.length === 0 ? (
                <div className="p-6 text-center border rounded-xl bg-slate-50 text-slate-400 text-xs">
                  No photographs uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={`relative rounded-xl overflow-hidden border group bg-slate-900 ${
                        img.isPrimary ? "ring-2 ring-[#0c4a3e] border-[#0c4a3e]" : "border-slate-200"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.caption || `Photo ${idx + 1}`}
                        className="w-full h-32 object-cover group-hover:opacity-90 transition"
                      />
                      
                      {/* Top Badges & Actions */}
                      <div className="absolute top-2 left-2 z-10">
                        {img.isPrimary ? (
                          <span className="bg-[#0c4a3e] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                            COVER
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="bg-black/60 hover:bg-black text-white p-1 rounded transition text-[10px] flex items-center gap-1 cursor-pointer"
                            title="Set as Cover"
                          >
                            <Star className="w-3 h-3 text-amber-300" />
                            <span>Set Cover</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-rose-600 text-white p-1 rounded transition cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {img.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: Title, Description, Price & Property Details                     */}
        {/* (CONVERTED FROM FORMER STEP 3)                                           */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">6. Pricing & Basic Information</h2>
              <p className="text-xs text-slate-500 mt-1">Provide an attractive title and accurate pricing in INR.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Property Title *
                </label>
                {formData.locality && formData.area && (
                  <button
                    type="button"
                    onClick={() => {
                      const autoTitle = `${formData.area} ${formData.areaUnit} ${formData.landClassification || "DTCP Approved"} ${
                        formData.propertyType === "AGRICULTURAL_LAND"
                          ? "Farmland"
                          : formData.propertyType.includes("PLOT")
                          ? "Plot"
                          : "Property"
                      } in ${formData.locality}, ${formData.city}`;
                      setFormData(prev => ({ ...prev, title: autoTitle }));
                    }}
                    className="text-[11px] font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#c59b27]" />
                    <span>Auto-Generate Title</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 1,800 Sq.Ft DTCP Approved Villa Plot near Peelamedu Airport"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e] focus:ring-1 focus:ring-[#0c4a3e]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Include key highlights like approval status, plot size, or neighborhood.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Expected Price (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => {
                      const val = e.target.value;
                      const updates: any = { price: val };
                      if (val && Number(val) > 0 && formData.area && Number(formData.area) > 0 && !formData.pricePerUnit) {
                        const calculatedRate = Math.round(Number(val) / Number(formData.area));
                        updates.pricePerUnit = `₹${calculatedRate.toLocaleString("en-IN")}/${formData.areaUnit}`;
                      }
                      setFormData(prev => ({ ...prev, ...updates }));
                    }}
                    placeholder="e.g. 4800000"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-[#0c4a3e] focus:ring-1 focus:ring-[#0c4a3e]"
                  />
                </div>
                {formData.price && Number(formData.price) > 0 && (
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                    {Number(formData.price) >= 10000000 
                      ? `₹${(Number(formData.price) / 10000000).toFixed(2)} Crore`
                      : Number(formData.price) >= 100000
                      ? `₹${(Number(formData.price) / 100000).toFixed(2)} Lacs`
                      : `₹${Number(formData.price).toLocaleString("en-IN")}`}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rate / Unit Area (Optional)
                  </label>
                  {formData.price && formData.area && Number(formData.price) > 0 && Number(formData.area) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const rate = Math.round(Number(formData.price) / Number(formData.area));
                        setFormData(prev => ({
                          ...prev,
                          pricePerUnit: `₹${rate.toLocaleString("en-IN")}/${prev.areaUnit}`
                        }));
                      }}
                      className="text-[10px] font-bold text-[#0c4a3e] hover:underline"
                    >
                      Calculate: ₹{Math.round(Number(formData.price) / Number(formData.area)).toLocaleString("en-IN")}/{formData.areaUnit}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.pricePerUnit}
                  onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  placeholder="e.g. ₹2,650/sqft or ₹35 Lac/cent"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>
            </div>

            {/* Residential specifics if House/Apartment/Villa */}
            {(formData.propertyType === "HOUSE" || formData.propertyType === "APARTMENT" || formData.propertyType === "VILLA") && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms (BHK)</label>
                  <select
                    value={formData.bedrooms}
                    onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="">Select BHK...</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                  <select
                    value={formData.bathrooms}
                    onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="">Select Bathrooms...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Furnishing Status</label>
                  <select
                    value={formData.furnishing}
                    onChange={e => setFormData({ ...formData, furnishing: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Highlight location advantages, road connectivity, water availability, nearby landmarks, schools, and reason for selling..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0c4a3e] focus:ring-1 focus:ring-[#0c4a3e]"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* STEP 7: Amenities, Utilities & Site Inspection Info                       */}
        {/* ========================================================================= */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">7. Amenities & Site Inspection Details</h2>
              <p className="text-xs text-slate-500 mt-1">Highlight on-site infrastructure and your preferred timing for buyer calls and site visits.</p>
            </div>

            {/* Amenities & Utilities */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Available On-Site Amenities & Infrastructure
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "30ft Tar Road",
                  "40ft Tar Road",
                  "EB Power Supply",
                  "Free Agri EB Connection",
                  "Athikadavu / Siruvani Water",
                  "Borewell with Submersible Pump",
                  "Barbed Wire Fencing",
                  "Compound Wall",
                  "Street Lights",
                  "Underground Drainage",
                  "Gated Community with Security",
                  "Children's Park",
                  "Avenue Tree Plantation",
                  "Solar Street Lights",
                  "Bank Loan Approved",
                  "Immediate Patta Transfer Ready",
                ].map(amenity => {
                  const isSelected = formData.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                        isSelected
                          ? "bg-emerald-50 text-[#0c4a3e] border-emerald-300 shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Best Time to Call & Negotiation Flexibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Best Time for Buyers to Call
                </label>
                <select
                  value={formData.bestTimeToCall}
                  onChange={e => setFormData({ ...formData, bestTimeToCall: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0c4a3e]"
                >
                  <option value="Anytime (9 AM - 8 PM)">Anytime (9 AM - 8 PM)</option>
                  <option value="Morning Only (8 AM - 12 PM)">Morning Only (8 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                  <option value="Evening Only (5 PM - 8 PM)">Evening Only (5 PM - 8 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price Negotiation Flexibility
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="isNegotiable"
                      checked={formData.isNegotiable === true}
                      onChange={() => setFormData({ ...formData, isNegotiable: true })}
                      className="text-[#0c4a3e] focus:ring-[#0c4a3e]"
                    />
                    <span>Price is Negotiable</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="isNegotiable"
                      checked={formData.isNegotiable === false}
                      onChange={() => setFormData({ ...formData, isNegotiable: false })}
                      className="text-[#0c4a3e] focus:ring-[#0c4a3e]"
                    />
                    <span>Fixed Price (Non-negotiable)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 8: Preview Property Listing                                         */}
        {/* ========================================================================= */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">8. Preview Your Listing</h2>
              <p className="text-xs text-slate-500 mt-1">Review the details below. This is how buyers will see your listing.</p>
            </div>

            {/* Preview Card */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="relative h-64 bg-slate-900">
                <img
                  src={formData.images.find(img => img.isPrimary)?.url || formData.images[0]?.url}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-[#0c4a3e] text-white text-[11px] font-black px-2.5 py-1 rounded-md">
                    FOR {formData.listingType}
                  </span>
                  <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-1 rounded-md">
                    {formData.landClassification}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xl font-black">
                    {formData.price && Number(formData.price) >= 10000000 
                      ? `₹${(Number(formData.price) / 10000000).toFixed(2)} Cr`
                      : formData.price && Number(formData.price) >= 100000
                      ? `₹${(Number(formData.price) / 100000).toFixed(2)} Lac`
                      : `₹${Number(formData.price || 0).toLocaleString("en-IN")}`}
                    {formData.pricePerUnit && (
                      <span className="text-xs font-normal text-emerald-200 ml-2">({formData.pricePerUnit})</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{formData.title || "Untitled Property"}</h3>
                  <span className="bg-emerald-50 text-[#0c4a3e] border border-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0">
                    {formData.sellerType} LISTING
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#0c4a3e]" />
                  <span>{formData.locality}, {formData.city}, {formData.state} - {formData.pinCode}</span>
                </div>

                {/* Seller Profile Identity Bar */}
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center font-bold text-[#0c4a3e]">
                      {formData.sellerType === "OWNER" ? (
                        <UserCheck className="w-4 h-4 text-[#0c4a3e]" />
                      ) : formData.sellerType === "AGENT" ? (
                        <Briefcase className="w-4 h-4 text-blue-700" />
                      ) : (
                        <Building2 className="w-4 h-4 text-amber-700" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{formData.sellerName}</span>
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-[#0c4a3e] text-white">
                          {formData.sellerType}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        {formData.sellerPhone} &bull; {formData.sellerEmail}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] font-bold text-[#0c4a3e] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Area</span>
                    <span className="font-bold text-slate-800">{formData.area} {formData.areaUnit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dimensions</span>
                    <span className="font-bold text-slate-800">{formData.plotDimensions || "Standard"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Facing</span>
                    <span className="font-bold text-slate-800">{formData.facing}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3">{formData.description}</p>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {formData.amenities.map(a => (
                    <span key={a} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Listing Package Selection */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-slate-900 block">
                Choose Listing Tier &amp; Visibility
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setFormData({ ...formData, packageId: "pkg-basic" })}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    formData.packageId === "pkg-basic"
                      ? "border-[#0c4a3e] bg-emerald-50/40 ring-1 ring-[#0c4a3e]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Standard Free</span>
                    <span className="text-xs font-black text-[#0c4a3e]">₹0</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">45 days validity &bull; Direct phone inquiries</p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, packageId: "pkg-featured" })}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    formData.packageId === "pkg-featured"
                      ? "border-[#0c4a3e] bg-emerald-50/40 ring-1 ring-[#0c4a3e]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Featured Boost</span>
                    <span className="text-xs font-black text-[#0c4a3e]">₹1,499</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">60 days &bull; Featured badge &bull; Top search rank</p>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, packageId: "pkg-agent" })}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                    formData.packageId === "pkg-agent"
                      ? "border-[#0c4a3e] bg-emerald-50/40 ring-1 ring-[#0c4a3e]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Builder Pro</span>
                    <span className="text-xs font-black text-[#0c4a3e]">₹4,999</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">90 days &bull; Dedicated microsite &bull; 15 listings</p>
                </div>
              </div>
            </div>

            {/* Moderation Disclosure Note */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Landora Moderation Notice:</span>
                <p className="mt-0.5 text-amber-700">
                  To protect genuine buyers, new listings are placed under administrative review (status: <strong>Pending Review</strong>). Our verification team reviews documentation and title disclosures within 24 hours before approving the listing live.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 9: Success Confirmation                                              */}
        {/* ========================================================================= */}
        {step === 9 && submissionSuccess && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0c4a3e] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              Listing Submitted for Moderation!
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your property &ldquo;{submittedProperty?.title}&rdquo; has been safely registered (Reference: #{submittedProperty?.id}). Our moderation desk will verify and activate it shortly.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
              {submittedProperty?.packageId && submittedProperty.packageId !== "pkg-basic" && (
                <Link
                  href="/dashboard/packages"
                  className="px-5 py-2.5 rounded-xl bg-[#dfb33d] hover:bg-[#c99f32] text-slate-900 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  <span>Activate Package &amp; Boost Listing</span>
                </Link>
              )}
              <Link
                href="/dashboard/seller/listings"
                className="px-5 py-2.5 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition shadow-xs"
              >
                View in Seller Dashboard &rarr;
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmissionSuccess(false);
                  setStep(1);
                  setFormData({
                    ...formData,
                    title: "",
                    description: "",
                    price: "",
                    area: "",
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Post Another Property
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer Buttons */}
        {step < 9 && (
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : onBackToWelcome ? (
              <button
                type="button"
                onClick={onBackToWelcome}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Change Option</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {/* Next or Submit Button */}
              {step < 8 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitListing}
                  className="px-6 py-2.5 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Moderation</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
