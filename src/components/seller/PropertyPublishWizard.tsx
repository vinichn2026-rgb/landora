"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UploadCloud,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Star,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Phone,
  Mail,
  UserCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  MapPin,
  Compass,
  Home,
  KeyRound,
  Sparkles,
  FileText,
  MessageCircle,
  ShieldCheck,
  RotateCcw,
  LandPlot,
  Store,
  Warehouse,
  IndianRupee,
  Edit3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  ListingType,
  PropertyCategoryType,
  PropertyImageItem,
  PropertyItem,
  FurnishingStatus,
} from "@/types";
import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_WHATSAPP,
} from "@/lib/constants";

const DRAFT_STORAGE_KEY = "landora_property_post_draft_v2";

interface PropertyPublishWizardProps {
  initialData?: Partial<PropertyItem> & Record<string, any>;
  isEditing?: boolean;
  onBackToWelcome?: () => void;
}

export default function PropertyPublishWizard({
  initialData,
  isEditing = false,
  onBackToWelcome,
}: PropertyPublishWizardProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { language, t } = useLanguage();

  // Current step (1 to 6)
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Purpose & Type
    listingType: (initialData?.listingType as ListingType) || "SALE",
    propertyType: (initialData?.propertyType as PropertyCategoryType) || "RESIDENTIAL_PLOT",

    // Step 2: Location
    city: initialData?.city || "Coimbatore",
    locality: initialData?.locality || "",
    address: initialData?.address || "",
    pinCode: initialData?.pinCode || "",
    state: initialData?.state || "Tamil Nadu",

    // Step 3: Details & Pricing
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price ? String(initialData.price) : "",
    pricePerUnit: initialData?.pricePerUnit || "",
    isNegotiable: true,
    area: initialData?.area ? String(initialData.area) : "",
    areaUnit: initialData?.areaUnit || "sqft",

    // Step 3 Conditional - Land/Plot
    plotDimensions: (initialData as any)?.plotDimensions || "",
    approvalStatus: (initialData as any)?.approvalStatus || "DTCP Approved",
    facing: (initialData as any)?.facing || "East",
    roadWidthFt: (initialData as any)?.roadWidthFt ? String((initialData as any).roadWidthFt) : "",
    boundaryWall: false,
    gatedLayout: false,

    // Step 3 Conditional - Residential
    bedrooms: initialData?.bedrooms ? String(initialData.bedrooms) : "2",
    bathrooms: initialData?.bathrooms ? String(initialData.bathrooms) : "2",
    furnishing: (initialData?.furnishing as FurnishingStatus) || "Unfurnished",
    builtUpArea: (initialData as any)?.builtUpArea ? String((initialData as any).builtUpArea) : "",
    floorNo: (initialData as any)?.floorNo ? String((initialData as any).floorNo) : "",
    totalFloors: (initialData as any)?.totalFloors ? String((initialData as any).totalFloors) : "",

    // Step 3 Conditional - Commercial
    commercialCategory: (initialData as any)?.commercialCategory || "Retail Shop",
    commercialSuitableFor: (initialData as any)?.commercialSuitableFor || ["Retail / Store", "IT / Office"],
    washrooms: (initialData as any)?.washrooms || "Private",

    // Step 3 Conditional - Rental
    securityDeposit: (initialData as any)?.securityDeposit || "",
    maintenanceMonthly: (initialData as any)?.maintenanceMonthly || "Included in Rent",
    preferredTenant: (initialData as any)?.preferredTenant || "Family / Working Professionals",

    // Step 4: Photographs
    images: (initialData?.images as PropertyImageItem[]) || [],
    photosViaWhatsApp: false,

    // Step 5: Owner & Contact Details
    sellerType: initialData?.sellerType || (user?.role === "AGENT" ? "AGENT" : user?.role === "BUILDER" ? "BUILDER" : "OWNER"),
    sellerName: initialData?.sellerName || user?.name || "",
    sellerPhone: initialData?.sellerPhone || user?.phoneNumber || "",
    sellerEmail: initialData?.sellerEmail || user?.email || "",
    whatsappSameAsPhone: true,
    sellerWhatsapp: (initialData as any)?.sellerWhatsapp || "",

    // Phase 4: Communication Consent & Preferences
    transactionalSms: true,
    transactionalWhatsapp: true,
    promotionalOffers: false, // Strictly not auto-opted per DPDP rules
  });

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedProperty, setSubmittedProperty] = useState<PropertyItem | null>(null);
  const [submissionCode, setSubmissionCode] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Hidden file inputs for Camera and Gallery
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Draft Preservation in localStorage ---
  useEffect(() => {
    if (!isEditing && typeof window !== "undefined") {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          // Only merge if not passed specific initialData from welcome selection
          if (!initialData?.propertyType && !initialData?.listingType) {
            setFormData(prev => ({ ...prev, ...parsed }));
          } else {
            // Keep the chosen listingType and propertyType from welcome, merge rest
            setFormData(prev => ({
              ...prev,
              ...parsed,
              listingType: initialData.listingType || parsed.listingType || "SALE",
              propertyType: initialData.propertyType || parsed.propertyType || "RESIDENTIAL_PLOT",
            }));
          }
        }
      } catch {
        // Ignore localStorage parsing issues
      }
    }
  }, [isEditing, initialData]);

  // Save to localStorage on change
  useEffect(() => {
    if (!isEditing && typeof window !== "undefined") {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch {
        // Ignore quota limits
      }
    }
  }, [formData, isEditing]);

  // Sync user info into seller details if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        sellerName: prev.sellerName || user.name,
        sellerEmail: prev.sellerEmail || user.email,
        sellerPhone: prev.sellerPhone || user.phoneNumber || "",
        sellerType: prev.sellerType || (user.role === "AGENT" ? "AGENT" : user.role === "BUILDER" ? "BUILDER" : "OWNER"),
      }));
    }
  }, [user]);

  // Derived property nature helpers
  const isPlotOrLand =
    formData.propertyType === "RESIDENTIAL_PLOT" ||
    formData.propertyType === "AGRICULTURAL_LAND" ||
    formData.propertyType === "COMMERCIAL_PLOT";

  const isResidentialBuilding =
    formData.propertyType === "HOUSE" ||
    formData.propertyType === "APARTMENT" ||
    formData.propertyType === "VILLA";

  const isCommercial =
    formData.propertyType === "COMMERCIAL_BUILDING" ||
    formData.propertyType === "INDUSTRIAL" ||
    formData.propertyType === "COMMERCIAL_PLOT";

  const isRent = formData.listingType === "RENT" || formData.listingType === "LEASE";

  // Price in Words Indian format helper
  const formatIndianPriceWords = (numStr: string) => {
    const val = Number(numStr.replace(/\D/g, ""));
    if (!val || val <= 0) return "";
    if (val >= 10000000) {
      const cr = (val / 10000000).toFixed(2).replace(/\.00$/, "");
      return `₹ ${cr} Crore`;
    }
    if (val >= 100000) {
      const lk = (val / 100000).toFixed(2).replace(/\.00$/, "");
      return `₹ ${lk} Lakhs`;
    }
    if (val >= 1000) {
      const th = (val / 1000).toFixed(1).replace(/\.0$/, "");
      return `₹ ${th} Thousand`;
    }
    return `₹ ${val.toLocaleString("en-IN")}`;
  };

  // Helper to auto-calculate price per unit
  useEffect(() => {
    if (formData.price && formData.area && Number(formData.area) > 0) {
      const priceVal = Number(formData.price);
      const areaVal = Number(formData.area);
      const rate = Math.round(priceVal / areaVal);
      const unitLabel =
        formData.areaUnit === "sqft"
          ? "sq.ft"
          : formData.areaUnit === "cent"
          ? "cent"
          : formData.areaUnit === "acre"
          ? "acre"
          : "ground";
      setFormData(prev => ({
        ...prev,
        pricePerUnit: `₹${rate.toLocaleString("en-IN")}/${unitLabel}`,
      }));
    }
  }, [formData.price, formData.area, formData.areaUnit]);

  // Auto-Title Generator
  const generateSuggestedTitle = () => {
    const typeLabel =
      formData.propertyType === "RESIDENTIAL_PLOT"
        ? "DTCP Approved Plot"
        : formData.propertyType === "AGRICULTURAL_LAND"
        ? "Agricultural Farm Land"
        : formData.propertyType === "HOUSE"
        ? `${formData.bedrooms} BHK Independent House`
        : formData.propertyType === "VILLA"
        ? `${formData.bedrooms} BHK Luxury Villa`
        : formData.propertyType === "APARTMENT"
        ? `${formData.bedrooms} BHK Apartment`
        : "Commercial Property";

    const locLabel = formData.locality.trim()
      ? `${formData.locality.trim()}, ${formData.city.trim()}`
      : formData.city.trim();

    const facingPart = formData.facing ? `${formData.facing} Facing ` : "";
    const areaPart = formData.area ? `${formData.area} ${formData.areaUnit.toUpperCase()} ` : "";
    const purposePart = isRent ? "for Rent" : "for Sale";

    const generated = `${facingPart}${areaPart}${typeLabel} ${purposePart} in ${locLabel}`.trim();
    setFormData(prev => ({ ...prev, title: generated }));
    setErrorMsg(null);
  };

  // Quick Description Generator
  const generateSampleDescription = () => {
    let sample = "";
    const loc = formData.locality.trim() || formData.city.trim();
    if (isPlotOrLand) {
      sample = `Prime DTCP / Panchayat approved land parcel located in a peaceful residential neighborhood at ${loc}. Features clear title documents, ${formData.roadWidthFt || "30"}ft wide tar road frontage, 24/7 copius ground water, and immediate registration. Excellent investment opportunity with high appreciation potential.`;
    } else if (isResidentialBuilding) {
      sample = `Well-maintained ${formData.bedrooms} BHK residence situated in prime locality of ${loc}. Features spacious ventilated rooms, modular fittings, 24/7 water supply, car parking, and immediate possession. Close proximity to reputed schools, hospitals, and bus stops.`;
    } else {
      sample = `High-visibility commercial space situated on the main road at ${loc}. Ideal for corporate offices, retail showrooms, clinics, or banking institutions with ample customer parking and 3-phase power.`;
    }
    setFormData(prev => ({ ...prev, description: sample }));
    setErrorMsg(null);
  };

  // --- Step Validation ---
  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);

    // Step 1: Purpose & Type
    if (currentStep === 1) {
      if (!formData.listingType) {
        setErrorMsg(language === "ta" ? "விற்பனை அல்லது வாடகை என்பதைத் தேர்ந்தெடுக்கவும்." : "Please select whether you want to Sell or Rent.");
        return false;
      }
      if (!formData.propertyType) {
        setErrorMsg(language === "ta" ? "சொத்து வகையைத் தேர்ந்தெடுக்கவும்." : "Please select the property type.");
        return false;
      }
    }

    // Step 2: Location
    if (currentStep === 2) {
      if (!formData.city.trim()) {
        setErrorMsg(language === "ta" ? "நகரத்தின் பெயரை உள்ளிடவும்." : "Please select or enter the city.");
        return false;
      }
      if (!formData.locality.trim()) {
        setErrorMsg(language === "ta" ? "பகுதி அல்லது முக்கிய அடையாளத்தை (Locality/Landmark) உள்ளிடவும்." : "Please enter the locality or prominent landmark.");
        return false;
      }
      const cleanPin = formData.pinCode.replace(/\D/g, "");
      if (!cleanPin || cleanPin.length !== 6) {
        setErrorMsg(language === "ta" ? "சரியான 6 இலக்க அஞ்சல் குறியீட்டை (PIN Code) உள்ளிடவும்." : "Please enter a valid 6-digit Indian PIN code.");
        return false;
      }
    }

    // Step 3: Details & Pricing
    if (currentStep === 3) {
      if (!formData.title.trim() || formData.title.trim().length < 5) {
        setErrorMsg(language === "ta" ? "குறைந்தது 5 எழுத்துக்களில் சொத்தின் தலைப்பை உள்ளிடவும்." : "Please enter a property title with at least 5 characters.");
        return false;
      }
      if (!formData.area || Number(formData.area) <= 0) {
        setErrorMsg(language === "ta" ? "சொத்தின் பரப்பளவை (Area) உள்ளிடவும்." : "Please enter a valid property area.");
        return false;
      }
      if (!formData.price || Number(formData.price) <= 0) {
        setErrorMsg(language === "ta" ? "எதிர்பார்க்கும் விலையை உள்ளிடவும்." : "Please enter a valid expected price / rent.");
        return false;
      }
      if (!formData.description.trim() || formData.description.trim().length < 15) {
        setErrorMsg(language === "ta" ? "குறைந்தது 15 எழுத்துக்களில் சொத்தின் விவரத்தை விவரிக்கவும்." : "Please enter a property description with at least 15 characters.");
        return false;
      }
    }

    // Step 4: Photographs
    if (currentStep === 4) {
      if (!formData.photosViaWhatsApp && formData.images.length === 0) {
        setErrorMsg(
          language === "ta"
            ? "குறைந்தது 1 புகைப்படத்தை பதிவேற்றவும் அல்லது 'வாட்ஸ்அப் மூலம் பின்னர் அனுப்புகிறேன்' என்பதைத் தேர்ந்தெடுக்கவும்."
            : "Please upload at least 1 photo, or check 'I will send photos via WhatsApp later' to proceed."
        );
        return false;
      }
    }

    // Step 5: Owner Details
    if (currentStep === 5) {
      if (!formData.sellerName || formData.sellerName.trim().length < 2) {
        setErrorMsg(language === "ta" ? "உங்கள் பெயரை உள்ளிடவும்." : "Please enter your full name.");
        return false;
      }
      const digits = formData.sellerPhone.replace(/\D/g, "");
      if (!formData.sellerPhone || digits.length < 10) {
        setErrorMsg(language === "ta" ? "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்." : "Please enter a valid 10-digit mobile number for genuine buyer calls.");
        return false;
      }
      if (!formData.whatsappSameAsPhone) {
        const waDigits = (formData.sellerWhatsapp || "").replace(/\D/g, "");
        if (!formData.sellerWhatsapp || waDigits.length < 10) {
          setErrorMsg(language === "ta" ? "சரியான 10 இலக்க வாட்ஸ்அப் எண்ணை உள்ளிடவும்." : "Please enter a valid 10-digit WhatsApp number.");
          return false;
        }
      }
      if (!formData.sellerEmail || !formData.sellerEmail.includes("@")) {
        setErrorMsg(language === "ta" ? "சரியான மின்னஞ்சல் முகவரியை (Email) உள்ளிடவும்." : "Please enter a valid email address for listing status alerts.");
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
    if (step === 1 && onBackToWelcome) {
      onBackToWelcome();
    } else {
      setStep(prev => Math.max(prev - 1, 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- Photo Upload Handlers ---
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setUploadingImage(true);
    setUploadProgress(10);

    try {
      const newImages: PropertyImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
          setErrorMsg(`"${file.name}" exceeds the 5MB size limit.`);
          continue;
        }

        // Instant client-side Data URL for zero delay previews
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || "");
          reader.readAsDataURL(file);
        });

        // Background upload to server
        const uploadData = new FormData();
        uploadData.append("file", file);

        let finalUrl = dataUrl;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          const data = await res.json();
          if (data.success && data.image?.url) {
            finalUrl = data.image.url;
          }
        } catch {
          // If network upload fails, dataUrl serves as reliable fallback
        }

        newImages.push({
          id: `img-${Date.now()}-${i}`,
          url: finalUrl,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          isPrimary: formData.images.length === 0 && newImages.length === 0,
        });

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      if (newImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
          photosViaWhatsApp: false, // Turn off WhatsApp skip once user adds photos
        }));
      }
    } catch {
      setErrorMsg("Failed to upload photographs. Please retry.");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const handleSetPrimary = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const filtered = prev.images.filter((_, i) => i !== index);
      // Ensure at least one primary remains if any photos exist
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return { ...prev, images: filtered };
    });
  };

  const executeSubmission = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        listingType: formData.listingType,
        propertyType: formData.propertyType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        pricePerUnit: formData.pricePerUnit,
        area: Number(formData.area),
        areaUnit: formData.areaUnit,
        builtUpArea: formData.builtUpArea ? Number(formData.builtUpArea) : undefined,
        bedrooms: isResidentialBuilding && formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: isResidentialBuilding && formData.bathrooms ? Number(formData.bathrooms) : undefined,
        furnishing: isResidentialBuilding ? formData.furnishing : undefined,
        facing: formData.facing || undefined,
        roadWidthFt: formData.roadWidthFt ? Number(formData.roadWidthFt) : undefined,
        plotDimensions: isPlotOrLand && formData.plotDimensions ? formData.plotDimensions.trim() : undefined,
        approvalStatus: formData.approvalStatus || "Seller Declared",
        address: (formData.address || formData.locality || formData.city).trim(),
        locality: formData.locality.trim(),
        city: formData.city.trim(),
        state: formData.state || "Tamil Nadu",
        pinCode: formData.pinCode.trim(),
        images: formData.images,
        photosViaWhatsApp: formData.photosViaWhatsApp,
        sellerType: formData.sellerType,
        sellerName: formData.sellerName.trim(),
        sellerPhone: formData.sellerPhone.trim(),
        sellerEmail: formData.sellerEmail.trim(),
        sellerWhatsapp: formData.whatsappSameAsPhone ? formData.sellerPhone.trim() : formData.sellerWhatsapp.trim(),
        communicationConsent: {
          transactionalSms: formData.transactionalSms,
          transactionalWhatsapp: formData.transactionalWhatsapp,
          promotionalOffers: formData.promotionalOffers,
        },
        isDraft: false,
      };

      const res = await fetch("/api/seller/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.property) {
        setSubmittedProperty(data.property);
        const code = `LAN-${Math.floor(100000 + Math.random() * 900000)}`;
        setSubmissionCode(code);
        setSubmissionSuccess(true);
        // Clear saved draft on successful submission
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMsg(data.error || "Failed to submit property listing. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please check your internet connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Submission Handler ---
  const handleSubmitListing = useCallback(async () => {
    if (!validateStep(step)) return;
    if (!termsAccepted) {
      setErrorMsg("Please accept the terms and confirmation checkmark to proceed.");
      return;
    }

    // If user is not authenticated, trigger popup login modal (Mobile OTP first with Guest Option)
    if (!user) {
      openAuthModal({
        title: language === "ta" ? "மொபைல் எண் சரிபார்ப்பு & சமர்ப்பிப்பு" : "Verify Mobile Number & Publish",
        subtitle: language === "ta"
          ? "உங்கள் மொபைல் எண்ணை OTP மூலம் சரிபார்த்து வாங்குவோரின் நேரடி அழைப்புகளைப் பெறவும்."
          : "Verify your mobile number via OTP to protect your listing and receive direct buyer calls.",
        defaultPhone: formData.sellerPhone,
        defaultEmail: formData.sellerEmail,
        initialMethod: "phone",
        allowGuest: true,
        onGuestContinue: () => {
          // Allow guest submission with seller phone
          executeSubmission();
        },
        onSuccess: () => {
          // Auto submit after auth completes
          setTimeout(() => {
            executeSubmission();
          }, 300);
        },
      });
      return;
    }

    await executeSubmission();
  }, [step, termsAccepted, user, formData, language, openAuthModal]);

  // Step definitions
  const stepsList = [
    { num: 1, title: t("post.step1Title", "Purpose & Type") },
    { num: 2, title: t("post.step2Title", "Location") },
    { num: 3, title: t("post.step3Title", "Property Details") },
    { num: 4, title: t("post.step4Title", "Photographs") },
    { num: 5, title: t("post.step5Title", "Owner Details") },
    { num: 6, title: t("post.step6Title", "Review & Submit") },
  ];

  // =========================================================================
  // SUBMISSION SUCCESS VIEW
  // =========================================================================
  if (submissionSuccess) {
    const waText = formData.photosViaWhatsApp
      ? `வணக்கம் லேண்டோரா குழு, எனது பதிவு எண் #${submissionCode} (${formData.title}). இதற்கான சொத்து புகைப்படங்களை அனுப்ப வந்துள்ளேன்.`
      : `Hello Landora Team, I just submitted my property #${submissionCode} (${formData.title}). Please guide me on next steps.`;
    const waUrl = `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-emerald-50">
            <CheckCircle2 className="w-10 h-10 text-emerald-700" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            Reference ID: #{submissionCode}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("post.subSuccessTitle", "Property Submitted Successfully!")}
          </h2>

          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {t(
              "post.subSuccessDesc",
              "Our verification team will review and approve your listing shortly. Genuine buyers will be able to call you directly."
            )}
          </p>

          {/* WhatsApp Photo Followup card if photos were skipped */}
          {formData.photosViaWhatsApp && (
            <div className="mt-6 p-4 bg-emerald-50 border-2 border-dashed border-[#25D366] rounded-2xl text-left">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-6 h-6 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#0c4a3e]">
                    {language === "ta" ? "புகைப்படங்களை வாட்ஸ்அப்பில் அனுப்பவும்" : "Send Your Photos on WhatsApp"}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {language === "ta"
                      ? "நீங்கள் புகைப்படங்களை பின்னர் அனுப்புவதாகக் கூறியுள்ளீர்கள். உங்கள் மொபைல் கேலரியில் உள்ள படங்களை எங்கள் வாட்ஸ்அப் எண்ணுக்கு உடனே பகிருங்கள்."
                      : "You opted to share property photos via WhatsApp. Tap below to send them straight to our team."}
                  </p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow-xs hover:bg-[#1ebd59] transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{language === "ta" ? "வாட்ஸ்அப்பில் படங்களை அனுப்ப" : "Send Photos on WhatsApp Now"}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#08332b] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>{language === "ta" ? "லேண்டோரா குழுவுடன் பேச" : "Chat with Landora Support"}</span>
            </a>

            <Link
              href="/dashboard/seller/listings"
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              <span>{language === "ta" ? "எனது பதிவுகளை பார்க்க" : "View My Listings"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmissionSuccess(false);
              setStep(1);
            }}
            className="mt-6 text-xs text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
          >
            {language === "ta" ? "+ மற்றொரு சொத்தை பதிவிட" : "+ Post Another Property"}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN WIZARD RENDER
  // =========================================================================
  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 font-sans">
      {/* Top Header & Navigation Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isEditing ? "Edit Property Listing" : t("post.welcomeHeading", "Sell or Rent Your Property with Landora")}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "ta" ? "0% கமிஷன் & வாங்குவோரின் நேரடி அழைப்புகள்" : "100% Free Listing • Direct Genuine Buyer Calls"}
            </p>
          </div>

          {/* Reset / Clear draft button */}
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                if (confirm(language === "ta" ? "படிவத்தை மீட்டமைக்க விரும்புகிறீர்களா?" : "Clear draft and reset form?")) {
                  localStorage.removeItem(DRAFT_STORAGE_KEY);
                  setFormData(prev => ({
                    ...prev,
                    title: "",
                    description: "",
                    price: "",
                    area: "",
                    locality: "",
                    images: [],
                  }));
                  setStep(1);
                }
              }}
              title="Reset Form"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* 6-Step Desktop Progress Indicator */}
        <div className="hidden md:grid grid-cols-6 gap-1 text-center mt-4">
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
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                  isActive
                    ? "bg-[#0c4a3e] text-white border-[#0c4a3e] shadow-sm"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Step {s.num}</span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-700" />}
                </div>
                <div className="truncate text-[10px] font-normal">{s.title}</div>
              </button>
            );
          })}
        </div>

        {/* Mobile Step Bar */}
        <div className="md:hidden mt-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>
              Step {step} of {totalSteps}: {stepsList[step - 1]?.title}
            </span>
            <span className="text-[#0c4a3e]">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#0c4a3e] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Global Validation Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {language === "ta" ? "முக்கிய தகவல் தேவைப்படுகிறது:" : "Required Information Missing:"}
            </span>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Wizard Form Body */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8">

        {/* ========================================================================= */}
        {/* STEP 1: PROPERTY PURPOSE AND TYPE (Plot Priority!)                        */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Step 1 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {language === "ta" ? "சொத்து நோக்கம் & வகை" : "Property Purpose and Type"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === "ta"
                  ? "விற்பனை அல்லது வாடகை மற்றும் உங்கள் சொத்தின் வகையைத் தேர்ந்தெடுக்கவும்."
                  : "Choose whether you are selling or renting out, and specify your property type."}
              </p>
            </div>

            {/* 1A: Listing Purpose (Sell vs Rent) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1A. {language === "ta" ? "சொத்தின் நோக்கம் *" : "Listing Purpose *"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    type: "SALE" as ListingType,
                    title: language === "ta" ? "விற்பனை (Sell)" : "Sell Property",
                    sub: language === "ta" ? "மனைகள், வீடுகள் அல்லது நிலத்தை விற்க" : "I want to sell my plot or property",
                    icon: <Compass className="w-5 h-5 text-[#0c4a3e]" />,
                  },
                  {
                    type: "RENT" as ListingType,
                    title: language === "ta" ? "வாடகை (Rent / Lease)" : "Rent / Lease",
                    sub: language === "ta" ? "மாத வாடகை அல்லது குத்தகைக்கு விட" : "I want to rent out my house or building",
                    icon: <KeyRound className="w-5 h-5 text-blue-600" />,
                  },
                ].map(p => {
                  const isSelected = formData.listingType === p.type;
                  return (
                    <button
                      key={p.type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, listingType: p.type }))}
                      className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#0c4a3e] bg-emerald-50/50 shadow-xs ring-2 ring-[#0c4a3e]/15"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          {p.icon}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected ? "bg-[#0c4a3e] border-[#0c4a3e] text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">{p.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{p.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 1B: Property Category (Plots first priority!) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1B. {language === "ta" ? "சொத்து வகை *" : "Property Category *"}
                </label>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c59b27] text-slate-950">
                  ★ {language === "ta" ? "மனைகள் முன்னுரிமை" : "Plots & Land Priority"}
                </span>
              </div>

              {/* Group 1: Land & Plots (Priority) */}
              <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-200/80 mb-3">
                <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block mb-2">
                  1. {language === "ta" ? "மனைகள் & நிலங்கள்" : "Land & Plots"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "RESIDENTIAL_PLOT" as PropertyCategoryType,
                      title: language === "ta" ? "வீட்டு மனை (Plot)" : "Residential Plot",
                      sub: language === "ta" ? "DTCP / பஞ்சாயத்து மனை" : "DTCP / Layout Site",
                      icon: <LandPlot className="w-5 h-5 text-[#0c4a3e]" />,
                    },
                    {
                      id: "AGRICULTURAL_LAND" as PropertyCategoryType,
                      title: language === "ta" ? "விவசாய நிலம்" : "Farm / Agri Land",
                      sub: language === "ta" ? "தோட்டம், பன்னை நிலம்" : "Farmland, Coconut grove",
                      icon: <Compass className="w-5 h-5 text-emerald-700" />,
                    },
                    {
                      id: "COMMERCIAL_PLOT" as PropertyCategoryType,
                      title: language === "ta" ? "வணிக மனை" : "Commercial Land",
                      sub: language === "ta" ? "மெயின் ரோடு மனை" : "Main road frontage site",
                      icon: <Building2 className="w-5 h-5 text-amber-700" />,
                    },
                  ].map(cat => {
                    const isSelected = formData.propertyType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: cat.id }))}
                        className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#0c4a3e] bg-white shadow-sm ring-2 ring-[#0c4a3e]/20"
                            : "border-amber-200/60 bg-white hover:border-amber-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            {cat.icon}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0c4a3e] stroke-[3]" />}
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">{cat.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cat.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 2: Residential Properties */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-2">
                  2. {language === "ta" ? "குடியிருப்பு வீடுகள்" : "Residential Properties"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "HOUSE" as PropertyCategoryType,
                      title: language === "ta" ? "தனி வீடு" : "Independent House",
                      sub: language === "ta" ? "தனி வீடு / பகுதி" : "Individual house / portion",
                      icon: <Home className="w-5 h-5 text-emerald-600" />,
                    },
                    {
                      id: "VILLA" as PropertyCategoryType,
                      title: language === "ta" ? "வில்லா" : "Gated Villa",
                      sub: language === "ta" ? "பாதுகாக்கப்பட்ட வில்லா" : "Independent villa in layout",
                      icon: <Home className="w-5 h-5 text-[#0c4a3e]" />,
                    },
                    {
                      id: "APARTMENT" as PropertyCategoryType,
                      title: language === "ta" ? "அடுக்குமாடி" : "Apartment / Flat",
                      sub: language === "ta" ? "பிளாட் / குடியிருப்பு" : "Multi-floor flat unit",
                      icon: <Building2 className="w-5 h-5 text-blue-600" />,
                    },
                  ].map(cat => {
                    const isSelected = formData.propertyType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: cat.id }))}
                        className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#0c4a3e] bg-white shadow-sm ring-2 ring-[#0c4a3e]/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            {cat.icon}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0c4a3e] stroke-[3]" />}
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">{cat.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cat.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Commercial Properties */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-2">
                  3. {language === "ta" ? "வணிகச் சொத்துகள்" : "Commercial Properties"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: "COMMERCIAL_BUILDING" as PropertyCategoryType,
                      title: language === "ta" ? "வணிக வளாகம் / கடை" : "Shop / Commercial Building",
                      sub: language === "ta" ? "கடைகள், ஷோரூம்கள், அலுவலகங்கள்" : "Retail showroom, offices",
                      icon: <Store className="w-5 h-5 text-amber-600" />,
                    },
                    {
                      id: "INDUSTRIAL" as PropertyCategoryType,
                      title: language === "ta" ? "குடோன் / தொழிற்சாலை" : "Warehouse / Industrial",
                      sub: language === "ta" ? "தொழிற்பேட்டை, கிடங்கு" : "Shed, factory, logistics godown",
                      icon: <Warehouse className="w-5 h-5 text-slate-600" />,
                    },
                  ].map(cat => {
                    const isSelected = formData.propertyType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: cat.id }))}
                        className={`p-3 rounded-xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[#0c4a3e] bg-white shadow-sm ring-2 ring-[#0c4a3e]/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            {cat.icon}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0c4a3e] stroke-[3]" />}
                        </div>
                        <h5 className="font-bold text-xs text-slate-900">{cat.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cat.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PROPERTY LOCATION                                                 */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Step 2 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {language === "ta" ? "சொத்து அமைந்துள்ள இடம்" : "Property Location"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === "ta"
                  ? "நகரம், பகுதி மற்றும் சரியான முகவரியை உள்ளிடவும்."
                  : "Collect city, locality, and relevant address information for buyers."}
              </p>
            </div>

            {/* Quick Tamil Nadu City Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {language === "ta" ? "நகரம் / மாவட்டம் *" : "City / District *"}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  "Coimbatore",
                  "Chennai",
                  "Madurai",
                  "Tirupur",
                  "Salem",
                  "Erode",
                  "Trichy",
                  "Pollachi",
                  "Ooty",
                ].map(ct => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, city: ct }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      formData.city.toLowerCase() === ct.toLowerCase()
                        ? "bg-[#0c4a3e] text-white border-[#0c4a3e] shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Coimbatore, Chennai, Tirupur"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-medium"
                />
              </div>
            </div>

            {/* Locality & Landmark */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {language === "ta" ? "பகுதி / முக்கிய அடையாளம் *" : "Locality / Landmark *"}
              </label>
              <input
                type="text"
                value={formData.locality}
                onChange={e => setFormData(prev => ({ ...prev, locality: e.target.value }))}
                placeholder="e.g. Saravanampatti, near Tech Park or Gandhipuram Bus Stand"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {language === "ta"
                  ? "வாங்குவோர் எளிதில் அறிய உதவும் பகுதி அல்லது முக்கிய லேண்ட்மார்க்கை உள்ளிடவும்."
                  : "Enter the neighborhood name or nearby landmark for buyers to locate easily."}
              </p>
            </div>

            {/* Address / Street (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {language === "ta" ? "தெரு / லேஅவுட் முகவரி" : "Address / Layout Street"}
                </label>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. Plot No. 24, Green Garden Layout, 2nd Cross Street"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e]"
              />
            </div>

            {/* PIN Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === "ta" ? "அஞ்சல் குறியீடு (PIN Code) *" : "Postal PIN Code *"}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pinCode}
                  onChange={e => setFormData(prev => ({ ...prev, pinCode: e.target.value.replace(/\D/g, "") }))}
                  placeholder="e.g. 641035"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {language === "ta" ? "மாநிலம்" : "State"}
                </label>
                <input
                  type="text"
                  value={formData.state}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: PROPERTY DETAILS (Conditional fields!)                            */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Step 3 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {language === "ta" ? "சொத்து விவரங்கள் & விலை" : "Property Details and Pricing"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === "ta"
                  ? "பரப்பளவு, எதிர்பார்க்கும் விலை மற்றும் சொத்தின் முக்கிய விவரங்களை உள்ளிடவும்."
                  : "Collect property title, description, area, expected price, and specific parameters."}
              </p>
            </div>

            {/* Title with Smart Auto-Generator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {language === "ta" ? "விளம்பரத் தலைப்பு *" : "Property Title *"}
                </label>
                <button
                  type="button"
                  onClick={generateSuggestedTitle}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0c4a3e] hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>{language === "ta" ? "தானாக தலைப்பை உருவாக்க" : "Auto-Generate Title"}</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. North Facing 2400 Sq.Ft DTCP Approved Plot in Saravanampatti"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-semibold"
              />
            </div>

            {/* Area & Unit Selector */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {language === "ta" ? "பரப்பளவு & அளவு அலகு *" : "Area & Measurement Unit *"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    min="1"
                    value={formData.area}
                    onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g. 2400, 5.5, 2"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-bold bg-white"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "sqft", label: "Sq.Ft", ta: "ச.அடி" },
                    { id: "cent", label: "Cent", ta: "சென்ட்" },
                    { id: "acre", label: "Acre", ta: "ஏக்கர்" },
                    { id: "ground", label: "Ground", ta: "கிரவுண்ட்" },
                  ].map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, areaUnit: u.id }))}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer border ${
                        formData.areaUnit === u.id
                          ? "bg-[#0c4a3e] text-white border-[#0c4a3e] shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div>{u.label}</div>
                      <div className="text-[9px] opacity-75">{u.ta}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Section with Live In-Words converter */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isRent
                    ? language === "ta" ? "எதிர்பார்க்கும் மாத வாடகை (₹) *" : "Expected Monthly Rent (₹) *"
                    : language === "ta" ? "மொத்த எதிர்பார்க்கும் விலை (₹) *" : "Expected Total Price (₹) *"}
                </label>
                {formData.price && (
                  <span className="text-xs font-black text-[#0c4a3e]">
                    {formatIndianPriceWords(formData.price)}
                  </span>
                )}
              </div>

              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder={isRent ? "e.g. 15000" : "e.g. 4500000"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-black bg-white"
                />
              </div>

              {/* Price Negotiable toggle */}
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isNegotiable}
                    onChange={e => setFormData(prev => ({ ...prev, isNegotiable: e.target.checked }))}
                    className="w-4 h-4 text-[#0c4a3e] rounded border-slate-300 focus:ring-[#0c4a3e]"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {language === "ta" ? "விலை பேசக்கூடியது (Negotiable)" : "Price is Negotiable"}
                  </span>
                </label>

                {formData.pricePerUnit && (
                  <span className="text-xs font-bold text-slate-500">
                    Rate: {formData.pricePerUnit}
                  </span>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* CONDITIONAL SECTION: LAND / PLOT (Do not show for buildings)  */}
            {/* ------------------------------------------------------------- */}
            {isPlotOrLand && (
              <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                    {language === "ta" ? "மனை / நில பிரத்யேக விவரங்கள்" : "Land & Plot Specific Details"}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Approval Status */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {language === "ta" ? "அங்கீகார நிலை *" : "Approval Status *"}
                    </label>
                    <select
                      value={formData.approvalStatus}
                      onChange={e => setFormData(prev => ({ ...prev, approvalStatus: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#0c4a3e]"
                    >
                      <option value="DTCP Approved">DTCP Approved</option>
                      <option value="CMDA Approved">CMDA Approved</option>
                      <option value="RERA Approved">RERA Approved</option>
                      <option value="Panchayat Approved">Panchayat Approved</option>
                      <option value="Agricultural Patta">Agricultural / Clear Patta</option>
                      <option value="Freehold">Freehold / Unapproved</option>
                    </select>
                  </div>

                  {/* Facing Direction */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {language === "ta" ? "திசை (Facing)" : "Facing Direction"}
                    </label>
                    <select
                      value={formData.facing}
                      onChange={e => setFormData(prev => ({ ...prev, facing: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#0c4a3e]"
                    >
                      <option value="North">North (வடக்கு)</option>
                      <option value="East">East (கிழக்கு)</option>
                      <option value="South">South (தெற்கு)</option>
                      <option value="West">West (மேற்கு)</option>
                      <option value="North-East">North-East (வடகிழக்கு / ஈசானியம்)</option>
                      <option value="North-West">North-West (வடமேற்கு)</option>
                      <option value="South-East">South-East (தென்கிழக்கு)</option>
                      <option value="South-West">South-West (தென்மேற்கு)</option>
                    </select>
                  </div>

                  {/* Plot Dimensions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        {language === "ta" ? "மனை அளவுகள் (Dimensions)" : "Dimensions (L x W)"}
                      </label>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Optional</span>
                    </div>
                    <input
                      type="text"
                      value={formData.plotDimensions}
                      onChange={e => setFormData(prev => ({ ...prev, plotDimensions: e.target.value }))}
                      placeholder="e.g. 40 x 60 ft"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                    />
                  </div>

                  {/* Road Width */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        {language === "ta" ? "சாலை அகலம் (Road Width)" : "Road Width Facing (Ft)"}
                      </label>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Optional</span>
                    </div>
                    <input
                      type="number"
                      value={formData.roadWidthFt}
                      onChange={e => setFormData(prev => ({ ...prev, roadWidthFt: e.target.value }))}
                      placeholder="e.g. 30, 40"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                    />
                  </div>
                </div>

                {/* Additional land checkmarks */}
                <div className="pt-2 flex flex-wrap gap-4 border-t border-amber-200/60 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.boundaryWall}
                      onChange={e => setFormData(prev => ({ ...prev, boundaryWall: e.target.checked }))}
                      className="w-4 h-4 text-[#0c4a3e] rounded"
                    />
                    <span>{language === "ta" ? "சுற்றுச்சுவர் உள்ளது (Boundary Wall / Fencing)" : "Boundary Wall / Fencing Built"}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.gatedLayout}
                      onChange={e => setFormData(prev => ({ ...prev, gatedLayout: e.target.checked }))}
                      className="w-4 h-4 text-[#0c4a3e] rounded"
                    />
                    <span>{language === "ta" ? "பாதுகாக்கப்பட்ட கேடட் லேஅவுட்" : "Gated Township Layout"}</span>
                  </label>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* CONDITIONAL SECTION: RESIDENTIAL BUILDINGS                    */}
            {/* ------------------------------------------------------------- */}
            {isResidentialBuilding && (
              <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-900">
                    {language === "ta" ? "குடியிருப்பு வீட்டின் விவரங்கள்" : "Residential House / Apartment Specifics"}
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Bedrooms */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bedrooms *
                    </label>
                    <select
                      value={formData.bedrooms}
                      onChange={e => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Bathrooms *
                    </label>
                    <select
                      value={formData.bathrooms}
                      onChange={e => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  {/* Furnishing */}
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Furnishing Status
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: "Unfurnished", label: "Unfurnished" },
                        { id: "Semi-Furnished", label: "Semi" },
                        { id: "Fully-Furnished", label: "Fully" },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, furnishing: f.id as FurnishingStatus }))}
                          className={`py-1.5 text-center rounded-lg text-xs font-bold border transition ${
                            formData.furnishing === f.id
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Built-up Area (Sq.Ft)
                    </label>
                    <input
                      type="number"
                      value={formData.builtUpArea}
                      onChange={e => setFormData(prev => ({ ...prev, builtUpArea: e.target.value }))}
                      placeholder="e.g. 1450"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Floor No / Total Floors
                    </label>
                    <input
                      type="text"
                      value={formData.floorNo}
                      onChange={e => setFormData(prev => ({ ...prev, floorNo: e.target.value }))}
                      placeholder="e.g. 2nd Floor of 4"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* CONDITIONAL SECTION: COMMERCIAL PROPERTIES                   */}
            {/* ------------------------------------------------------------- */}
            {isCommercial && !isPlotOrLand && (
              <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                    Commercial Property Specifications
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Commercial Category *
                    </label>
                    <select
                      value={formData.commercialCategory}
                      onChange={e => setFormData(prev => ({ ...prev, commercialCategory: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="Retail Shop">Retail Shop</option>
                      <option value="Commercial Showroom">Commercial Showroom</option>
                      <option value="Office Space">Corporate Office Space</option>
                      <option value="Warehouse / Godown">Warehouse / Godown</option>
                      <option value="Industrial Shed">Industrial Shed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Washrooms
                    </label>
                    <select
                      value={formData.washrooms}
                      onChange={e => setFormData(prev => ({ ...prev, washrooms: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="Private">Private Dedicated</option>
                      <option value="Shared">Common / Shared</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* CONDITIONAL SECTION: RENTAL LISTINGS                         */}
            {/* ------------------------------------------------------------- */}
            {isRent && (
              <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-900">
                    Rental & Lease Terms
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Security Deposit (₹)
                    </label>
                    <input
                      type="text"
                      value={formData.securityDeposit}
                      onChange={e => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                      placeholder="e.g. 50,000 or 6 Months Rent"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Tenants
                    </label>
                    <select
                      value={formData.preferredTenant}
                      onChange={e => setFormData(prev => ({ ...prev, preferredTenant: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="Family / Working Professionals">Family / Working Professionals</option>
                      <option value="Family Only">Family Only</option>
                      <option value="Bachelors Allowed">Bachelors Allowed</option>
                      <option value="Company Lease">Company / Corporate Lease</option>
                      <option value="Any">Any Genuine Tenant</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {language === "ta" ? "விவரக் குறிப்பு (Description) *" : "Detailed Description *"}
                </label>
                <button
                  type="button"
                  onClick={generateSampleDescription}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0c4a3e] hover:underline cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === "ta" ? "மாதிரி விவரத்தை நிரப்புக" : "Use Sample Template"}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Highlight nearby roads, bus stand, water connection, title documents, approval details, etc."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e]"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Min 15 characters</span>
                <span>{formData.description.length} chars</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: PROPERTY PHOTOS (With WhatsApp Exemption Option!)                 */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Step 4 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {language === "ta" ? "சொத்து புகைப்படங்கள்" : "Property Photographs"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === "ta"
                  ? "கேமரா மூலம் படம் எடுக்கவும் அல்லது கேலரியில் இருந்து தேர்வு செய்யவும்."
                  : "Support multiple uploads, camera capture, gallery selection, previews, and removal."}
              </p>
            </div>

            {/* Hidden Inputs for Camera and Gallery */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />

            {/* Dual Accessible Upload Buttons: Camera & Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-4 rounded-2xl border-2 border-dashed border-[#0c4a3e]/40 hover:border-[#0c4a3e] bg-emerald-50/40 hover:bg-emerald-50 flex items-center justify-center gap-3 transition cursor-pointer text-slate-800 font-bold text-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center border border-emerald-200">
                  <Camera className="w-5 h-5 text-[#0c4a3e]" />
                </div>
                <div className="text-left">
                  <div>{t("post.takeCamera", "Take Photo with Camera")}</div>
                  <div className="text-[11px] text-slate-500 font-normal">Opens phone camera</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-3 transition cursor-pointer text-slate-800 font-bold text-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center border border-slate-200">
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-left">
                  <div>{t("post.chooseGallery", "Choose from Gallery")}</div>
                  <div className="text-[11px] text-slate-500 font-normal">Select multiple JPEG / PNG files</div>
                </div>
              </button>
            </div>

            {/* Upload Progress Bar */}
            {uploadingImage && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center animate-in fade-in">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0c4a3e] mb-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0c4a3e]" />
                  <span>Processing and preparing photographs... {uploadProgress}%</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0c4a3e] h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Image Previews Grid */}
            {formData.images.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Uploaded Photos ({formData.images.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`relative rounded-2xl overflow-hidden border-2 bg-slate-100 group transition shadow-2xs ${
                        img.isPrimary ? "border-[#0c4a3e] ring-2 ring-[#0c4a3e]/20" : "border-slate-200"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.caption || `Photo ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />

                      {/* Primary Badge */}
                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0c4a3e] text-white text-[10px] font-black flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current text-[#c59b27]" />
                          <span>Cover</span>
                        </div>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="p-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-bold hover:bg-white"
                            title="Set as Cover Photo"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CRITICAL: WhatsApp Exemption Card */}
            <div className="p-4 bg-emerald-50/70 border-2 border-dashed border-[#25D366] rounded-2xl">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.photosViaWhatsApp}
                  onChange={e => setFormData(prev => ({ ...prev, photosViaWhatsApp: e.target.checked }))}
                  className="w-5 h-5 text-[#25D366] rounded border-slate-300 focus:ring-[#25D366] mt-0.5"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span className="font-extrabold text-sm text-[#0c4a3e]">
                      {language === "ta"
                        ? "தற்போது புகைப்படங்கள் இல்லை — வாட்ஸ்அப்பில் பின்னர் அனுப்புகிறேன்"
                        : "I don't have photos right now — I will send photos via WhatsApp later"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {language === "ta"
                      ? "உங்கள் மொபைலில் தற்போது படங்கள் இல்லையென்றால், நீங்கள் விளம்பரத்தை இப்போது பதிவிட்டு விட்டு புகைப்படங்களை எங்கள் வாட்ஸ்அப் குழுவிற்கு பின்னர் அனுப்பலாம்."
                      : "Can't take or find photos right now? You can skip this step and send property photos to our team through WhatsApp anytime."}
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: OWNER DETAILS (MagicBricks Role + WhatsApp)                      */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Step 5 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {language === "ta" ? "உரிமையாளர் தொடர்பு விவரங்கள்" : "Owner Details"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === "ta"
                  ? "நேரடி வாங்குவோர் தொடர்புகொள்ள பெயர், மொபைல் எண் மற்றும் வாட்ஸ்அப் எண்ணை உள்ளிடவும்."
                  : "Collect name, mobile number, and WhatsApp number only if different."}
              </p>
            </div>

            {/* Poster Role: Owner, Agent, Builder (MagicBricks concept) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {language === "ta" ? "நீங்கள் யார்? (Posting as) *" : "Who is Posting this Property? *"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    role: "OWNER",
                    title: language === "ta" ? "நேரடி உரிமையாளர்" : "Direct Owner",
                    badge: "0% Brokerage",
                    icon: <UserCheck className="w-5 h-5 text-[#0c4a3e]" />,
                  },
                  {
                    role: "AGENT",
                    title: language === "ta" ? "முகவர் / ஆலோசகர்" : "Real Estate Agent",
                    badge: "Agent Portal",
                    icon: <Briefcase className="w-5 h-5 text-blue-700" />,
                  },
                  {
                    role: "BUILDER",
                    title: language === "ta" ? "கட்டுமான நிறுவனம்" : "Builder / Promoter",
                    badge: "Layout Promoter",
                    icon: <Building2 className="w-5 h-5 text-amber-700" />,
                  },
                ].map(r => {
                  const isSelected = formData.sellerType === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sellerType: r.role as any }))}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-[#0c4a3e] bg-emerald-50/50 shadow-2xs ring-2 ring-[#0c4a3e]/15"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          {r.icon}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0c4a3e] stroke-[3]" />}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{r.title}</h4>
                      <span className="text-[10px] text-emerald-800 font-semibold mt-0.5">{r.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {language === "ta" ? "முழுப் பெயர் *" : "Your Full Name *"}
              </label>
              <input
                type="text"
                value={formData.sellerName}
                onChange={e => setFormData(prev => ({ ...prev, sellerName: e.target.value }))}
                placeholder="e.g. Senthil Kumar"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-semibold"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {language === "ta" ? "மொபைல் எண் (அழைப்புகளுக்கு) *" : "Mobile Number for Buyer Calls *"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.sellerPhone}
                  onChange={e => setFormData(prev => ({ ...prev, sellerPhone: e.target.value.replace(/\D/g, "") }))}
                  placeholder="98422 12345"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-bold"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {language === "ta"
                  ? "உண்மை வாங்குவோர் உங்களை நேரடியாக அழைக்க இந்த எண் பயன்படுத்தப்படும்."
                  : "Genuine buyers will call this number directly without middlemen."}
              </p>
            </div>

            {/* WhatsApp Same as Phone Checkbox */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.whatsappSameAsPhone}
                  onChange={e => setFormData(prev => ({ ...prev, whatsappSameAsPhone: e.target.checked }))}
                  className="w-4 h-4 text-[#25D366] rounded border-slate-300 focus:ring-[#25D366]"
                />
                <span className="text-xs font-bold text-slate-800">
                  {language === "ta"
                    ? "எனது வாட்ஸ்அப் எண் இந்த மொபைல் எண்ணே தான்"
                    : "My WhatsApp number is the same as this mobile number"}
                </span>
              </label>

              {/* Conditional WhatsApp input if different */}
              {!formData.whatsappSameAsPhone && (
                <div className="pt-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {language === "ta" ? "மாற்று வாட்ஸ்அப் எண் *" : "Different WhatsApp Number *"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.sellerWhatsapp}
                      onChange={e => setFormData(prev => ({ ...prev, sellerWhatsapp: e.target.value.replace(/\D/g, "") }))}
                      placeholder="98422 99999"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-bold bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {language === "ta" ? "மின்னஞ்சல் முகவரி *" : "Email Address for Alerts *"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={formData.sellerEmail}
                  onChange={e => setFormData(prev => ({ ...prev, sellerEmail: e.target.value }))}
                  placeholder="senthil@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-medium"
                />
              </div>
            </div>

            {/* Communication Preferences & Future Notifications (Phase 4: DPDP & TRAI DLT Compliant) */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0c4a3e]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0c4a3e]">
                  {language === "ta" ? "தொடர்பு & அறிவிப்பு விருப்பங்கள்" : "Communication Preferences & Updates"}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === "ta"
                  ? "உங்கள் சொத்து சரிபார்ப்பு நிலை மற்றும் வாடிக்கையாளர் அழைப்புகள் பற்றிய தகவல்களை எவ்வாறு பெற விரும்புகிறீர்கள்?"
                  : "Choose how you would like to receive verification status updates and buyer alerts."}
              </p>

              <div className="space-y-2.5 pt-1">
                {/* 1. Transactional SMS */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.transactionalSms}
                    onChange={e => setFormData(prev => ({ ...prev, transactionalSms: e.target.checked }))}
                    className="w-4 h-4 text-[#0c4a3e] rounded border-slate-300 focus:ring-[#0c4a3e] mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {language === "ta" ? "முக்கிய எஸ்.எம்.எஸ் (SMS) தகவல்கள்" : "Transactional SMS Updates"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {language === "ta" ? "சரிபார்ப்பு நிலை மற்றும் வாங்குவோரின் நேரடி விசாரணை அறிவிப்புகள்" : "Important listing status, moderation review, and buyer enquiry notifications."}
                    </p>
                  </div>
                </label>

                {/* 2. Transactional WhatsApp */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.transactionalWhatsapp}
                    onChange={e => setFormData(prev => ({ ...prev, transactionalWhatsapp: e.target.checked }))}
                    className="w-4 h-4 text-[#25D366] rounded border-slate-300 focus:ring-[#25D366] mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {language === "ta" ? "வாட்ஸ்அப் (WhatsApp) உடனடி அறிவிப்புகள்" : "Transactional WhatsApp Updates"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {language === "ta" ? "வாட்ஸ்அப்பில் உடனடி சரிபார்ப்பு நிலை மற்றும் வாடிக்கையாளர் விவரங்கள்" : "Instant updates and buyer inquiry details sent directly to your WhatsApp."}
                    </p>
                  </div>
                </label>

                {/* 3. Promotional Offers (Strictly Separate & Non-preselected per DPDP rules) */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1.5 border-t border-emerald-100">
                  <input
                    type="checkbox"
                    checked={formData.promotionalOffers}
                    onChange={e => setFormData(prev => ({ ...prev, promotionalOffers: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {language === "ta" ? "சலுகைகள் மற்றும் புதிய சொத்து அறிவிப்புகள் (விருப்பத்தேர்வு)" : "Promotional Property Offers and Announcements (Optional)"}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {language === "ta" ? "ரியல் எஸ்டேட் விலை நிலவரம், சிறப்பு சலுகைகள் மற்றும் விளம்பர தள்ளுபடிகள்" : "Occasional updates about trending plots, market price trends, and special discounts."}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: REVIEW ALL DETAILS AND SUBMIT                                    */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Step 6 of 6
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {language === "ta" ? "விவரங்களை சரிபார்த்து சமர்ப்பிக்கவும்" : "Review All Details and Submit"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === "ta"
                  ? "பதிவிடும் முன் அனைத்து விவரங்களையும் ஒருமுறை சரிபார்க்கவும்."
                  : "Please review the summary below before submitting your property for moderation."}
              </p>
            </div>

            {/* Review Cards Grid */}
            <div className="space-y-3">
              {/* Card 1: Purpose & Type */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 1: Purpose & Type</span>
                  <div className="font-black text-sm text-slate-900 mt-0.5">
                    {formData.listingType === "RENT" ? "For Rent / Lease" : "For Sale"} • {formData.propertyType.replace(/_/g, " ")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Card 2: Location */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 2: Location</span>
                  <div className="font-black text-sm text-slate-900 mt-0.5">
                    {formData.locality}, {formData.city} - {formData.pinCode}
                  </div>
                  {formData.address && (
                    <div className="text-xs text-slate-500 mt-0.5">{formData.address}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Card 3: Details & Pricing */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 3: Details & Price</span>
                  <div className="font-black text-sm text-slate-900 mt-0.5">
                    {formData.title}
                  </div>
                  <div className="text-xs font-bold text-[#0c4a3e] mt-1">
                    {formatIndianPriceWords(formData.price)} • {formData.area} {formData.areaUnit.toUpperCase()}
                    {formData.pricePerUnit && ` (${formData.pricePerUnit})`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Card 4: Photographs */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 4: Photos</span>
                  {formData.photosViaWhatsApp ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0c4a3e] mt-1">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>Photos will be shared via WhatsApp later</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        {formData.images.length} Photo{formData.images.length > 1 ? "s" : ""} uploaded
                      </span>
                      {formData.images.length > 0 && (
                        <div className="flex gap-1">
                          {formData.images.slice(0, 3).map((im, i) => (
                            <img
                              key={i}
                              src={im.url}
                              alt=""
                              className="w-8 h-8 rounded-md object-cover border border-slate-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Card 5: Owner Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step 5: Contact</span>
                  <div className="font-black text-sm text-slate-900 mt-0.5">
                    {formData.sellerName} ({formData.sellerType})
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Phone: +91 {formData.sellerPhone} • Email: {formData.sellerEmail}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Card 6: Communication Preferences */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notifications & Consent</span>
                  <div className="text-xs font-bold text-slate-800 mt-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={formData.transactionalSms ? "text-emerald-700" : "text-slate-400"}>
                        {formData.transactionalSms ? "✓" : "✗"}
                      </span>
                      <span>Transactional SMS Updates</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={formData.transactionalWhatsapp ? "text-[#25D366]" : "text-slate-400"}>
                        {formData.transactionalWhatsapp ? "✓" : "✗"}
                      </span>
                      <span>Transactional WhatsApp Updates</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={formData.promotionalOffers ? "text-emerald-700" : "text-slate-400"}>
                        {formData.promotionalOffers ? "✓" : "✗"}
                      </span>
                      <span>Promotional Offers & Announcements</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            {/* Confirmation & Consent Checkmark */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-[#0c4a3e] rounded border-slate-300 focus:ring-[#0c4a3e] mt-0.5"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-medium">
                  {language === "ta"
                    ? "நான் வழங்கிய விவரங்கள் அனைத்தும் சரியானவை என்பதையும், லேண்டோராவின் விளம்பர விதிமுறைகளுக்கு உடன்படுகிறேன் என்பதையும் உறுதிசெய்கிறேன்."
                    : "I confirm that all details provided are accurate and I am authorized to publish this property listing on Landora."}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BOTTOM NAVIGATION CONTROLS (Back & Continue / Submit)                    */}
        {/* ========================================================================= */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            disabled={isSubmitting}
            className="py-3 px-5 rounded-2xl border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {step === 1 && onBackToWelcome
                ? language === "ta" ? "← விருப்பங்கள்" : "← Options"
                : t("post.prevStep", "Back")}
            </span>
          </button>

          {/* Continue / Submit button */}
          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-3.5 px-6 rounded-2xl bg-[#0c4a3e] hover:bg-[#08332b] text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{t("post.nextStep", "Continue")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitListing}
              disabled={isSubmitting || !termsAccepted}
              className={`py-3.5 px-8 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-[0.99] ${
                isSubmitting || !termsAccepted
                  ? "bg-slate-400 text-white cursor-not-allowed"
                  : "bg-[#0c4a3e] hover:bg-[#08332b] text-white"
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{t("post.submitting", "Submitting...")}</span>
                </>
              ) : (
                <>
                  <span>{t("post.submitListingBtn", "Submit Property Listing")}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
