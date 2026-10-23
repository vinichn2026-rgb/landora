"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, ShieldAlert, Flag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { APP_NAME } from "@/lib/constants";

export default function ReportListingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [listingId, setListingId] = useState("");
  const [reason, setReason] = useState("MISLEADING_PRICE");
  const [details, setDetails] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12">
        <Container className="max-w-2xl">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
              Moderation & Due Diligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight mt-2">
              Report a Problematic Listing
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Help keep {APP_NAME} safe and transparent. Reports are reviewed by our moderation desk within 12 hours.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8e4] shadow-xs">
            {submitted ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#0c4a3e] mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-[#0c4a3e]">Report Submitted</h3>
                <p className="text-xs text-slate-600">
                  Thank you for helping maintain transparency. Our compliance team will inspect listing #{listingId || "specified"} and take appropriate action.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Listing ID or Property URL"
                  placeholder="e.g. PROP-101 or paste property link"
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  required
                />

                <Select
                  label="Primary Reason for Report"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  options={[
                    { value: "MISLEADING_PRICE", label: "Misleading or fraudulent price" },
                    { value: "ALREADY_SOLD", label: "Property already sold or unavailable" },
                    { value: "UNAUTHORIZED_BROKER", label: "Unauthorized broker posing as direct owner" },
                    { value: "FAKE_APPROVAL", label: "False claim of DTCP / CMDA approval" },
                    { value: "WRONG_LOCATION", label: "Incorrect locality or pin location" },
                    { value: "DUPLICATE", label: "Duplicate or spam listing" },
                    { value: "OTHER", label: "Other regulatory or ownership concern" },
                  ]}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Details & Evidence
                  </label>
                  <textarea
                    rows={4}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-[#0c4a3e] focus:outline-none focus:ring-1 focus:ring-[#0c4a3e]"
                    placeholder="Provide specific details (e.g., owner did not authorize, price quoted over phone is different, etc.)"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Your Email (Optional, for status updates)"
                  type="email"
                  placeholder="your-email@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full justify-center bg-rose-700 hover:bg-rose-800 border-none text-white">
                  <Flag className="w-4 h-4 mr-1.5" />
                  <span>Submit Listing Report</span>
                </Button>
              </form>
            )}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
