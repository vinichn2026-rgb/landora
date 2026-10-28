"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  ChevronRight,
  ShieldAlert,
  Check,
  MessageCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

function StatusContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const steps = [
    {
      title: "Details Submitted & Database Persisted",
      status: "completed",
      description: "Property information, pricing, and media records safely saved.",
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Document & Boundary Verification",
      status: "in-progress",
      description: "Our legal and field verification team is reviewing records against land portal databases.",
      icon: <Clock className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Listing Live & Published",
      status: "pending",
      description: "Property goes live on the Landora marketplace for verified genuine buyers.",
      icon: <div className="w-6 h-6 rounded-full border-2 border-neutral-300 bg-neutral-50" />,
    },
    {
      title: "Buyer Inquiries Connected",
      status: "pending",
      description: "Direct connections with pre-screened buyers looking in your area.",
      icon: <div className="w-6 h-6 rounded-full border-2 border-neutral-300 bg-neutral-50" />,
    },
  ];

  const waNumber = SUPPORT_WHATSAPP.replace(/\D/g, "");
  const waHelpText = refCode
    ? `Hello Landora Support, I am checking the status of my property submission #${refCode}. Please guide me on next steps.`
    : `Hello Landora Support, I have a query about my property submission.`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waHelpText)}`;

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <Link href="/post-property" className="inline-flex items-center gap-1 hover:text-neutral-900 font-semibold transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Post Property Portal</span>
          </Link>
          <span className="font-mono bg-neutral-200/80 px-2.5 py-1 rounded-md text-neutral-700 font-bold">
            {refCode ? `Ref: #${refCode}` : "Submission Tracker"}
          </span>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50 shadow-inner">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <div className="inline-block px-3 py-1 bg-green-50 text-green-800 text-xs font-bold rounded-full border border-green-200">
            STATUS: SUBMITTED (UNDER REVIEW)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Submission Status
          </h1>
          <p className="text-neutral-600 text-sm max-w-md mx-auto">
            {refCode
              ? `Your property submission #${refCode} is undergoing review by the Landora verification desk.`
              : "Your property details have been securely received and recorded."}
          </p>
        </div>

        {/* SLA Notice Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex gap-3.5 items-start">
          <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-1">Verification SLA: Within 24 Hours</h3>
            <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
              Our team verifies land records against official survey registries within <strong>24 business hours</strong>. You will receive updates via WhatsApp and SMS per your preferences.
            </p>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200">
          <h2 className="text-base sm:text-lg font-black text-neutral-900 mb-6 tracking-tight">
            Verification & Publishing Workflow
          </h2>
          
          <div className="space-y-0 relative">
            <div className="absolute top-4 bottom-8 left-[11px] w-0.5 bg-neutral-200" />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-5 pb-8 last:pb-0">
                <div className="relative z-10 bg-white pt-1">
                  {step.icon}
                </div>
                <div className={`pt-1 ${step.status === "pending" ? "opacity-50" : ""}`}>
                  <h4 className={`text-sm font-bold ${
                    step.status === "completed" ? "text-green-700" : 
                    step.status === "in-progress" ? "text-blue-700" : "text-neutral-700"
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* WhatsApp Support Action */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2.5 active:scale-[0.99]"
          >
            <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
            <span>Chat with Landora Verification Desk on WhatsApp</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/dashboard/seller/listings"
              className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              <span>View in Seller Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/post-property"
              className="py-3 px-4 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              <span>+ Post Another Property</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SubmissionStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-sm text-neutral-500">
          Loading submission status...
        </div>
      }
    >
      <StatusContent />
    </Suspense>
  );
}
