"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  RotateCcw,
  Lock,
  Sparkles,
  Info,
  Heart,
  PhoneCall,
  MessageSquare,
  Building2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Button, 
  Input, 
  Card, 
  CardContent 
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, OTP_COOLDOWN_SECONDS } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const actionParam = searchParams.get("action");
  const targetIdParam = searchParams.get("targetId");

  const { sendOtp, verifyOtp, login } = useAuth();

  // Mode: "otp" (default) or "password"
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");

  // Step for OTP: "email" (step 1) or "code" (step 2)
  const [otpStep, setOtpStep] = useState<"email" | "code">("email");

  // Form inputs
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");

  // UI status states
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devNotice, setDevNotice] = useState("");
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setDevNotice("");
    setSuggestedCode(null);

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      setError("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const res: any = await sendOtp(normalizedEmail);
    setIsSubmitting(false);

    if (res.success) {
      setOtpStep("code");
      setCooldown(res.waitSeconds || OTP_COOLDOWN_SECONDS);
      if (res.suggestedCode) {
        setSuggestedCode(res.suggestedCode);
      }
      if (res.emailSent) {
        setSuccessMsg(res.message || "A 6-digit verification code has been sent to your email.");
      } else {
        setSuccessMsg("");
      }
      if (res.devNotice) {
        setDevNotice(res.devNotice);
      }
    } else {
      setError(res.error || "Failed to send verification code. Please try again.");
      if (res.waitSeconds) {
        setCooldown(res.waitSeconds);
      }
    }
  };

  const getPostLoginDestination = (defaultTarget?: string) => {
    let target = redirectParam || defaultTarget || "/dashboard";
    if (actionParam && !target.includes("action=")) {
      const sep = target.includes("?") ? "&" : "?";
      target += `${sep}action=${encodeURIComponent(actionParam)}`;
      if (targetIdParam && !target.includes("targetId=")) {
        target += `&targetId=${encodeURIComponent(targetIdParam)}`;
      }
    }
    return target;
  };

  // Step 2: Verify OTP and Authenticate
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanCode = otpCode.trim().replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    const res = await verifyOtp(email.trim().toLowerCase(), cleanCode);
    setIsSubmitting(false);

    if (res.success) {
      // Determine destination route with preserved action parameters
      const destination = getPostLoginDestination(res.redirectTo);
      router.push(destination);
    } else {
      setError(res.error || "Invalid verification code. Please check and try again.");
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    await handleSendOtp();
  };

  // Password Login Handler (Alternative method for seed accounts)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email address and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim().toLowerCase(), password);
    setIsSubmitting(false);

    if (result.success) {
      router.push(getPostLoginDestination());
    } else {
      setError(result.error || "Invalid email or password.");
    }
  };

  return (
    <Card className="border-[#e2e8e4] shadow-xl rounded-2xl overflow-hidden bg-white">
      {/* Top Brand Accent Header */}
      <div className="bg-[#0c4a3e] px-6 py-5 text-white text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider text-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#dfb33d]" />
          <span>Simple & Secure Authentication</span>
        </div>
        <h2 className="text-xl font-black tracking-tight text-white mt-2">
          Sign In to {APP_NAME}
        </h2>
        <p className="text-xs text-emerald-100/80 mt-1">
          {authMode === "otp"
            ? "Enter your email to receive a single-use verification code."
            : "Sign in with your email address and password."}
        </p>
      </div>

      <CardContent className="p-6">
        {/* Action Context Banner */}
        {actionParam === "save" && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
            <Heart className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 fill-rose-100" />
            <div>
              <p className="font-bold">Sign In to Save Property</p>
              <p className="text-[11px] text-rose-800 mt-0.5 leading-snug">
                Log in to shortlist this property to your account. Once verified, it will be added to your saved list automatically.
              </p>
            </div>
          </div>
        )}

        {actionParam === "contact" && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
            <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sign In to Reveal Seller Contact</p>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                Log in to view verified seller mobile number, WhatsApp, and email directly.
              </p>
            </div>
          </div>
        )}

        {actionParam === "enquire" && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
            <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sign In to Submit Enquiry & Schedule Visit</p>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                Log in with your email OTP to send your message directly to the property owner.
              </p>
            </div>
          </div>
        )}

        {!actionParam && redirectParam && (redirectParam.startsWith("/post-property") || redirectParam.startsWith("/sell")) && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-950 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
            <Building2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sign In to Post Property for Sale</p>
              <p className="text-[11px] text-amber-900 mt-0.5 leading-snug">
                Please sign in to publish your property listing. You will be redirected straight to the publishing form after verification.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium leading-relaxed flex items-start gap-2 animate-in fade-in">
            <span className="font-bold text-rose-600 shrink-0">✕</span>
            <div className="flex-1">
              <span>{error}</span>
              {cooldown > 0 && otpStep === "email" && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("code");
                      setError("");
                    }}
                    className="text-xs font-bold text-[#0c4a3e] underline cursor-pointer hover:text-emerald-950 inline-flex items-center gap-1"
                  >
                    <span>Already received the code in your email? Click to enter it</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-[#0c4a3e] text-xs rounded-xl font-medium leading-relaxed flex items-start gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Development Provider Guidance Notice */}
        {devNotice && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl leading-relaxed flex items-start gap-2.5 animate-in fade-in">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Email Provider Notice:</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                {devNotice}
              </p>
              {otpStep === "code" && suggestedCode && (
                <button
                  type="button"
                  onClick={() => setOtpCode(suggestedCode)}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs transition cursor-pointer border border-amber-300 shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-800" />
                  <span>Click to auto-fill code {suggestedCode}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 1: EMAIL OTP AUTHENTICATION (PRIMARY)                        */}
        {/* ================================================================= */}
        {authMode === "otp" && (
          <div>
            {otpStep === "email" ? (
              // Step 1: Email Entry Form
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                    helperText="We will send a 6-digit one-time code to this address. No password required."
                    required
                    autoFocus
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Verification Code...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              // Step 2: 6-Digit OTP Code Entry Form
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Code sent to:</span>
                    <span className="font-bold text-slate-900 font-mono">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("email");
                      setOtpCode("");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-[11px] font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      placeholder="------"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full text-center text-2xl font-black font-mono tracking-[0.35em] py-3.5 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0c4a3e] focus:border-transparent transition text-slate-900 bg-slate-50/50 placeholder:text-slate-300"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    Single-use code valid for 10 minutes.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  type="submit"
                  disabled={isSubmitting || otpCode.length !== 6}
                  className="shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying Authentication...
                    </span>
                  ) : (
                    <span>Verify & Continue</span>
                  )}
                </Button>

                {/* Resend Controls */}
                <div className="pt-2 text-center">
                  {cooldown > 0 ? (
                    <p className="text-xs text-slate-500">
                      Resend code in <strong className="text-slate-800 font-mono">{cooldown}s</strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                      className="text-xs font-bold text-[#0c4a3e] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend Verification Code</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 2: PASSWORD AUTHENTICATION (SECONDARY TOGGLE)                */}
        {/* ================================================================= */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-[#0c4a3e] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              type="submit"
              disabled={isSubmitting}
              className="mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </span>
              ) : (
                <span>Sign In with Password</span>
              )}
            </Button>
          </form>
        )}

        {/* Switch Between OTP and Password Mode */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          {authMode === "otp" ? (
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs font-bold text-slate-600 hover:text-[#0c4a3e] transition cursor-pointer"
            >
              Prefer a password? <span className="underline">Sign in with password</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setOtpStep("email");
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs font-bold text-[#0c4a3e] hover:underline transition cursor-pointer"
            >
              ← Back to instant Email OTP sign-in (No password needed)
            </button>
          )}
        </div>

        {/* Public Registration Link */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
          New to Landora?{" "}
          <Link href="/register" className="font-bold text-[#0c4a3e] hover:underline">
            Create an Account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#132a24] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading sign in...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
