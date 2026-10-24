"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileCode,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Building2,
  Tag,
  Info
} from "lucide-react";
import { AuditLogItem } from "@/types";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesAction =
        actionFilter === "ALL" || log.action === actionFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q));

      return matchesAction && matchesSearch;
    });
  }, [logs, searchQuery, actionFilter]);

  const getActionBadge = (action: string) => {
    if (action.includes("APPROVE")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes("REJECT") || action.includes("SUSPEND")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes("ROLE") || action.includes("USER")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <User className="w-3 h-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Tag className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FileCode className="w-6 h-6 text-emerald-400" />
            System Audit Logs & Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chronological, immutable audit trail of administrative actions, moderation decisions, and user role updates.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by admin, entity, action, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Event Types ({logs.length})</option>
            <option value="APPROVE_LISTING">Approve Listing</option>
            <option value="REJECT_LISTING">Reject Listing</option>
            <option value="DEACTIVATE_LISTING">Deactivate Listing</option>
            <option value="UPDATE_ROLE">Role Update</option>
            <option value="SUSPEND_USER">Suspend Account</option>
            <option value="REACTIVATE_USER">Reactivate Account</option>
            <option value="UPDATE_LOCATION">Location Hub Update</option>
            <option value="UPDATE_PACKAGE">Package Update</option>
            <option value="UPDATE_CONTENT">Content Copy Update</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
          <p>Loading administrative audit trail...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <FileCode className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No audit entries found</p>
          <p className="text-xs text-slate-500 mt-1">
            Administrative actions will automatically appear here as they occur.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                  <th className="px-5 py-3 font-semibold">Administrator</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Entity Target</th>
                  <th className="px-5 py-3 font-semibold">Details & Notes</th>
                  <th className="px-5 py-3 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(log.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 pl-5">
                        {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {log.userId}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 mr-2">
                        {log.entityType}
                      </span>
                      <span className="font-mono text-slate-300 text-[11px]">
                        {log.entityId}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-slate-300 truncate" title={log.details || ""}>
                        {log.details || "Administrative event logged"}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition"
                      >
                        <Eye className="w-3 h-3 text-emerald-400" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Audit Log Inspection</h2>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500">Record ID: </span>
                <span className="text-slate-200">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-500">Timestamp: </span>
                <span className="text-slate-200">
                  {new Date(selectedLog.createdAt).toISOString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Administrator: </span>
                <span className="text-emerald-400">
                  {selectedLog.userName} ({selectedLog.userId})
                </span>
              </div>
              <div>
                <span className="text-slate-500">Action: </span>
                <span className="text-amber-400 font-bold">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-500">Entity: </span>
                <span className="text-blue-400">
                  [{selectedLog.entityType}] {selectedLog.entityId}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Details / Audit Memo: </span>
                <p className="mt-1 p-2 bg-slate-900 rounded border border-slate-800 text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {selectedLog.details || "No additional metadata recorded."}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
