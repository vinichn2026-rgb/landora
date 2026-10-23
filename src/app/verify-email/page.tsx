"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [code, setCode] = useState("123456");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code || code.trim().length < 4) {
      setError("Please enter a valid verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(data.error || "Failed to verify email.");
      }
    } catch {
      setIsSubmitting(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#132a24] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <Card className="border-[#e2e8e4] shadow-md">
            <CardHeader className="text-center pb-4">
              <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-[#f0f5f3] px-2.5 py-0.5 rounded-full inline-block mb-2">
                EMAIL VERIFICATION
              </span>
              <CardTitle className="text-2xl font-black">Verify Your Email</CardTitle>
              <CardDescription>
                Confirm your email address ({user?.email || "user@example.com"}) to ensure account recovery and alerts.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              {/* Honest Provider Disclosure Notice */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Provider Status Notice</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  No live transactional email provider (AWS SES, Resend) is configured. For development testing, use demo code <strong>123456</strong> below.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {success ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#0c4a3e] mx-auto animate-bounce" />
                  <h3 className="font-bold text-base text-[#0c4a3e]">Email Verified Successfully!</h3>
                  <p className="text-xs text-slate-600">
                    Your account is now fully verified. Redirecting to your dashboard...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    required
                  />

                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span>Verify Email Address</span>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/dashboard"
                      className="text-xs font-bold text-[#0c4a3e] hover:underline"
                    >
                      Skip for now & go to Dashboard →
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
