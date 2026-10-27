"use client";

import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Lock,
  Smartphone,
  AlertCircle,
  UserCheck,
  Briefcase,
  Building2,
  Edit2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { normalizePhoneNumber } from "@/lib/sms";
import { UserRole } from "@/types";

export type AuthMethod = "phone" | "email" | "password" | "register";
export type AuthStep = "identifier" | "otp" | "success";

export default function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalConfig,
    closeAuthModal,
    sendMobileOtp,
    verifyMobileOtp,
    sendOtp,
    verifyOtp,
    login,
    register,
  } = useAuth();

  // Active step and method (Default to Phone OTP per Phase 3)
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");
  const [step, setStep] = useState<AuthStep>("identifier");

  // Inputs
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("BUYER");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);

  // Status and feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Focus references for inputs
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync config when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setAuthMethod(authModalConfig?.initialMethod || "phone");
      setStep("identifier");
      setError(null);
      setSuccessNotice(null);
      setOtpDigits(["", "", "", "", "", ""]);
      setPassword("");

      if (authModalConfig?.defaultPhone) {
        setPhoneNumber(authModalConfig.defaultPhone.replace(/\D/g, "").slice(-10));
      }
      if (authModalConfig?.defaultEmail) {
        setEmail(authModalConfig.defaultEmail);
      }

      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
    }
  }, [isAuthModalOpen, authModalConfig]);

  // Cooldown countdown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Keyboard Escape listener to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen && !isSubmitting) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, isSubmitting, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // --- Handlers: Send Mobile OTP ---
  const handleSendMobileOtp = async () => {
    setError(null);
    setSuccessNotice(null);

    const norm = normalizePhoneNumber(phoneNumber);
    if (!norm.isValid) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g. 98422 12345).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendMobileOtp(norm.e164);
      if (res.success) {
        setStep("otp");
        setCooldown(res.waitSeconds || 60);
        setSuccessNotice(res.message || `Verification code sent to +91 ******${norm.national.slice(-4)}`);
        setTimeout(() => {
          digitInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setError(res.error || "Failed to send verification SMS. Please retry.");
      }
    } catch {
      setError("Network connection error. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Send Email OTP ---
  const handleSendEmailOtp = async () => {
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(cleanEmail);
      if (res.success) {
        setStep("otp");
        setCooldown(res.waitSeconds || 60);
        setSuccessNotice(`Verification code sent to ${cleanEmail}.`);
        setTimeout(() => {
          digitInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setError(res.error || "Failed to dispatch email verification code.");
      }
    } catch {
      setError("Network error while requesting verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Verify OTP (Mobile or Email) ---
  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (authMethod === "phone") {
        const norm = normalizePhoneNumber(phoneNumber);
        const res = await verifyMobileOtp(norm.e164, code, {
          name,
          role,
        });

        if (res.success) {
          setStep("success");
          setTimeout(() => {
            closeAuthModal();
            if (authModalConfig?.onSuccess) {
              authModalConfig.onSuccess();
            }
            if (authModalConfig?.redirectTo) {
              router.push(authModalConfig.redirectTo);
            }
          }, 800);
        } else {
          setError(res.error || "Invalid code. Please retry.");
        }
      } else {
        // Email OTP
        const res = await verifyOtp(email.trim().toLowerCase(), code);
        if (res.success) {
          setStep("success");
          setTimeout(() => {
            closeAuthModal();
            if (authModalConfig?.onSuccess) {
              authModalConfig.onSuccess();
            }
            if (authModalConfig?.redirectTo) {
              router.push(authModalConfig.redirectTo);
            }
          }, 800);
        } else {
          setError(res.error || "Invalid code. Please retry.");
        }
      }
    } catch {
      setError("Verification failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Password Login ---
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        setStep("success");
        setTimeout(() => {
          closeAuthModal();
          if (authModalConfig?.onSuccess) authModalConfig.onSuccess();
          if (authModalConfig?.redirectTo) router.push(authModalConfig.redirectTo);
        }, 800);
      } else {
        setError(res.error || "Invalid credentials.");
      }
    } catch {
      setError("Login failed. Please retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers: Registration ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!phoneNumber.replace(/\D/g, "") || phoneNumber.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: normalizePhoneNumber(phoneNumber).e164,
        role,
        password,
      });

      if (res.success) {
        setStep("success");
        setTimeout(() => {
          closeAuthModal();
          if (authModalConfig?.onSuccess) authModalConfig.onSuccess();
          if (authModalConfig?.redirectTo) router.push(authModalConfig.redirectTo);
        }, 800);
      } else {
        setError(res.error || "Registration failed.");
      }
    } catch {
      setError("Registration failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Box Key navigation
  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const digits = paste.split("");
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = digits[i] || "";
    }
    setOtpDigits(updated);
    const nextIdx = Math.min(paste.length, 5);
    digitInputRefs.current[nextIdx]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="relative bg-gradient-to-br from-[#0c4a3e] to-[#072e27] p-6 text-white text-center">
          <button
            type="button"
            onClick={closeAuthModal}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 text-emerald-100 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            {authMethod === "phone" ? (
              <Smartphone className="w-6 h-6 text-emerald-300" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            )}
          </div>

          <h3 className="text-xl font-black tracking-tight">
            {authModalConfig?.title || "Sign In to Landora"}
          </h3>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
            {authModalConfig?.subtitle || "Verify your mobile number to post properties with 0% brokerage and receive buyer calls."}
          </p>
        </div>

        {/* Auth Method Navigation Tabs (Only in identifier step) */}
        {step === "identifier" && (
          <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setError(null);
              }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === "phone"
                  ? "bg-white text-[#0c4a3e] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setError(null);
              }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === "email"
                  ? "bg-white text-[#0c4a3e] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod("register");
                setError(null);
              }}
              className={`py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMethod === "register"
                  ? "bg-white text-[#0c4a3e] shadow-xs"
                  : "hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Info Message */}
          {successNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#0c4a3e] font-medium flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* =============================================================== */}
          {/* METHOD 1: MOBILE OTP IDENTIFIER                                 */}
          {/* =============================================================== */}
          {step === "identifier" && authMethod === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (India) *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 flex items-center gap-1.5 text-xs font-black text-slate-700">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMobileOtp()}
                    placeholder="98422 12345"
                    className="w-full pl-16 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-black tracking-wide"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  We will send a 6-digit OTP code to verify your mobile number.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendMobileOtp}
                disabled={isSubmitting || phoneNumber.replace(/\D/g, "").length < 10}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#08332b] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending SMS code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with Mobile OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Continue as Guest option if permitted */}
              {authModalConfig?.allowGuest && (
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (authModalConfig.onGuestContinue) {
                        authModalConfig.onGuestContinue();
                      }
                      closeAuthModal();
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Continue as Guest without login →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* METHOD 2: EMAIL OTP IDENTIFIER                                  */}
          {/* =============================================================== */}
          {step === "identifier" && authMethod === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendEmailOtp()}
                    placeholder="senthil@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] font-medium"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={isSubmitting || !email.includes("@")}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#08332b] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod("password")}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Admin / Password Login →
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* METHOD 3: PASSWORD LOGIN                                        */}
          {/* =============================================================== */}
          {step === "identifier" && authMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@landora.in"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c4a3e]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#08332b] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Sign In with Password"}
              </button>
            </form>
          )}

          {/* =============================================================== */}
          {/* METHOD 4: REGISTER NEW USER                                     */}
          {/* =============================================================== */}
          {step === "identifier" && authMethod === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Senthil Kumar"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (10 digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="98422 12345"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="senthil@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password (min 6 characters) *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "BUYER" as UserRole, label: "Buyer" },
                    { id: "SELLER" as UserRole, label: "Owner" },
                    { id: "AGENT" as UserRole, label: "Agent" },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`py-1.5 text-center rounded-lg text-xs font-bold border transition ${
                        role === r.id
                          ? "bg-[#0c4a3e] text-white border-[#0c4a3e]"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#08332b] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Create Account & Sign In"}
              </button>
            </form>
          )}

          {/* =============================================================== */}
          {/* STEP 2: 6-DIGIT OTP VERIFICATION ENTRY                          */}
          {/* =============================================================== */}
          {step === "otp" && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center">
                <span className="text-xs text-slate-500">Enter the 6-digit code sent to</span>
                <div className="font-bold text-sm text-slate-900 mt-0.5 flex items-center justify-center gap-1.5">
                  <span>{authMethod === "phone" ? `+91 ${phoneNumber}` : email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("identifier");
                      setError(null);
                    }}
                    className="text-[#0c4a3e] hover:underline"
                    title="Change"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-black text-xl rounded-2xl border-2 border-slate-300 focus:border-[#0c4a3e] focus:ring-2 focus:ring-[#0c4a3e]/20 text-slate-900 focus:outline-none transition shadow-2xs"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isSubmitting || otpDigits.join("").length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#08332b] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Cooldown Countdown */}
              <div className="text-center pt-1">
                {cooldown > 0 ? (
                  <span className="text-xs text-slate-400 font-medium">
                    Resend code in <strong className="text-slate-700">{cooldown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={authMethod === "phone" ? handleSendMobileOtp : handleSendEmailOtp}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c4a3e] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend verification code</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 3: SUCCESS STATE                                           */}
          {/* =============================================================== */}
          {step === "success" && (
            <div className="py-8 text-center space-y-3 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Successfully Verified!</h4>
              <p className="text-xs text-slate-500">Signing you in securely...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
