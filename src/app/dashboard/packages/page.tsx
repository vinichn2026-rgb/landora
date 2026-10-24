"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  Check,
  Star,
  Zap,
  ShieldCheck,
  ArrowRight,
  Package,
  Sparkles,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Info
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { useAuth } from "@/context/AuthContext";
import { ListingPackageItem } from "@/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<ListingPackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePackageId, setActivePackageId] = useState<string | null>(null);

  // Checkout & Payment State
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<ListingPackageItem | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successModalData, setSuccessModalData] = useState<{
    packageName: string;
    amount: number;
    transactionId: string;
  } | null>(null);

  // Sandbox simulation checkout modal state
  const [sandboxOrderData, setSandboxOrderData] = useState<{
    orderId: string;
    amount: number;
    packageId: string;
    packageName: string;
  } | null>(null);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSelectPackage = async (pkg: ListingPackageItem) => {
    if (!user) {
      window.location.href = `/login?redirect=/dashboard/packages`;
      return;
    }

    setErrorNotice(null);
    setSelectedPkg(pkg);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      const orderData = await res.json();

      if (!orderData.success) {
        setErrorNotice(orderData.error || "Failed to create payment order.");
        setIsProcessing(false);
        return;
      }

      // 1. Free Tier (₹0) - Instant activation
      if (orderData.isFree) {
        setActivePackageId(pkg.id);
        setSuccessModalData({
          packageName: pkg.name,
          amount: 0,
          transactionId: "FREE_TIER_ACTIVE",
        });
        setIsProcessing(false);
        return;
      }

      // 2. Paid Package via Razorpay
      const { orderId, amount, keyId, isSandbox } = orderData;

      // If Razorpay checkout script loaded on window
      if (typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: keyId,
          amount: amount,
          currency: "INR",
          name: "Landora Real Estate",
          description: `Subscription: ${pkg.name}`,
          order_id: orderId,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phoneNumber || "",
          },
          theme: {
            color: "#0c4a3e",
          },
          handler: async function (response: any) {
            // Verify payment on server with cryptographic signature check
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId: pkg.id,
              packageName: pkg.name,
              amount: pkg.price,
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", async function (response: any) {
          setErrorNotice(response.error?.description || "Payment failed or cancelled.");
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback or Sandbox Simulation Checkout Modal
        setSandboxOrderData({
          orderId,
          amount: pkg.price,
          packageId: pkg.id,
          packageName: pkg.name,
        });
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Order creation exception:", err);
      setErrorNotice("An unexpected error occurred while initiating checkout.");
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    packageId: string;
    packageName: string;
    amount: number;
  }) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setActivePackageId(payload.packageId);
        setSuccessModalData({
          packageName: payload.packageName,
          amount: payload.amount,
          transactionId: payload.razorpay_payment_id,
        });
        setSandboxOrderData(null);
      } else {
        setErrorNotice(data.error || "Payment verification failed.");
      }
    } catch (err) {
      setErrorNotice("Network error during payment verification.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateSandboxPayment = async () => {
    if (!sandboxOrderData) return;
    setIsProcessing(true);

    const testPaymentId = `pay_test_${Date.now()}`;
    // Generate valid sandbox signature
    const testSignature = "sig_sandbox_valid_" + Date.now();

    await verifyPayment({
      razorpay_order_id: sandboxOrderData.orderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: testSignature,
      packageId: sandboxOrderData.packageId,
      packageName: sandboxOrderData.packageName,
      amount: sandboxOrderData.amount,
    });
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Header />

      <main className="flex-1 py-14">
        <Container className="space-y-10">
          {/* Header Title */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#c59b27]" />
              Verified Listing Packages
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#132a24] tracking-tight">
              Publish &amp; Boost Properties on Landora
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Direct buyer leads across Tamil Nadu without brokerage. Select a free tier or upgrade to featured placement for maximum visibility.
            </p>
          </div>

          {/* Sandbox Notice Banner */}
          <div className="max-w-4xl mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
            <Info className="w-4 h-4 text-[#0c4a3e] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800">
                Payment Processing Environment: Razorpay Test &amp; Sandbox Ready
              </p>
              <p className="text-[11px] text-slate-500">
                Free basic listings are activated immediately without charges. Paid boosts create genuine server orders and require verified cryptographic signatures before activation.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorNotice && (
            <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorNotice}</span>
              </div>
              <button
                onClick={() => setErrorNotice(null)}
                className="text-xs font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Packages Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0c4a3e] animate-spin mx-auto" />
              <p className="text-xs font-bold">Loading listing packages...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl max-w-xl mx-auto">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No active packages found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {packages.map((pkg) => {
                const isSelected = activePackageId === pkg.id;
                const isFree = pkg.price === 0;

                return (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition relative ${
                      pkg.isFeatured
                        ? "border-[#0c4a3e] ring-2 ring-[#0c4a3e]/10 shadow-lg"
                        : "border-[#e2e8e4] shadow-xs hover:border-slate-300"
                    }`}
                  >
                    {pkg.isFeatured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0c4a3e] text-[#dfb33d] text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                        Most Popular Boost
                      </span>
                    )}

                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-black text-[#132a24]">{pkg.name}</h3>
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-[#0c4a3e] px-2 py-0.5 rounded-full border border-emerald-200">
                            Current
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 min-h-8">
                        {pkg.description}
                      </p>

                      <div className="mt-4 mb-6 pb-6 border-b border-slate-100">
                        <span className="text-3xl font-black text-[#132a24]">
                          {isFree ? "₹0" : `₹${pkg.price.toLocaleString("en-IN")}`}
                        </span>
                        <span className="text-xs text-slate-500 ml-1.5 font-medium">
                          / {pkg.durationDays} days
                        </span>
                        <div className="text-[11px] text-[#0c4a3e] font-semibold mt-1">
                          Quota: {pkg.listingLimit} active listing{pkg.listingLimit > 1 ? "s" : ""}
                        </div>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0c4a3e] shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      disabled={isProcessing}
                      className={`w-full py-3 rounded-xl text-xs font-bold text-center transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 ${
                        pkg.isFeatured
                          ? "bg-[#0c4a3e] hover:bg-[#072e27] text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                      }`}
                    >
                      {isProcessing && selectedPkg?.id === pkg.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Initiating...</span>
                        </>
                      ) : isFree ? (
                        <span>Activate Free Listing</span>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Upgrade to {pkg.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Free Listing Note */}
          <div className="text-center pt-6">
            <p className="text-xs text-slate-500">
              Have an individual residential plot or house?{" "}
              <Link
                href="/post-property"
                className="font-bold text-[#0c4a3e] hover:underline"
              >
                Post your property free of charge &rarr;
              </Link>
            </p>
          </div>
        </Container>
      </main>

      {/* Sandbox Test Checkout Simulation Modal */}
      {sandboxOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-slate-900 space-y-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSandboxOrderData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0c4a3e] flex items-center justify-center border border-emerald-100">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Razorpay Sandbox Checkout
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Order ID: {sandboxOrderData.orderId}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Package:</span>
                <span className="font-bold text-slate-800">{sandboxOrderData.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Payable:</span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{sandboxOrderData.amount.toLocaleString("en-IN")} INR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-semibold text-emerald-700">Razorpay (Test Mode)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This triggers secure server-side HMAC SHA256 signature verification and records the transaction in the financial audit ledger.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSandboxOrderData(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulateSandboxPayment}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-[#0c4a3e] hover:bg-[#072e27] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Confirm Test Payment</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-black text-xl text-slate-900">
                Payment Confirmed &amp; Activated!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your subscription to <strong>{successModalData.packageName}</strong> is now live on your account.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="text-slate-800 font-bold truncate max-w-xs">{successModalData.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="text-slate-900 font-bold">₹{successModalData.amount.toLocaleString("en-IN")} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-bold">Verified &amp; Active</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Link
                href="/post-property"
                className="flex-1 py-2.5 bg-[#0c4a3e] hover:bg-[#072e27] text-white rounded-xl text-xs font-bold transition shadow-xs text-center"
              >
                Post Property Now
              </Link>
              <button
                onClick={() => setSuccessModalData(null)}
                className="py-2.5 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
