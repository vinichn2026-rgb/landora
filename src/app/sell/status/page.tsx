"use client";

import { CheckCircle2, Clock, MapPin, IndianRupee, Image as ImageIcon, ChevronRight, Edit3, ShieldAlert, Check } from "lucide-react";
import Link from "next/link";

export default function SubmissionStatusPage() {
  const steps = [
    {
      title: "Details Submitted",
      status: "completed",
      description: "Property information and media received.",
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />
    },
    {
      title: "Document & Boundary Verification",
      status: "in-progress",
      description: "Our legal team is reviewing ownership documents and map coordinates.",
      icon: <Clock className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Listing Live",
      status: "pending",
      description: "Property goes live on the marketplace for verified buyers.",
      icon: <div className="w-6 h-6 rounded-full border-2 border-neutral-300 bg-neutral-50" />
    },
    {
      title: "Buyer Leads Connected",
      status: "pending",
      description: "Direct connections with interested and verified buyers.",
      icon: <div className="w-6 h-6 rounded-full border-2 border-neutral-300 bg-neutral-50" />
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Submission Successful!</h1>
          <p className="text-neutral-500 text-lg">Your property details have been securely received.</p>
        </div>

        {/* SLA Notice Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
          <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Verification in Progress</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Our verification team verifies records against state portal databases within <strong>24 hours</strong>. You will be notified via WhatsApp and email once approved.
            </p>
          </div>
        </div>

        {/* Listing Preview Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="w-full sm:w-32 h-32 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0 border border-neutral-200 overflow-hidden relative">
            {/* Mock Thumbnail Image placeholder */}
            <ImageIcon className="w-10 h-10 text-neutral-300" />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
              ENTRANCE
            </div>
          </div>
          
          <div className="flex-1 w-full space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-neutral-900">5.5 Acres Agricultural Land</h3>
                <div className="flex items-center gap-1 text-sm text-neutral-500 mt-1">
                  <MapPin className="w-4 h-4" /> Madurai District
                </div>
              </div>
              <button className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit Details">
                <Edit3 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="bg-neutral-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-neutral-700">
                <span className="text-neutral-400">Survey No:</span> 142/2A
              </div>
              <div className="bg-green-50 px-3 py-1.5 rounded-lg flex items-center text-green-700">
                <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> 50,00,000
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stepper Component */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Listing Status</h2>
          
          <div className="space-y-0 relative">
            <div className="absolute top-4 bottom-8 left-[11px] w-0.5 bg-neutral-200"></div>
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="relative z-10 bg-white pt-1">
                  {step.icon}
                </div>
                <div className={`pt-1 ${step.status === 'pending' ? 'opacity-50' : ''}`}>
                  <h4 className={`font-bold ${
                    step.status === 'completed' ? 'text-green-700' : 
                    step.status === 'in-progress' ? 'text-blue-700' : 'text-neutral-700'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-neutral-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col items-center gap-4">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-neutral-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 transition shadow-sm">
            Go to Seller Dashboard <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
