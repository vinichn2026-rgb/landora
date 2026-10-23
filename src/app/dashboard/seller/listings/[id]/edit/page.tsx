"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Building2 } from "lucide-react";
import PropertyPublishWizard from "@/components/seller/PropertyPublishWizard";
import { PropertyItem } from "@/types";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      try {
        const res = await fetch(`/api/seller/listings/${resolvedParams.id}`);
        const data = await res.json();
        if (data.success && data.listing) {
          setProperty(data.listing);
        } else {
          setErrorMsg(data.error || "Property listing not found or unauthorized.");
        }
      } catch {
        setErrorMsg("Failed to connect to server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadListing();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-xs text-slate-500">
        Loading listing details for editing...
      </div>
    );
  }

  if (errorMsg || !property) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600">{errorMsg || "You are not authorized to edit this listing."}</p>
          <div className="pt-2">
            <Link
              href="/dashboard/seller/listings"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0c4a3e] text-white rounded-xl text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Listings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-4xl mx-auto px-4 mb-2">
        <Link
          href="/dashboard/seller/listings"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Listings</span>
        </Link>
      </div>

      <PropertyPublishWizard initialData={property} isEditing={true} />
    </div>
  );
}
