"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, ArrowRight, Building2, MapPin, Handshake, Lock, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SellHubPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const recentListings = [
    "5 Acres in Madurai",
    "2.5 Acres in Coimbatore",
    "10 Acres in Ramanathapuram",
    "1.2 Acres near ECR, Chennai",
    "8 Acres in Trichy",
  ];

  const sellerOptions = [
    {
      title: "Post Direct Land / Plot",
      description: "100% Free direct buyer listing for individual plot and land owners.",
      icon: <MapPin className="w-8 h-8 text-[#005ca8] mb-4" />,
      color: "bg-blue-50/60 border-blue-200 hover:border-[#005ca8]",
      badge: "FREE"
    },
    {
      title: "List DTCP / RERA Layout",
      description: "Promoter inventory with verified approvals & master layout upload.",
      icon: <Building2 className="w-8 h-8 text-indigo-600 mb-4" />,
      color: "bg-indigo-50/60 border-indigo-200 hover:border-indigo-600",
      badge: "FEATURED"
    },
    {
      title: "Joint Development (JD)",
      description: "Partner with top tier builders & developers for prime land parcels.",
      icon: <Handshake className="w-8 h-8 text-amber-600 mb-4" />,
      color: "bg-amber-50/60 border-amber-200 hover:border-amber-600",
      badge: "PREMIUM"
    },
    {
      title: "Private / HNI Off-Market",
      description: "Confidential institutional & HNI matching for high-ticket estates.",
      icon: <Lock className="w-8 h-8 text-slate-600 mb-4" />,
      color: "bg-slate-50 border-slate-200 hover:border-slate-500",
      badge: "PRIVATE"
    },
  ];

  const faqs = [
    {
      question: "Is posting property on Thennatu Nilam really free?",
      answer: "Yes, posting your land or plot is 100% free with 0% brokerage. You connect directly with verified buyers without any commission."
    },
    {
      question: "How long does it take for a listing to go live?",
      answer: "Our operations desk verifies property details and basic revenue records within 12 to 24 hours, after which your listing goes live to over 50,000 active buyers."
    },
    {
      question: "What documents should I keep ready?",
      answer: "Having your Patta number, survey number, FMB copy, and layout sketch ready speeds up verification and generates 3x more buyer inquiries."
    },
    {
      question: "Will my contact number be protected from spam?",
      answer: "Yes! Thennatu Nilam uses privacy protection. Only verified buyers with active phone numbers can request your contact info."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 font-sans flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/80 via-white to-[#f7f9fb] overflow-hidden border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#005ca8]/10 text-[#005ca8] px-3.5 py-1 rounded-full text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Thennatu Nilam Free Property Posting Portal
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Post Your Land or Plot for <span className="text-[#005ca8]">FREE</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
            Get instant inquiries from over 50,000+ verified buyers across Tamil Nadu. Zero brokerage, 100% direct deals.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link 
              href="/sell/form" 
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-[#005ca8] rounded-xl hover:bg-[#004882] transition shadow-lg shadow-blue-200 cursor-pointer"
            >
              Post Land Now - It&apos;s Free <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              href="/sell/get-started" 
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <div className="w-full bg-[#002f5a] text-blue-100 py-2.5 overflow-hidden flex whitespace-nowrap text-xs font-medium border-y border-slate-800">
        <div className="flex items-center gap-8 animate-pulse">
          <span className="font-bold text-amber-300 uppercase tracking-wider ml-4">Recent Verified Inquiries:</span>
          {recentListings.map((listing, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              {listing}
            </span>
          ))}
        </div>
      </div>

      {/* Seller Categories Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Choose Your Listing Type</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Select the option that matches your land and target buyer audience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sellerOptions.map((opt) => (
            <div 
              key={opt.title}
              className={`p-6 rounded-2xl border transition shadow-xs hover:shadow-xl bg-white ${opt.color} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                    {opt.badge}
                  </span>
                </div>
                {opt.icon}
                <h3 className="font-bold text-slate-900 text-base mb-2">{opt.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{opt.description}</p>
              </div>

              <Link
                href="/post-property"
                className="mt-6 text-xs font-bold text-[#005ca8] flex items-center gap-1 hover:underline"
              >
                Continue listing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works 3-step section */}
      <section className="py-14 px-4 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-extrabold uppercase text-[#005ca8] tracking-wider">Fast & Hassle-Free</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 mb-8">
            Sell in 3 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-[#005ca8] text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Add Land Details</h3>
              <p className="text-xs text-slate-500">
                Enter your location, plot size, survey number, and expected price in under 2 minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-[#005ca8] text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Get Verified Badge</h3>
              <p className="text-xs text-slate-500">
                Our verification desk checks your DTCP/Patta details to award the verified trust badge.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-[#005ca8] text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Close Deal Directly</h3>
              <p className="text-xs text-slate-500">
                Receive direct calls and WhatsApp enquiries from genuine buyers with 0% brokerage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-14 px-4 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Everything you need to know about selling land on Thennatu Nilam</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-[#005ca8] transition cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-[#005ca8]" : ""}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
