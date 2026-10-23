"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.error || "Invalid email or password.");
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password@123");
    setError("");
  };

  return (
    <Card className="border-[#e2e8e4] shadow-md">
      <CardHeader className="text-center pb-4">
        <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-[#f0f5f3] px-2.5 py-0.5 rounded-full inline-block mb-2">
          ACCOUNT ACCESS
        </span>
        <CardTitle className="text-2xl font-black">Sign in to {APP_NAME}</CardTitle>
        <CardDescription>
          Access your property listings, saved shortlists, and buyer enquiries.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
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
              leftIcon={<Lock className="w-4 h-4" />}
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
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span>Sign In</span>
            )}
          </Button>
        </form>

        {/* Demo Account Quick-Fillers */}
        <div className="mt-6 pt-5 border-t border-[#f1f4f2]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 text-center">
            One-Click Demo Account Login (Password@123):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount("buyer@landora.in")}
              className="p-2 rounded-lg bg-sky-50 text-sky-900 font-bold hover:bg-sky-100 transition border border-sky-200 text-left cursor-pointer"
            >
              <span>Buyer Account</span>
              <span className="block text-[10px] text-slate-500 font-normal">buyer@landora.in</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("seller@landora.in")}
              className="p-2 rounded-lg bg-emerald-50 text-[#0c4a3e] font-bold hover:bg-emerald-100 transition border border-emerald-200 text-left cursor-pointer"
            >
              <span>Seller Account</span>
              <span className="block text-[10px] text-slate-500 font-normal">seller@landora.in</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("agent@landora.in")}
              className="p-2 rounded-lg bg-purple-50 text-purple-900 font-bold hover:bg-purple-100 transition border border-purple-200 text-left cursor-pointer"
            >
              <span>Agent Account</span>
              <span className="block text-[10px] text-slate-500 font-normal">agent@landora.in</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("admin@landora.in")}
              className="p-2 rounded-lg bg-amber-50 text-amber-900 font-bold hover:bg-amber-100 transition border border-amber-200 text-left cursor-pointer"
            >
              <span>Admin Portal</span>
              <span className="block text-[10px] text-slate-500 font-normal">admin@landora.in</span>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-xs text-slate-600">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-bold text-[#0c4a3e] hover:underline">
            Register here
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
          <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-500">Loading form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
