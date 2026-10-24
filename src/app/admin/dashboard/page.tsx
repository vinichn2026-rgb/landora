"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Clock,
  XCircle,
  AlertTriangle,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  History,
  KeyRound,
  LogIn,
  Laptop
} from "lucide-react";
import { PropertyItem, LoginActivityItem } from "@/types";

export default function AdminDashboardOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingProperties, setPendingProperties] = useState<PropertyItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loginActivities, setLoginActivities] = useState<LoginActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverviewData = async () => {
    setIsLoading(true);
    try {
      const [resMetrics, resPending, resLogs, resLogins] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/properties?status=PENDING&limit=5"),
        fetch("/api/admin/audit-logs"),
        fetch("/api/admin/login-activity?limit=6"),
      ]);

      const dataMetrics = await resMetrics.json();
      const dataPending = await resPending.json();
      const dataLogs = await resLogs.json();
      const dataLogins = await resLogins.json();

      if (dataMetrics.success) setMetrics(dataMetrics.metrics);
      if (dataPending.success) setPendingProperties(dataPending.data || []);
      if (dataLogs.success) setAuditLogs(dataLogs.logs?.slice(0, 5) || []);
      if (dataLogins.success) setLoginActivities(dataLogins.activities || []);
    } catch (err) {
      console.error("Failed to load admin overview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleQuickApprove = async (propertyId: string) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, action: "APPROVE" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOverviewData();
      } else {
        alert(data.error || "Approval failed.");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Operations Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform governance, listing moderation queue, account management, and audit tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverviewData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics?.totalUsers ?? "..."}
          </div>
          <span className="text-[10px] text-slate-400">Buyers, Sellers, Agents, Builders</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Listings</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {metrics?.activeListings ?? "..."}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Published live on marketplace</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {metrics?.pendingApprovals ?? "..."}
          </div>
          <Link href="/admin/properties?status=PENDING" className="text-[10px] text-amber-700 font-bold hover:underline">
            Review moderation queue →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Reported / Disputes</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">
            {metrics?.reportedListings ?? "..."}
          </div>
          <Link href="/admin/reports" className="text-[10px] text-rose-700 font-bold hover:underline">
            Check flagged listings →
          </Link>
        </div>
      </div>

      {/* Secondary Row: Enquiries, Rejected & Finance Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Platform Enquiries</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {metrics?.recentEnquiries ?? "..."} Leads
            </span>
          </div>
          <Link
            href="/admin/enquiries"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Rejected Listings</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {metrics?.rejectedListings ?? "..."} Needs Action
            </span>
          </div>
          <Link
            href="/admin/properties?status=REJECTED"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <XCircle className="w-5 h-5 text-rose-600" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Recorded Payments</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              ₹{metrics?.paymentMetrics?.totalAmount?.toLocaleString("en-IN") || "0"}
            </span>
            <span className="text-[9.5px] text-slate-400">Sandbox / Test Data</span>
          </div>
          <Link
            href="/admin/payments"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <CreditCard className="w-5 h-5 text-[#0c4a3e]" />
          </Link>
        </div>
      </div>

      {/* Main Dual Columns: Moderation Queue & Audit Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Priority Moderation Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Listings Awaiting Moderation</h2>
            </div>
            <Link
              href="/admin/properties?status=PENDING"
              className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
            >
              <span>View full queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading moderation queue...</div>
          ) : pendingProperties.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Moderation Queue is Clear</p>
              <p className="text-[11px] text-slate-400">No properties are currently pending administrative review.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingProperties.map(prop => (
                <div key={prop.id} className="p-4 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=200"}
                      alt={prop.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 truncate max-w-sm">{prop.title}</h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-bold text-[#0c4a3e]">₹{prop.price.toLocaleString("en-IN")}</span>
                        <span> • {prop.locality}, {prop.city}</span>
                        <span> • By: {prop.sellerName} ({prop.sellerType})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/properties/${prop.slug}`}
                      target="_blank"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-600"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => handleQuickApprove(prop.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#0c4a3e] hover:bg-[#072e27] text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                    >
                      Approve Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Audit Log Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">Audit Trail Activity</h2>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-bold text-[#0c4a3e] hover:underline"
            >
              All Logs →
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading audit trail...</div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No audit events recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{log.details || log.entityId}</p>
                  <div className="text-[10px] text-slate-400">By: {log.userName}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* User Monitoring & Login Activity Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-[#0c4a3e]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Login Activity & Authentication Logs</h2>
              <p className="text-[11px] text-slate-500">
                Server-recorded successful user logins, authentication methods, timestamps, and account roles in PostgreSQL.
              </p>
            </div>
          </div>

          <Link
            href="/admin/users"
            className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>View All Accounts & Logins</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading user login activity...</div>
        ) : loginActivities.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No login events recorded yet. Logins via Email OTP or Password will appear here in real-time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">User / Account</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Client IP & Device</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loginActivities.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{a.userName || a.email.split("@")[0]}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{a.email}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : a.role === "SELLER"
                          ? "bg-emerald-100 text-[#0c4a3e]"
                          : a.role === "AGENT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {a.role || "BUYER"}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        a.eventType === "LOGIN_OTP"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : a.eventType === "REGISTER_INITIAL"
                          ? "bg-purple-50 text-purple-800 border border-purple-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}>
                        {a.eventType === "LOGIN_OTP"
                          ? "Email OTP"
                          : a.eventType === "REGISTER_INITIAL"
                          ? "New Account Registered"
                          : "Password Login"}
                      </span>
                      {a.details && (
                        <div className="text-[10px] text-slate-400 mt-0.5">{a.details}</div>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div>{a.ipAddress || "127.0.0.1"}</div>
                      {a.userAgent && (
                        <div className="text-[9.5px] text-slate-400 truncate max-w-xs">{a.userAgent}</div>
                      )}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-slate-600">
                      {new Date(a.createdAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>SUCCESS</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
