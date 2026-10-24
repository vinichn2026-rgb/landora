"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
  FileText
} from "lucide-react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<"OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED">("INVESTIGATING");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReport = async () => {
    if (!selectedReport) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status: resolutionStatus,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(`Report status updated to ${resolutionStatus}.`);
        setSelectedReport(null);
        setResolutionNotes("");
        fetchReports();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Update failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Open
        </span>;
      case "INVESTIGATING":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Under Investigation
        </span>;
      case "RESOLVED":
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Resolved
        </span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          Dismissed
        </span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reported Listings & Compliance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review user-flagged listings for document misrepresentation, inaccurate pricing, or title disputes.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✓ {actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total filed reports: <strong>{reports.length}</strong></span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading abuse reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Reported Listings</p>
            <p className="text-[11px] text-slate-400">There are currently no active user complaints or reports.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Reported Listing</th>
                  <th className="p-3.5">Alleged Issue</th>
                  <th className="p-3.5">Reporter Details</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Filed On</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate">{rep.propertyTitle}</span>
                      <span className="text-[10px] text-slate-400">Property ID: {rep.propertyId}</span>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <span className="font-bold text-rose-700 block text-[11px]">{rep.reason}</span>
                      <p className="line-clamp-2 text-slate-600 text-[10px] mt-0.5">{rep.details}</p>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{rep.reporterName}</div>
                      <div className="text-[10px] text-slate-400">{rep.reporterEmail || "Anonymous"}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(rep.status)}
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-slate-400">
                      {new Date(rep.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedReport(rep);
                          setResolutionStatus(rep.status === "OPEN" ? "INVESTIGATING" : rep.status);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#0c4a3e] hover:bg-[#072e27] text-white text-[11px] font-bold shadow-2xs"
                      >
                        Resolve / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution Dialog Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900">Resolve Listing Report</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Listing: <strong>{selectedReport.propertyTitle}</strong>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <div><strong>Reported Reason:</strong> {selectedReport.reason}</div>
              <div className="text-[11px] italic">"{selectedReport.details}"</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Update Resolution Status
              </label>
              <select
                value={resolutionStatus}
                onChange={e => setResolutionStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0c4a3e]"
              >
                <option value="OPEN">OPEN (Unreviewed)</option>
                <option value="INVESTIGATING">INVESTIGATING (In moderation check)</option>
                <option value="RESOLVED">RESOLVED (Action taken / Seller rectified)</option>
                <option value="DISMISSED">DISMISSED (False report / Invalid claim)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Moderator Notes / Findings
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="e.g. Contacted seller and verified CMDA approval layout number. Discrepancy was a typo and has been updated."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating}
                onClick={handleUpdateReport}
                className="px-5 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Update Report Status"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
