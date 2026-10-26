"use client";

import { useState } from "react";
import {
  Compass,
  Home,
  KeyRound,
  Building2,
  CheckCircle2,
  PhoneCall,
  MessageCircle,
  Share2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Languages,
  Check
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { 
  SUPPORT_PHONE, 
  SUPPORT_PHONE_DISPLAY, 
  SUPPORT_WHATSAPP, 
  SUPPORT_WHATSAPP_DISPLAY 
} from "@/lib/constants";
import { ListingType, PropertyCategoryType } from "@/types";

export type PrimarySubmissionChoice = "plot" | "sell" | "rent" | "commercial";

interface PostPropertyWelcomeProps {
  onContinue: (config: {
    choice: PrimarySubmissionChoice;
    listingType: ListingType;
    propertyType: PropertyCategoryType;
  }) => void;
  initialChoice?: PrimarySubmissionChoice;
  isWhatsAppReferral?: boolean;
}

export default function PostPropertyWelcome({
  onContinue,
  initialChoice = "plot",
  isWhatsAppReferral = false,
}: PostPropertyWelcomeProps) {
  const { language, setLanguage, t } = useLanguage();
  const [selectedChoice, setSelectedChoice] = useState<PrimarySubmissionChoice>(initialChoice);
  const [shareCopied, setShareCopied] = useState(false);

  // Configuration for the 4 primary choices
  const choices = [
    {
      id: "plot" as PrimarySubmissionChoice,
      listingType: "SALE" as ListingType,
      propertyType: "RESIDENTIAL_PLOT" as PropertyCategoryType,
      title: t("post.optSellPlot", "Sell Land or Plot"),
      subtitle: t("post.optSellPlotDesc", "Residential plots, layout sites, farmland parcels"),
      badge: language === "ta" ? "முதன்மை தேர்வு" : "TOP PRIORITY",
      badgeColor: "bg-[#c59b27] text-slate-950 font-black",
      icon: <Compass className="w-7 h-7 sm:w-8 sm:h-8 text-[#0c4a3e]" />,
      colorClass: "hover:border-[#0c4a3e] bg-white",
    },
    {
      id: "sell" as PrimarySubmissionChoice,
      listingType: "SALE" as ListingType,
      propertyType: "HOUSE" as PropertyCategoryType,
      title: t("post.optSellProperty", "Sell a Property"),
      subtitle: t("post.optSellPropertyDesc", "Independent house, villa, flat or apartment"),
      badge: language === "ta" ? "வீடு / கட்டடம்" : "HOME / VILLA",
      badgeColor: "bg-emerald-100 text-emerald-800 font-bold",
      icon: <Home className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-700" />,
      colorClass: "hover:border-[#0c4a3e] bg-white",
    },
    {
      id: "rent" as PrimarySubmissionChoice,
      listingType: "RENT" as ListingType,
      propertyType: "HOUSE" as PropertyCategoryType,
      title: t("post.optRentProperty", "Rent a Property"),
      subtitle: t("post.optRentPropertyDesc", "Rent out your house, flat, or portion"),
      badge: language === "ta" ? "வாடகை" : "RENT / LEASE",
      badgeColor: "bg-blue-100 text-blue-800 font-bold",
      icon: <KeyRound className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />,
      colorClass: "hover:border-blue-500 bg-white",
    },
    {
      id: "commercial" as PrimarySubmissionChoice,
      listingType: "SALE" as ListingType,
      propertyType: "COMMERCIAL_PLOT" as PropertyCategoryType,
      title: t("post.optCommercial", "List Commercial Property"),
      subtitle: t("post.optCommercialDesc", "Commercial plots, shops, offices, or buildings"),
      badge: language === "ta" ? "வணிகம்" : "COMMERCIAL",
      badgeColor: "bg-amber-100 text-amber-900 font-bold",
      icon: <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />,
      colorClass: "hover:border-amber-500 bg-white",
    },
  ];

  const handleProceed = () => {
    const selected = choices.find((c) => c.id === selectedChoice) || choices[0];
    onContinue({
      choice: selected.id,
      listingType: selected.listingType,
      propertyType: selected.propertyType,
    });
  };

  // WhatsApp Help Message
  const whatsappHelpText = language === "ta"
    ? "வணக்கம் லேண்டோரா குழு, எனது சொத்தை லேண்டோராவில் பதிவிட உதவி தேவை. தயவுசெய்து வழிகாட்டவும்."
    : "Hello Landora Team, I need help posting my property on Landora. Please assist me.";

  const whatsappHelpUrl = `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(
    whatsappHelpText
  )}`;

  // Share via WhatsApp Link handler
  const handleShareOnWhatsApp = () => {
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/post-property?source=whatsapp&lang=${language}`
      : "https://landora.in/post-property?source=whatsapp";

    const shareMsg = language === "ta"
      ? `லேண்டோராவில் 0% கமிஷனில் உங்கள் நிலம் அல்லது வீட்டை விற்க/வாடகைக்கு விட: ${shareUrl}`
      : `Sell or Rent your plot or property with 0% brokerage on Landora: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: "Landora Post Property",
        text: shareMsg,
        url: shareUrl,
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`, "_blank");
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-8 font-sans">
      {/* Top Bar: Language Toggle & WhatsApp Referral Pill */}
      <div className="flex items-center justify-between gap-3 mb-6 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Language Selection Buttons */}
        <div className="flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-[#0c4a3e] shrink-0 ml-1" />
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
            {language === "ta" ? "மொழி:" : "Language:"}
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                language === "en"
                  ? "bg-white text-[#0c4a3e] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ta")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                language === "ta"
                  ? "bg-[#0c4a3e] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Share via WhatsApp link trigger */}
        <button
          type="button"
          onClick={handleShareOnWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#25D366]/10 text-[#075e54] hover:bg-[#25D366]/20 border border-[#25D366]/30 transition cursor-pointer"
          title="Share link on WhatsApp"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">{t("post.shareLink", "Share on WhatsApp")}</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-5 sm:p-8">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-[#0c4a3e] border border-emerald-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
          <span>{t("post.zeroBrokerage", "100% Free & 0% Brokerage")}</span>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {t("post.welcomeHeading", "Sell or Rent Your Property with Landora")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          {t("post.welcomeSubtitle", "List your property in a few easy steps. Need help? Our team is here for you.")}
        </p>

        {/* WhatsApp Referral Welcome Banner if opened from WhatsApp */}
        {isWhatsAppReferral && (
          <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs text-[#0c4a3e] font-semibold animate-in fade-in">
            <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0" />
            <span>
              {language === "ta" 
                ? "வாட்ஸ்அப் மூலம் வருகை தந்தமைக்கு நன்றி! உங்கள் விருப்பத்தைத் தேர்ந்தெடுத்து எளிதாகத் தொடருங்கள்."
                : "Welcome from WhatsApp! Select your property choice below to begin listing."}
            </span>
          </div>
        )}

        {/* Four Primary Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
          {choices.map((c) => {
            const isSelected = selectedChoice === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedChoice(c.id)}
                className={`relative text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[125px] ${c.colorClass} ${
                  isSelected
                    ? "border-[#0c4a3e] bg-emerald-50/50 shadow-md ring-2 ring-[#0c4a3e]/15"
                    : "border-slate-200 hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Top: Icon + Badge + Check circle */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {c.icon}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition border ${
                        isSelected
                          ? "bg-[#0c4a3e] border-[#0c4a3e] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {c.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Action: Continue Button */}
        <div className="mt-6 pt-2">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-4 px-6 rounded-2xl bg-[#0c4a3e] hover:bg-[#072e27] text-white font-black text-base shadow-lg transition hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>{t("post.continueBtn", "Continue to Post Property")}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Assistance / Support Strip: WhatsApp & Call Us */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
            {language === "ta" ? "உதவி தேவையா? எங்களை தொடர்பு கொள்ளவும்" : "Need assistance? Talk to our support team"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Help on WhatsApp Button */}
            <a
              href={whatsappHelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t("post.helpWhatsApp", "Help on WhatsApp")}</span>
            </a>

            {/* Call Us Button */}
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#0c4a3e]" />
              <span>{t("post.callUs", "Call Us")}: {SUPPORT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>

        {/* Benefits Strip at Bottom */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t("post.zeroBrokerage", "0% Brokerage")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <PhoneCall className="w-4 h-4 text-[#0c4a3e]" />
            <span>{t("post.directCalls", "Direct Buyer Calls")}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-[#c59b27]" />
            <span>{t("post.fastListing", "Fast 2-Min Listing")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
