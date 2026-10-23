"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, ChevronLeft, MapPin, Upload, FileText, IndianRupee } from "lucide-react";

export default function SellLandPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 9;

  // Placeholder form state
  const [formData, setFormData] = useState({
    sellerType: "",
    district: "",
    taluk: "",
    village: "",
    propertyType: "",
    area: "",
    unit: "ACRE",
    price: "",
    negotiable: true,
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold text-green-700">Land Marketplace</div>
          <a href="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-800">Back to Home</a>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-8 px-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
          
          {/* Progress Bar */}
          <div className="bg-neutral-100 h-2 w-full">
            <div 
              className="h-full bg-green-600 transition-all duration-300" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <div className="p-6 md:p-10 flex-1">
            <div className="mb-8">
              <span className="text-green-600 font-semibold text-sm tracking-wider uppercase mb-2 block">Step {step} of {totalSteps}</span>
              <h1 className="text-2xl font-bold text-neutral-800">
                {step === 1 && "Who is listing this property?"}
                {step === 2 && "Where is the land located?"}
                {step === 3 && "Land Details"}
                {step === 4 && "Pricing"}
                {step === 5 && "Upload Photos & Videos"}
                {step === 6 && "Your Contact Info"}
                {step === 7 && "Verification Documents"}
                {step === 8 && "Review Listing"}
                {step === 9 && "Success"}
              </h1>
            </div>

            {/* Content Based on Step */}
            <div className="min-h-[300px]">
              
              {/* STEP 1: Seller Type */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["OWNER", "AGENT", "DEVELOPER"].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setFormData({ ...formData, sellerType: type })}
                      className={`p-6 rounded-xl border-2 text-center transition ${
                        formData.sellerType === type 
                          ? "border-green-600 bg-green-50 text-green-800" 
                          : "border-neutral-200 hover:border-green-300"
                      }`}
                    >
                      <h3 className="font-bold capitalize">{type.toLowerCase()}</h3>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">District</label>
                    <select className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600">
                      <option>Select District...</option>
                      <option>Madurai</option>
                      <option>Ramanathapuram</option>
                      <option>Coimbatore</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Taluk</label>
                      <input type="text" placeholder="e.g. Melur" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Village</label>
                      <input type="text" placeholder="e.g. Navinipatti" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-neutral-100 rounded-lg flex items-center justify-center gap-2 text-neutral-600 hover:bg-neutral-200 mt-4 transition">
                    <MapPin className="w-5 h-5" /> Drop Pin on Map
                  </button>
                </div>
              )}

              {/* STEP 3: Land Details */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Type</label>
                    <select className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600">
                      <option>Agricultural Land</option>
                      <option>Residential Plot</option>
                      <option>Commercial Land</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Area</label>
                      <input type="number" placeholder="e.g. 5" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit</label>
                      <select className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600">
                        <option>Acre</option>
                        <option>Cent</option>
                        <option>Sq.ft</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Road Width (ft)</label>
                      <input type="number" placeholder="e.g. 30" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Survey Number</label>
                      <input type="text" placeholder="Optional" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Pricing */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Asking Price (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3.5 w-5 h-5 text-neutral-400" />
                      <input type="number" placeholder="e.g. 5000000" className="w-full p-3 pl-10 border border-neutral-300 rounded-lg outline-none focus:border-green-600 text-lg font-medium" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Per acre: Calculated automatically</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="negotiable" className="w-5 h-5 text-green-600" defaultChecked />
                    <label htmlFor="negotiable" className="font-medium text-neutral-700">Price is Negotiable</label>
                  </div>
                </div>
              )}

              {/* STEP 5: Media */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-neutral-300 rounded-xl p-10 text-center hover:bg-neutral-50 transition cursor-pointer">
                    <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-4" />
                    <h3 className="font-medium text-neutral-800">Upload Photos</h3>
                    <p className="text-sm text-neutral-500 mt-1">PNG, JPG, up to 10MB each.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">YouTube Video Link (Optional)</label>
                    <input type="url" placeholder="https://youtube.com/..." className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                  </div>
                </div>
              )}

              {/* STEP 6: Seller Contact */}
              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full p-3 border border-neutral-300 rounded-lg outline-none focus:border-green-600" />
                  </div>
                </div>
              )}

              {/* STEP 7: Verification Documents */}
              {step === 7 && (
                <div className="space-y-6">
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                    <p className="text-sm text-amber-800">
                      Providing legal documents helps verify your listing faster and builds trust with buyers. These will <strong>not</strong> be made public.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full p-4 border border-neutral-300 rounded-xl flex items-center justify-between hover:bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <FileText className="text-neutral-400" />
                        <span className="font-medium">Upload Patta / Chitta</span>
                      </div>
                      <span className="text-sm text-neutral-500">Optional</span>
                    </button>
                    <button className="w-full p-4 border border-neutral-300 rounded-xl flex items-center justify-between hover:bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <FileText className="text-neutral-400" />
                        <span className="font-medium">Upload EC (Encumbrance Certificate)</span>
                      </div>
                      <span className="text-sm text-neutral-500">Optional</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 8: Preview */}
              {step === 8 && (
                <div className="space-y-6 bg-neutral-50 p-6 rounded-xl border border-neutral-200">
                  <h3 className="font-bold text-lg border-b pb-2">Listing Summary</h3>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="text-neutral-500">Seller Type</div>
                    <div className="font-medium">{formData.sellerType || "Not specified"}</div>
                    
                    <div className="text-neutral-500">Location</div>
                    <div className="font-medium">Selected Location...</div>
                    
                    <div className="text-neutral-500">Property</div>
                    <div className="font-medium">Agricultural Land - 5 Acres</div>
                    
                    <div className="text-neutral-500">Asking Price</div>
                    <div className="font-medium text-green-700">₹ 50,00,000</div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-4">
                    By submitting, you agree that marketplace verification does not replace independent legal due diligence.
                  </div>
                </div>
              )}

              {/* STEP 9: Success */}
              {step === 9 && (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
                  <h2 className="text-3xl font-bold text-neutral-800 mb-2">Listing Submitted!</h2>
                  <p className="text-neutral-600 mb-8 max-w-md">
                    Your listing is under review. Our admin team will verify the details and location before it goes live on the marketplace.
                  </p>
                  <a href="/" className="bg-neutral-100 px-6 py-3 rounded-lg font-medium hover:bg-neutral-200 transition">
                    Return to Homepage
                  </a>
                </div>
              )}

            </div>
          </div>

          {/* Footer Controls */}
          {step < 9 && (
            <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition ${
                  step === 1 ? "text-neutral-400 cursor-not-allowed" : "text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
              >
                {step === 8 ? "Submit for Verification" : "Continue"} <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
