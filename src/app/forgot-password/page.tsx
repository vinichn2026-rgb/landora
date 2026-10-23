"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to process password reset.");
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
                ACCOUNT RECOVERY
              </span>
              <CardTitle className="text-2xl font-black">Reset Your Password</CardTitle>
              <CardDescription>
                Enter your registered email address and we will provide instructions to securely reset your password.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {result ? (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#0c4a3e] mx-auto" />
                    <h3 className="font-bold text-sm text-[#0c4a3e]">Password Reset Initiated</h3>
                    <p className="text-xs text-slate-600">
                      A secure reset token has been generated for <strong>{email}</strong>.
                    </p>
                  </div>

                  {/* Honest Disclosure Notice per Master Requirements */}
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-left text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Email Delivery Notice</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      No live external transactional email service (e.g. AWS SES, Resend) is configured in this environment. For development and testing, click the direct reset button below:
                    </p>
                    {result.resetUrl && (
                      <div className="pt-2">
                        <Link
                          href={result.resetUrl}
                          className="inline-flex items-center gap-1.5 bg-[#0c4a3e] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#072e27] transition"
                        >
                          <span>Proceed to Set New Password</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Return to Sign In</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Registered Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                        Generating token...
                      </span>
                    ) : (
                      <span>Send Reset Instructions</span>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
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
