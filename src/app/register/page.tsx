"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, Building, CheckCircle2, ArrowRight, Loader2, HardHat } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { APP_NAME } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>("BUYER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Coimbatore");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || name.trim().length < 2) {
      setError("Please enter your full name (minimum 2 characters).");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phone.trim() || undefined,
      role,
      password,
      city,
    });
    setIsSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        router.push(role === "SELLER" || role === "AGENT" ? "/dashboard/seller" : "/dashboard");
      }, 1500);
    } else {
      setError(result.error || "Failed to register account.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e2e8e4] p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
              Create an Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight mt-2">
              Join {APP_NAME}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Direct access to verified plots, farmlands, homes, and genuine buyers across South India.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#0c4a3e] mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-[#0c4a3e]">Account Registered!</h3>
              <p className="text-xs text-slate-600">
                Welcome to {APP_NAME}, {name}. Preparing your personalised dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  I want to register as:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "BUYER", label: "Buyer", icon: UserCheck },
                    { id: "SELLER", label: "Owner", icon: Building },
                    { id: "AGENT", label: "Agent", icon: ShieldCheck },
                    { id: "BUILDER", label: "Builder", icon: HardHat },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as UserRole)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        role === item.id
                          ? "bg-emerald-50 border-[#0c4a3e] text-[#0c4a3e] shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mb-1" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Full Name"
                placeholder="e.g. Sivakumar R."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Primary City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  options={[
                    { value: "Coimbatore", label: "Coimbatore" },
                    { value: "Peelamedu", label: "Peelamedu" },
                    { value: "Saravanampatti", label: "Saravanampatti" },
                    { value: "Chennai", label: "Chennai" },
                    { value: "Madurai", label: "Madurai" },
                    { value: "Tiruppur", label: "Tiruppur" },
                    { value: "Bengaluru", label: "Bengaluru" },
                  ]}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="text-[11px] text-slate-500 leading-tight">
                By registering, you accept {APP_NAME}&apos;s{" "}
                <Link href="/terms" className="text-[#0c4a3e] underline font-medium">Terms</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#0c4a3e] underline font-medium">Privacy Policy</Link>.
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#0c4a3e] hover:underline">
                  Log in here
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
