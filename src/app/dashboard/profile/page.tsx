"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Lock, CheckCircle2, ShieldCheck, Building2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("Coimbatore");
  const [state, setState] = useState("Tamil Nadu");
  const [pinCode, setPinCode] = useState("");
  const [bio, setBio] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [reraRegistration, setReraRegistration] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhoneNumber(user.phoneNumber || "");
      setCity(user.profile?.city || user.city || "Coimbatore");
      setState(user.profile?.state || "Tamil Nadu");
      setPinCode(user.profile?.pinCode || "");
      setBio(user.profile?.bio || "");
      setCompanyName(user.profile?.companyName || "");
      setReraRegistration(user.profile?.reraRegistration || "");
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phoneNumber,
          city,
          state,
          pinCode,
          bio,
          companyName,
          reraRegistration,
        }),
      });

      const data = await res.json();
      setIsSaving(false);

      if (data.success) {
        setSaveSuccess(true);
        await refreshUser();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch {
      setIsSaving(false);
      setError("Network error updating profile.");
    }
  };

  const isProfessional = user?.role === "SELLER" || user?.role === "AGENT" || user?.role === "BUILDER";

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-3xl space-y-6">
          {/* Header Bar */}
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0c4a3e] mb-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
              Profile & Account Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your personal information, contact preferences, and public seller identity.
            </p>
          </div>

          {/* Profile Form Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8e4] p-6 sm:p-8 shadow-xs">
            {saveSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile changes saved successfully!</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Account Meta Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  {name ? name.charAt(0) : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{name || "User"}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{user?.email}</span>
                    <span>•</span>
                    <span className="font-bold text-[#0c4a3e] bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase">
                      {user?.role || "BUYER"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City / Locality"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
                <Input
                  label="PIN Code"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="e.g. 641004"
                />
              </div>

              {/* Professional Fields for Sellers, Agents, and Builders */}
              {isProfessional && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#0c4a3e]" />
                    <span>Business & Statutory Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Agency / Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Prime Promoters Pvt Ltd"
                    />
                    <Input
                      label="TN RERA Registration No. (Optional)"
                      value={reraRegistration}
                      onChange={(e) => setReraRegistration(e.target.value)}
                      placeholder="e.g. TN/AGENT/2026/0122"
                    />
                  </div>
                </div>
              )}

              {/* Bio / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  About You / Seller Description
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short introduction or background about your land parcels and properties..."
                  className="w-full text-xs sm:text-sm bg-[#fbfbfa] border border-[#e2e8e4] rounded-xl p-3 outline-none focus:border-[#0c4a3e] focus:bg-white text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
                    </span>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
