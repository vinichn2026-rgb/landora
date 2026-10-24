"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  DollarSign,
  TrendingUp,
  Info
} from "lucide-react";
import { PaymentRecordItem } from "@/types";

interface PaymentMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  totalAmount: number;
  currency: string;
  gatewayStatus: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecordItem[]>([]);
  const [metrics, setMetrics] = useState<PaymentMetrics | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
        setMetrics(data.metrics || null);
        setNotice(data.notice || "");
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.userName.toLowerCase().includes(q) ||
        item.userEmail.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.packageName && item.packageName.toLowerCase().includes(q)) ||
        (item.gatewayPaymentId && item.gatewayPaymentId.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [payments, searchQuery, statusFilter]);

  const getStatusBadge = (status: PaymentRecordItem["status"]) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Success
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Refunded
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Sandbox Notice Banner per Requirements */}
      <div className="flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-xs leading-relaxed">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-300">
            Payment Processing Status: Test / Sandbox Mode
          </p>
          <p className="text-amber-200/80 mt-0.5">
            {notice ||
              "Live payment gateway keys (Razorpay/Stripe) are not yet configured in production environment. Per compliance requirements, only genuine test transactions are shown without fabricated volume metrics."}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            Payment & Transaction Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review monetization records, package purchases, transaction IDs, and settlement statuses.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total Transactions</span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.totalTransactions}</p>
            <p className="text-[11px] text-slate-500 mt-1">Recorded in ledger</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Successful Settlements</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{metrics.successfulTransactions}</p>
            <p className="text-[11px] text-emerald-500/70 mt-1">Confirmed payments</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Processed Volume</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              ₹{metrics.totalAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Cumulative collected INR</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Gateway Status</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            </div>
            <p className="text-sm font-semibold text-amber-300">Sandbox / Test Mode</p>
            <p className="text-[11px] text-slate-500 mt-1">Razorpay API ready</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, email, tx ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
          <p>Loading transaction ledger...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <CreditCard className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No payment records found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Transaction ID & Date</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Package / Item</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Gateway Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-semibold text-white">{p.id}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{p.userName}</div>
                      <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-200">
                        {p.packageName || "Listing Boost Tier"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {p.packageId || "standard"}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-white">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">INR</span>
                    </td>

                    <td className="px-5 py-3.5">{getStatusBadge(p.status)}</td>

                    <td className="px-5 py-3.5">
                      <div className="text-slate-300 font-mono text-[11px]">
                        {p.gatewayPaymentId || "N/A"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.gateway}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
