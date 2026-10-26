"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import PostPropertyWelcome, { PrimarySubmissionChoice } from "./PostPropertyWelcome";
import PropertyPublishWizard from "./PropertyPublishWizard";
import { ListingType, PropertyCategoryType } from "@/types";
import { Loader2 } from "lucide-react";

function PostPropertyContent() {
  const searchParams = useSearchParams();
  const { setLanguage } = useLanguage();

  // Check URL parameters for WhatsApp source, language, and property type
  const sourceParam = searchParams.get("source") || searchParams.get("ref");
  const isWhatsApp = sourceParam === "whatsapp" || sourceParam === "wa";
  const langParam = searchParams.get("lang");
  const typeParam = searchParams.get("type");
  const modeParam = searchParams.get("mode");

  // Sync language if provided in WhatsApp URL (e.g. ?lang=ta)
  useEffect(() => {
    if (langParam === "ta" || langParam === "en") {
      setLanguage(langParam);
    }
  }, [langParam, setLanguage]);

  // Determine initial choice from URL (?type=plot | sell | rent | commercial)
  const resolveInitialChoice = (): PrimarySubmissionChoice => {
    if (typeParam === "plot" || typeParam === "land") return "plot";
    if (typeParam === "sell" || typeParam === "house") return "sell";
    if (typeParam === "rent") return "rent";
    if (typeParam === "commercial") return "commercial";
    return "plot"; // Default to Plots Priority
  };

  // View mode: "welcome" (Phase 1 WhatsApp Entry Landing) or "wizard" (Step-by-Step Flow)
  const [viewMode, setViewMode] = useState<"welcome" | "wizard">(
    modeParam === "wizard" ? "wizard" : "welcome"
  );

  // Selected configuration to pass down to wizard
  const [wizardConfig, setWizardConfig] = useState<{
    choice: PrimarySubmissionChoice;
    listingType: ListingType;
    propertyType: PropertyCategoryType;
  }>({
    choice: resolveInitialChoice(),
    listingType: resolveInitialChoice() === "rent" ? "RENT" : "SALE",
    propertyType:
      resolveInitialChoice() === "plot"
        ? "RESIDENTIAL_PLOT"
        : resolveInitialChoice() === "commercial"
        ? "COMMERCIAL_PLOT"
        : "HOUSE",
  });

  // Handle continuing from the Phase 1 Welcome Screen
  const handleWelcomeContinue = (config: {
    choice: PrimarySubmissionChoice;
    listingType: ListingType;
    propertyType: PropertyCategoryType;
  }) => {
    setWizardConfig(config);
    setViewMode("wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle returning back to the Welcome Screen to change choice
  const handleBackToWelcome = () => {
    setViewMode("welcome");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (viewMode === "wizard") {
    return (
      <div className="py-2 sm:py-4">
        <PropertyPublishWizard
          initialData={{
            listingType: wizardConfig.listingType,
            propertyType: wizardConfig.propertyType,
          }}
          onBackToWelcome={handleBackToWelcome}
        />
      </div>
    );
  }

  // Phase 1: WhatsApp Entry and User-Friendly Welcome Screen
  return (
    <PostPropertyWelcome
      onContinue={handleWelcomeContinue}
      initialChoice={wizardConfig.choice}
      isWhatsAppReferral={isWhatsApp}
    />
  );
}

export default function PostPropertyClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#0c4a3e] mb-3" />
          <p className="text-xs font-semibold">Loading Landora Property Desk...</p>
        </div>
      }
    >
      <PostPropertyContent />
    </Suspense>
  );
}
