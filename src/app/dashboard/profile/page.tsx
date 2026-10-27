"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Lock, CheckCircle2, ShieldCheck, Building2, Loader2, MessageSquare, Bell, AlertCircle, RefreshCw } from "lucide-react";
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

  // Communication Preferences State (Phase 4: DPDP & TRAI Compliant)
  const [transactionalSms, setTransactionalSms] = useState(true);
  const [transactionalWhatsapp, setTransactionalWhatsapp] = useState(true);
  const [promotionalOffers, setPromotionalOffers] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<string | null>(null);
  const [consentSource, setConsentSource] = useState<string | null>(null);
  const [optOutTimestamp, setOptOutTimestamp] = useState<string | null>(null);
  const [optOutReason, setOptOutReason] = useState<string | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false);
  const [prefError, setPrefError] = useState("");
  const [isOptingOut, setIsOptingOut] = useState(false);

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

      // Fetch communication preferences
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/user/communication-preferences");
      const data = await res.json();
      if (data.success && data.preferences) {
        setTransactionalSms(data.preferences.transactionalSms);
        setTransactionalWhatsapp(data.preferences.transactionalWhatsapp);
        setPromotionalOffers(data.preferences.promotionalOffers);
        setConsentTimestamp(data.preferences.consentTimestamp);
        setConsentSource(data.preferences.consentSource);
        setOptOutTimestamp(data.preferences.optOutTimestamp);
        setOptOutReason(data.preferences.optOutReason);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    setPrefError("");
    setPrefSaveSuccess(false);

    try {
      const res = await fetch("/api/user/communication-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber || user?.phoneNumber,
          transactionalSms,
          transactionalWhatsapp,
          promotionalOffers,
          consentSource: "USER_PROFILE_SETTINGS",
        }),
      });

      const data = await res.json();
      setIsSavingPrefs(false);

      if (data.success) {
        setPrefSaveSuccess(true);
        setConsentTimestamp(data.preferences?.consentTimestamp || new Date().toISOString());
        setOptOutTimestamp(null);
        setOptOutReason(null);
        setTimeout(() => setPrefSaveSuccess(false), 3500);
      } else {
        setPrefError(data.error || "Failed to update communication preferences.");
      }
    } catch {
      setIsSavingPrefs(false);
      setPrefError("Network error updating communication preferences.");
    }
  };

  const handleWithdrawConsent = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw all communication consent? Future SMS and WhatsApp updates regarding your property submissions and buyer inquiries will be paused."
    );
    if (!confirmed) return;

    setIsOptingOut(true);
    setPrefError("");
    try {
      const res = await fetch("/api/user/communication-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          reason: "User requested full withdrawal from dashboard profile",
        }),
      });

      const data = await res.json();
      setIsOptingOut(false);

      if (data.success) {
        setTransactionalSms(false);
        setTransactionalWhatsapp(false);
        setPromotionalOffers(false);
        setOptOutTimestamp(new Date().toISOString());
        setOptOutReason("User requested full withdrawal from dashboard profile");
        setPrefSaveSuccess(true);
        setTimeout(() => setPrefSaveSuccess(false), 3500);
      } else {
        setPrefError(data.error || "Failed to withdraw consent.");
      }
    } catch {
      setIsOptingOut(false);
      setPrefError("Network error processing consent withdrawal.");
    }
  };

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

          {/* ========================================================================= */}
          {/* COMMUNICATION PREFERENCES & CONSENT CARD (DPDP & TRAI COMPLIANT)          */}
          {/* ========================================================================= */}
          <div className="bg-white border border-[#e2e8e4] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0c4a3e]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    Communication Preferences & Future Notifications
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    DPDP Act 2023 & TRAI DLT Compliant Notification Settings
                  </p>
                </div>
              </div>

              <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 text-[#0c4a3e] border border-emerald-200">
                Active Preferences
              </span>
            </div>

            {/* Explanatory context about property updates */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1.5">
              <p className="font-bold text-slate-800">
                Why we send property submission updates:
              </p>
              <p>
                When you list plots or properties on Landora, our moderation team performs document and boundary reviews. We send essential transactional alerts so you know when your property is under review, approved, published live, or if additional title information is needed. Direct buyer inquiries are also dispatched immediately.
              </p>
              <p className="text-[11px] text-slate-500">
                Under Indian data protection guidelines, promotional messages are kept strictly separate and will never be sent unless you explicitly check the option below.
              </p>
            </div>

            {/* Opt-out alert if user has withdrawn consent */}
            {optOutTimestamp && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Communication Consent Withdrawn</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    You opted out on {new Date(optOutTimestamp).toLocaleDateString()} at {new Date(optOutTimestamp).toLocaleTimeString()}. All automated SMS and WhatsApp alerts are currently paused. You can re-enable preferences below at any time.
                  </p>
                </div>
              </div>
            )}

            {/* Success & Error alerts */}
            {prefSaveSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your communication preferences have been updated and saved securely.</span>
              </div>
            )}
            {prefError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{prefError}</span>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="mt-6 space-y-4">
              {/* Option 1: Transactional SMS */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-white flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <label htmlFor="pref-sms" className="block text-xs font-bold text-slate-900 cursor-pointer">
                      Transactional SMS Updates
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive critical SMS alerts about property submission receipt, verification review stages, approval notifications, and instant buyer inquiry alerts.
                    </p>
                  </div>
                </div>
                <input
                  id="pref-sms"
                  type="checkbox"
                  checked={transactionalSms}
                  onChange={(e) => setTransactionalSms(e.target.checked)}
                  className="w-4 h-4 text-[#0c4a3e] rounded border-slate-300 focus:ring-[#0c4a3e] cursor-pointer mt-1"
                />
              </div>

              {/* Option 2: Transactional WhatsApp */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 transition flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 mt-0.5">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.353.101.173.449.741.964 1.2 0.662.591 1.22.774 1.393.861.173.086.275.072.376-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z" />
                    </svg>
                  </div>
                  <div>
                    <label htmlFor="pref-wa" className="block text-xs font-bold text-slate-900 cursor-pointer">
                      Transactional WhatsApp Updates
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive instant automated alerts on WhatsApp through Landora’s verified business profile for submission status and buyer callbacks.
                    </p>
                  </div>
                </div>
                <input
                  id="pref-wa"
                  type="checkbox"
                  checked={transactionalWhatsapp}
                  onChange={(e) => setTransactionalWhatsapp(e.target.checked)}
                  className="w-4 h-4 text-[#25D366] rounded border-slate-300 focus:ring-[#25D366] cursor-pointer mt-1"
                />
              </div>

              {/* Option 3: Promotional Property Offers (Strictly Separate & Non-Preselected) */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 hover:border-amber-300 transition flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="pref-promo" className="block text-xs font-bold text-slate-900 cursor-pointer">
                        Promotional Property Offers and Announcements
                      </label>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Optional
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Receive occasional updates about new high-yield layout plots, regional property value trends, platform feature announcements, and seller discount packages. (Never pre-selected).
                    </p>
                  </div>
                </div>
                <input
                  id="pref-promo"
                  type="checkbox"
                  checked={promotionalOffers}
                  onChange={(e) => setPromotionalOffers(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer mt-1"
                />
              </div>

              {/* Consent Metadata Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <div>
                  {consentTimestamp ? (
                    <span>Last consent recorded: {new Date(consentTimestamp).toLocaleDateString()} {new Date(consentTimestamp).toLocaleTimeString()} ({consentSource || "User Profile"})</span>
                  ) : (
                    <span>Default transactional consent active for registered mobile number.</span>
                  )}
                </div>
                {phoneNumber && (
                  <span className="font-semibold text-slate-600">
                    Target Phone: {phoneNumber}
                  </span>
                )}
              </div>

              {/* Actions: Save & Withdraw Consent */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleWithdrawConsent}
                  disabled={isOptingOut || isSavingPrefs}
                  className="w-full sm:w-auto text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 rounded-xl transition cursor-pointer border border-rose-200"
                >
                  {isOptingOut ? "Processing Opt-Out..." : "Withdraw All Consent (Opt-Out)"}
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSavingPrefs || isOptingOut}
                  >
                    {isSavingPrefs ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Preferences...
                      </span>
                    ) : (
                      <span>Save Communication Preferences</span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
