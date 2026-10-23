"use client";

import { useState } from "react";
import { ShieldCheck, IndianRupee, MapPin, User, Building, ArrowRight } from "lucide-react";

export default function GetStartedPage() {
  const [role, setRole] = useState<"owner" | "agent">("owner");
  const [otpSent, setOtpSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Supportive Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-green-900 text-white p-8 md:p-12 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-8">Sell securely, sell faster.</h2>
        
        <div className="space-y-8">
          <div className="flex gap-4">
            <ShieldCheck className="w-8 h-8 text-green-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">100% Secure & Private</h3>
              <p className="text-green-100 text-sm">Your exact location and contact details are hidden until you authorize a verified buyer.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <IndianRupee className="w-8 h-8 text-green-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Zero Listing Fees</h3>
              <p className="text-green-100 text-sm">List your property for free. We charge absolutely zero commission on your sale.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <MapPin className="w-8 h-8 text-green-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Map-Verified Leads</h3>
              <p className="text-green-100 text-sm">Buyers are filtered through OTP verification and map-based intent matching.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create your seller account</h1>
            <p className="text-neutral-500 mb-8 text-sm">Join thousands of sellers finding direct buyers.</p>

            {/* Role Switcher */}
            <div className="flex p-1 bg-neutral-100 rounded-xl mb-8">
              <button
                onClick={() => setRole("owner")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition ${
                  role === "owner" 
                    ? "bg-white text-green-700 shadow-sm border border-neutral-200/50" 
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <User className="w-4 h-4" /> Individual Land Owner
              </button>
              <button
                onClick={() => setRole("agent")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition ${
                  role === "agent" 
                    ? "bg-white text-green-700 shadow-sm border border-neutral-200/50" 
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <Building className="w-4 h-4" /> Agent / Broker
              </button>
            </div>

            {/* Input Form */}
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name" 
                  className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="w-20 p-3.5 border border-neutral-300 rounded-xl flex items-center justify-center bg-neutral-50 text-neutral-700 font-medium">
                    +91
                  </div>
                  <input 
                    type="tel" 
                    placeholder="98765 43210" 
                    className="flex-1 p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition text-neutral-900 font-medium tracking-wide"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Enter OTP</label>
                  <input 
                    type="text" 
                    placeholder="6-digit code" 
                    maxLength={6}
                    className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition text-neutral-900 text-center tracking-[0.5em] font-medium"
                  />
                  <div className="text-right mt-2">
                    <button type="button" className="text-xs text-green-600 font-medium hover:underline">Resend OTP</button>
                  </div>
                </div>
              )}

              {/* Agent Disclaimer */}
              {role === "agent" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start animate-in fade-in zoom-in-95 duration-300">
                  <input 
                    type="checkbox" 
                    id="agent-auth"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-600 border-amber-300" 
                  />
                  <label htmlFor="agent-auth" className="text-sm text-amber-900 font-medium leading-relaxed">
                    I confirm that I have direct authorization and access to the land owner for this property, and I agree to facilitate communication transparently.
                  </label>
                </div>
              )}

              {/* Submit Action */}
              <button 
                type="button"
                onClick={() => !otpSent && setOtpSent(true)}
                disabled={role === "agent" && !agreedToTerms}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-green-200"
              >
                {otpSent ? "Verify & Continue" : "Send OTP"} 
                {!otpSent && <ArrowRight className="w-5 h-5" />}
              </button>
              
              {!otpSent && (
                <p className="text-xs text-center text-neutral-500 mt-4">
                  By proceeding, you agree to our Terms of Service & Privacy Policy.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
