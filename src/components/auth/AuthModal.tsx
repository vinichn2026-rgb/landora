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
  Info,
  AlertCircle,
  Edit2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { OTP_COOLDOWN_SECONDS } from "@/lib/constants";

/**
 * Authentication Modes:
 * - "email" (Current Default): User logs in with Email Address + 6-digit OTP code.
 * - "phone" (Ready for Future): Easily switchable to Phone Number + SMS OTP code.
 * - "password": Fallback method for pre-seeded administrator or developer accounts.
 */
export type AuthMethod = "email" | "phone";
export type AuthStep = "identifier" | "otp" | "success" | "password";

export default function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalConfig,
    closeAuthModal,
    sendOtp,
    verifyOtp,
    login,
  } = useAuth();

  // Active step and authentication method
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [step, setStep] = useState<AuthStep>("identifier");

  // Form inputs
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");

  // Status and feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<string | null>(null);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Focus references for the 6 OTP input boxes
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Sync default email if passed in config
  useEffect(() => {
    if (isAuthModalOpen) {
      if (authModalConfig?.defaultEmail) {
        setEmail(authModalConfig.defaultEmail);
      }
      setStep("identifier");
      setError(null);
      setSuccessNotice(null);
      setDevNotice(null);
      setSuggestedCode(null);
      setOtpDigits(["", "", "", "", "", ""]);
      setPassword("");

      // Focus email input
      setTimeout(() => {
        emailInputRef.current?.focus();
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

  // Handle outside click dismissal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      closeAuthModal();
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setDevNotice(null);
    setSuggestedCode(null);

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const res = await sendOtp(normalizedEmail);
    setIsSubmitting(false);

    if (res.success) {
      setStep("otp");
      setCooldown(res.waitSeconds || OTP_COOLDOWN_SECONDS);

      if (res.suggestedCode) {
        setSuggestedCode(res.suggestedCode);
      }
      if (res.devNotice) {
        setDevNotice(res.devNotice);
      }
      if (res.emailSent) {
        setSuccessNotice(res.message || `Verification code sent to ${normalizedEmail}`);
      }

      // Auto-focus first digit box
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 150);
    } else {
      setError(res.error || "Failed to send verification code. Please try again.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  // Helper: Autofill test code (super convenient for testing!)
  const handleAutofillCode = (code: string) => {
    const chars = code.split("").slice(0, 6);
    const updated = ["", "", "", "", "", ""];
    chars.forEach((c, idx) => {
      updated[idx] = c;
    });
    setOtpDigits(updated);
    setError(null);
    // Focus last box
    digitInputRefs.current[5]?.focus();
  };

  // Step 2: Handle individual digit input
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1); // only take single numeric digit
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError(null);

    // Auto-advance focus to next digit box
    if (digit && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across digit boxes
  const handleDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        digitInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle Paste event for 6-digit code
  const handleDigitPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setOtpDigits(newDigits);
    setError(null);

    // Focus appropriate box
    const nextIndex = Math.min(pastedData.length, 5);
    digitInputRefs.current[nextIndex]?.focus();
  };

  // Step 2: Verify OTP and complete authentication
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    const res = await verifyOtp(email.trim().toLowerCase(), fullCode);
    setIsSubmitting(false);

    if (res.success) {
      setStep("success");

      // Successful verification workflow
      setTimeout(() => {
        closeAuthModal();

        // 1. Run action callback if provided (e.g. saving property to shortlist)
        if (authModalConfig?.onSuccess) {
          authModalConfig.onSuccess();
        }

        // 2. Redirect to target page if requested (e.g. /post-property, /dashboard)
        if (authModalConfig?.redirectTo) {
          router.push(authModalConfig.redirectTo);
        }
      }, 700);
    } else {
      setError(res.error || "Invalid verification code. Please check and try again.");
    }
  };

  // Password Login Handler (Alternative method for seed accounts)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email address and password.");
      return;
    }

    setIsSubmitting(true);
    const res = await login(email.trim().toLowerCase(), password);
    setIsSubmitting(false);

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
      }, 700);
    } else {
      setError(res.error || "Invalid email or password.");
    }
  };

  if (!isAuthModalOpen) return null;

  const modalTitle = authModalConfig?.title || "Sign In to Landora";
  const modalSubtitle =
    authModalConfig?.subtitle ||
    "Enter your email to verify with a one-time password (OTP). Quick, secure & passwordless.";

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800"
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 bg-gradient-to-r from-[#0c4a3e] via-[#10b981] to-[#c59b27]" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 relative">
          {/* Close button */}
          <button
            type="button"
            onClick={closeAuthModal}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Verification Method Status Badge */}
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0c4a3e] border border-emerald-200">
              <Mail className="w-3 h-3 text-emerald-600" />
              <span>Email & OTP Login</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              (Phone SMS OTP switchable)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {modalTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {modalSubtitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 pt-5">
          {/* SUCCESS SCREEN */}
          {step === "success" && (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0c4a3e] flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-pulse">
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Verified Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Welcome to Landora. Logging you in now...
              </p>
            </div>
          )}

          {/* STEP 1: EMAIL INPUT FORM */}
          {step === "identifier" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email (e.g. name@gmail.com)"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0c4a3e]/30 focus:border-[#0c4a3e] text-slate-900 transition"
                    autoComplete="email"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>We will send a 6-digit instant verification code to this email.</span>
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white font-bold text-sm shadow-md transition hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Get Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Toggle to Password or Demo Admin Login */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep("password");
                    setError(null);
                  }}
                  className="hover:text-[#0c4a3e] font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign in with Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("buyer@example.com");
                  }}
                  className="text-[11px] text-[#0c4a3e] font-bold hover:underline"
                >
                  Use Demo Email
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION FORM */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Recipient Notice with Edit button */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                    Code sent to:
                  </span>
                  <span className="font-bold text-slate-900 truncate block">
                    {email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("identifier");
                    setError(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#0c4a3e] hover:underline shrink-0"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* Development / Sandbox Test Helper Card */}
              {suggestedCode && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-amber-900">Test Code: </span>
                      <span className="font-mono font-black text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded tracking-widest text-xs">
                        {suggestedCode}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAutofillCode(suggestedCode)}
                    className="text-[11px] font-black text-[#0c4a3e] bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* 6-Digit OTP Box Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        digitInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={handleDigitPaste}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center font-black text-lg sm:text-xl rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] focus:border-[#0c4a3e] text-slate-900 bg-white shadow-2xs transition"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
              </div>

              {/* Status / Error alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {successNotice && !error && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isSubmitting || otpDigits.join("").length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white font-bold text-sm shadow-md transition hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Code with Cooldown */}
              <div className="pt-2 text-center text-xs text-slate-500">
                {cooldown > 0 ? (
                  <p className="flex items-center justify-center gap-1.5 text-slate-400">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend verification code in</span>
                    <span className="font-mono font-bold text-slate-700">{cooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSubmitting}
                    className="font-bold text-[#0c4a3e] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Didn&apos;t receive code? Resend OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* FALLBACK: PASSWORD LOGIN (For Pre-seeded Admin / Test Accounts) */}
          {step === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@landora.in"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0c4a3e]/30 focus:border-[#0c4a3e] text-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0c4a3e]/30 focus:border-[#0c4a3e] text-slate-900 transition"
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white font-bold text-sm shadow-md transition hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("identifier");
                    setError(null);
                  }}
                  className="font-bold text-[#0c4a3e] hover:underline"
                >
                  ← Back to Email & OTP Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}