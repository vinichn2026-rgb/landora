"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, Loader2, KeyRound } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Please provide the password reset token.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setIsSubmitting(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <Card className="border-[#e2e8e4] shadow-md">
      <CardHeader className="text-center pb-4">
        <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-[#f0f5f3] px-2.5 py-0.5 rounded-full inline-block mb-2">
          NEW CREDENTIALS
        </span>
        <CardTitle className="text-2xl font-black">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below to regain full access to your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#0c4a3e] mx-auto animate-bounce" />
            <h3 className="font-bold text-base text-[#0c4a3e]">Password Changed Successfully</h3>
            <p className="text-xs text-slate-600">
              Your password has been updated. Redirecting you to the sign in page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!tokenParam && (
              <Input
                label="Reset Token"
                type="text"
                placeholder="Paste the reset token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                leftIcon={<KeyRound className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
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
                  Updating password...
                </span>
              ) : (
                <span>Update Password</span>
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#132a24] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
