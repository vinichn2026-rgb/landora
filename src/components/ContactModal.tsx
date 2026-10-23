"use client";

import { useState } from "react";
import { X, Phone, MessageSquare, ShieldCheck, CheckCircle2, User, Send } from "lucide-react";

export interface PropertyListing {
  id: string;
  title: string;
  location: string;
  price: string;
  pricePerUnit: string;
  area: string;
  type: string;
  approval: string;
  ownerName: string;
  ownerType: string;
  phone: string;
}

interface ContactModalProps {
  property: PropertyListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ property, isOpen, onClose }: ContactModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("I am interested in this land/plot. Please share survey details, layout copy, and location coordinates.");

  if (!isOpen || !property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#004882] text-white p-5 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-blue-100">
              Verified Seller Contact
            </span>
            <h3 className="text-lg font-bold mt-1 text-white leading-tight">
              Contact Landowner / Agent
            </h3>
            <p className="text-xs text-blue-100 mt-0.5">
              Instant contact details & document sharing
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property Brief Card */}
        <div className="bg-blue-50/70 p-4 border-b border-blue-100 flex items-center justify-between text-xs sm:text-sm">
          <div>
            <p className="font-bold text-slate-900 line-clamp-1">{property.title}</p>
            <p className="text-slate-600 text-xs mt-0.5">{property.location} • <span className="font-semibold text-slate-800">{property.area}</span></p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-extrabold text-[#005ca8] text-base">{property.price}</p>
            <p className="text-[11px] text-slate-500">{property.pricePerUnit}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Owner Info Box */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 rounded-full bg-[#005ca8] text-white flex items-center justify-center font-bold text-sm">
                  {property.ownerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-sm">{property.ownerName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> {property.ownerType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#005ca8]" />
                    {property.phone.replace(/(\d{5})$/, "XXXXX")} (Revealed on enquiry)
                  </p>
                </div>
              </div>

              {/* Inquiry Form Fields */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kannan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#005ca8] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Mobile Number (WhatsApp) *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold rounded-l-lg">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-sm border border-slate-300 rounded-r-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#005ca8] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message for Landowner</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#005ca8] focus:border-transparent"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#005ca8] hover:bg-[#004882] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Get Owner Contact & Details Free
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                🔒 Your details are safe with us. Zero spam guarantee under Thennatu Nilam privacy code.
              </p>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Enquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  The verified seller has been notified with your requirements.
                </p>
              </div>

              {/* Revealed Contact Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left">
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Direct Landowner Phone:</p>
                <p className="text-xl font-extrabold text-slate-900 font-mono mt-1 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  {property.phone}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Owner: <span className="font-semibold text-slate-800">{property.ownerName}</span>
                </p>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
