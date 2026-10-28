"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  MessageSquare,
  Smartphone,
  Mail,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  ExternalLink
} from "lucide-react";

interface NotificationLog {
  id: string;
  userId?: string | null;
  propertyId?: string | null;
  recipientPhone: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  eventType: string;
  templateName?: string | null;
  messageBody: string;
  status: "PENDING" | "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
  provider?: string | null;
  providerMessageId?: string | null;
  deliveryResult?: string | null;
  errorInfo?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

interface StatsSummary {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export default function AdminNotificationsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<StatsSummary>({ total: 0, sent: 0, delivered: 0, failed: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [eventTypeFilter, setEventTypeFilter] = useState("ALL");
  const [propertyIdFilter, setPropertyIdFilter] = useState("");

  // Retrying State
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (channelFilter !== "ALL") params.append("channel", channelFilter);
      if (eventTypeFilter !== "ALL") params.append("eventType", eventTypeFilter);
      if (propertyIdFilter.trim()) params.append("propertyId", propertyIdFilter.trim());

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch notification logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter, channelFilter, eventTypeFilter]);

  const handleRetrySingle = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const res = await fetch("/api/admin/notifications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice("Notification retried and delivered successfully!");
        fetchLogs();
      } else {
        alert(data.message || data.error || "Retry attempt failed.");
      }
    } catch {
      alert("Network error while retrying notification.");
    } finally {
      setRetryingLogId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleRetryAllFailed = async () => {
    if (!confirm("Retry all failed notifications across the platform?")) return;
    setIsRetryingAll(true);
    try {
      const res = await fetch("/api/admin/notifications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allFailed: true }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Successfully retried ${data.retriedCount} notifications (${data.successCount} succeeded)!`);
        fetchLogs();
      } else {
        alert(data.error || "Failed to retry notifications.");
      }
    } catch {
      alert("Network error while retrying notifications.");
    } finally {
      setIsRetryingAll(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "WHATSAPP":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageSquare className="w-3 h-3 text-emerald-600" />
            WhatsApp
          </span>
        );
      case "SMS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Smartphone className="w-3 h-3 text-purple-600" />
            SMS
          </span>
        );
      case "EMAIL":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Mail className="w-3 h-3 text-blue-600" />
            Email
          </span>
        );
      default:
        return <span className="text-[11px] font-bold text-slate-600">{channel}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-[#0c4a3e]">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-sky-100 text-sky-800">
            <CheckCircle2 className="w-3 h-3" />
            Sent
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case "PENDING":
      case "QUEUED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            Queued
          </span>
        );
      default:
        return <span className="text-[10.5px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0c4a3e] border border-emerald-200 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications &amp; Automation</h1>
              <p className="text-xs text-slate-500">
                Event-driven notification monitoring across WhatsApp, SMS, and Email with automatic failure retry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.failed > 0 && (
            <button
              onClick={handleRetryAllFailed}
              disabled={isRetryingAll}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRetryingAll ? "animate-spin" : ""}`} />
              <span>{isRetryingAll ? "Retrying All..." : `Retry ${stats.failed} Failed`}</span>
            </button>
          )}

          <button
            onClick={() => fetchLogs()}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Dispatched</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Automated transactional events</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Delivered / Sent</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.delivered + stats.sent}</div>
          <span className="text-[11px] text-emerald-600 mt-0.5 block">
            {stats.total > 0 ? `${Math.round(((stats.delivered + stats.sent) / stats.total) * 100)}% delivery rate` : "100% operational"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Failed Deliveries</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.failed}</div>
          <span className="text-[11px] text-rose-500 mt-0.5 block">
            {stats.failed > 0 ? "Retryable via action buttons" : "Zero delivery failures"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Channels</span>
          <div className="text-2xl font-black text-slate-900 mt-1">3</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">WhatsApp &bull; SMS &bull; Email</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold text-[11px]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending / Queued</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold text-[11px]">Channel:</span>
            <select
              value={channelFilter}
              onChange={e => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Channels</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold text-[11px]">Event:</span>
            <select
              value={eventTypeFilter}
              onChange={e => {
                setEventTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Events</option>
              <option value="PROPERTY_SUBMITTED">Property Submitted</option>
              <option value="DETAILS_REQUIRED">Details Required</option>
              <option value="PROPERTY_APPROVED">Property Approved</option>
              <option value="PROPERTY_PUBLISHED">Property Published</option>
              <option value="VERIFICATION_PENDING">Verification Pending</option>
              <option value="ADMIN_NEW_PROPERTY_SUBMITTED">Admin New Property Alert</option>
            </select>
          </div>
        </div>

        {/* Property ID Search */}
        <form
          onSubmit={e => {
            e.preventDefault();
            setPage(1);
            fetchLogs();
          }}
          className="flex items-center gap-1.5 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={propertyIdFilter}
              onChange={e => setPropertyIdFilter(e.target.value)}
              placeholder="Search by Property ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Delivery Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            Loading delivery records...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notification delivery logs found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Event Type</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Property Ref</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Message / Error</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    {/* Timestamp */}
                    <td className="p-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Event Type */}
                    <td className="p-3.5 whitespace-nowrap font-mono text-[10.5px] font-bold text-slate-800">
                      {log.eventType}
                    </td>

                    {/* Channel */}
                    <td className="p-3.5 whitespace-nowrap">{getChannelBadge(log.channel)}</td>

                    {/* Recipient */}
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-700">
                      {log.recipientPhone}
                    </td>

                    {/* Property Ref */}
                    <td className="p-3.5 whitespace-nowrap text-[11px]">
                      {log.propertyId ? (
                        <Link
                          href={`/properties/${log.propertyId}`}
                          target="_blank"
                          className="font-mono text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <span>{log.propertyId.slice(0, 16)}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-emerald-500" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">&mdash;</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">{getStatusBadge(log.status)}</td>

                    {/* Message / Error */}
                    <td className="p-3.5 max-w-xs text-[11px] text-slate-600">
                      {log.status === "FAILED" ? (
                        <span className="text-rose-600 font-medium line-clamp-1" title={log.errorInfo || ""}>
                          {log.errorInfo || "Delivery rejected by carrier"}
                        </span>
                      ) : (
                        <span className="line-clamp-1 text-slate-500" title={log.messageBody}>
                          {log.messageBody.slice(0, 60)}
                        </span>
                      )}
                    </td>

                    {/* Retry Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {log.status === "FAILED" ? (
                        <button
                          disabled={retryingLogId === log.id}
                          onClick={() => handleRetrySingle(log.id)}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition disabled:opacity-50 flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingLogId === log.id ? "animate-spin" : ""}`} />
                          <span>{retryingLogId === log.id ? "Retrying..." : "Retry"}</span>
                        </button>
                      ) : (
                        <span className="text-slate-300 text-[11px]">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold disabled:opacity-40 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
