"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Power,
  Star,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Phone,
  Mail,
  UserCheck
} from "lucide-react";
import { PropertyItem } from "@/types";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");

  // Rejection Dialog Modal
  const [rejectingProperty, setRejectingProperty] = useState<PropertyItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Request Information Dialog Modal (Phase 9)
  const [requestingInfoProperty, setRequestingInfoProperty] = useState<PropertyItem | null>(null);
  const [requestInfoReason, setRequestInfoReason] = useState("");

  // Inspection Modal
  const [inspectingProperty, setInspectingProperty] = useState<PropertyItem | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (cityFilter !== "ALL") params.append("city", cityFilter);
      if (searchQuery.trim()) params.append("query", searchQuery.trim());

      const res = await fetch(`/api/admin/properties?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch admin properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, statusFilter, cityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  const handleModerate = async (propertyId: string, action: "APPROVE" | "REJECT" | "REQUEST_INFO" | "DEACTIVATE" | "EXPIRE", reason?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          action,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setRejectingProperty(null);
        setRejectionReason("");
        setRequestingInfoProperty(null);
        setRequestInfoReason("");
        fetchProperties();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Action failed.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleFeatured = async (propertyId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch("/api/admin/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          isFeatured: !currentFeatured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        fetchProperties();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {
      alert("Failed to toggle featured status.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "APPROVED":
      case "PUBLISHED":
        return <span className="bg-emerald-100 text-[#0c4a3e] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Live
        </span>;
      case "PENDING":
      case "SUBMITTED":
      case "PENDING_VERIFICATION":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Pending Review
        </span>;
      case "NEEDS_MORE_INFORMATION":
        return <span className="bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-600" /> Info Needed
        </span>;
      case "DRAFT":
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          Draft
        </span>;
      case "REJECTED":
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </span>;
      case "DEACTIVATED":
      case "SOLD":
      case "RENTED":
        return <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Power className="w-3 h-3" /> Deactivated
        </span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Property Moderation Desk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review listings, verify land documentation, manage homepage featured status, and moderate submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setPage(1); fetchProperties(); }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh listings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
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

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Listings" },
              { id: "PENDING", label: "Pending Approvals" },
              { id: "ACTIVE", label: "Live / Published" },
              { id: "REJECTED", label: "Rejected" },
              { id: "DRAFT", label: "Drafts" },
              { id: "DEACTIVATED", label: "Deactivated" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#0c4a3e] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title, locality, seller..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
            />
          </form>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Found <strong>{total}</strong> listings in registry</span>
          <span>Page {page} of {totalPages}</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading listings...</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No properties match the selected criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Property Details</th>
                  <th className="p-3.5">Price & Area</th>
                  <th className="p-3.5">Seller Information</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Featured</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {properties.map(prop => (
                  <tr key={prop.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 max-w-xs">
                      <div className="flex items-start gap-2.5">
                        <img
                          src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=150"}
                          alt={prop.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{prop.title}</span>
                          <span className="text-[10px] text-slate-400">{prop.locality}, {prop.city}</span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Classification: <strong className="text-slate-700">{prop.landClassification || "General"}</strong>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        ₹{prop.price >= 10000000 ? `${(prop.price / 10000000).toFixed(2)} Cr` : `${(prop.price / 100000).toFixed(2)} Lac`}
                      </div>
                      <div className="text-[10px] text-slate-500">{prop.area} {prop.areaUnit}</div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{prop.sellerName}</div>
                      <div className="text-[10px] text-slate-500">{prop.sellerPhone}</div>
                      <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                        {prop.sellerType}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(prop.status)}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleToggleFeatured(prop.id, prop.isFeatured)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          prop.isFeatured
                            ? "bg-amber-50 text-amber-600 border-amber-300"
                            : "bg-white text-slate-300 border-slate-200 hover:text-slate-500"
                        }`}
                        title={prop.isFeatured ? "Remove from Homepage Featured" : "Pin to Homepage Featured"}
                      >
                        <Star className={`w-3.5 h-3.5 ${prop.isFeatured ? "fill-amber-500" : ""}`} />
                      </button>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingProperty(prop)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                          title="Inspect full details"
                        >
                          Inspect
                        </button>

                        {prop.status !== "ACTIVE" && prop.status !== "APPROVED" && (
                          <button
                            onClick={() => handleModerate(prop.id, "APPROVE")}
                            className="px-2.5 py-1 rounded bg-[#0c4a3e] hover:bg-[#072e27] text-white font-bold text-[11px] shadow-2xs"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => setRequestingInfoProperty(prop)}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200"
                          title="Request additional info or documents from seller"
                        >
                          Request Info
                        </button>

                        {prop.status !== "REJECTED" && (
                          <button
                            onClick={() => setRejectingProperty(prop)}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200"
                          >
                            Reject
                          </button>
                        )}

                        {prop.status === "ACTIVE" && (
                          <button
                            onClick={() => handleModerate(prop.id, "DEACTIVATE")}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-[11px]"
                            title="Deactivate listing"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
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
            <span className="text-slate-500">Page {page} of {totalPages}</span>
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

      {/* Rejection Modal Dialog */}
      {rejectingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900">Reject Property Listing</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Listing: <strong>{rejectingProperty.title}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reason for Rejection *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Document copy is illegible. Please re-upload Patta / Chitta or correct the survey number."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingProperty(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing || !rejectionReason.trim()}
                onClick={() => handleModerate(rejectingProperty.id, "REJECT", rejectionReason.trim())}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Information Dialog Modal (Phase 9) */}
      {requestingInfoProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Request Additional Information
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Listing: <strong>{requestingInfoProperty.title}</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The seller ({requestingInfoProperty.sellerName}) will be notified via SMS, WhatsApp, and email to provide the requested details.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Details or Documents Needed *
              </label>
              <textarea
                rows={4}
                value={requestInfoReason}
                onChange={e => setRequestInfoReason(e.target.value)}
                placeholder="e.g. Please upload clear photos of the Patta document and clarify the eastern road width boundary."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-amber-600 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRequestingInfoProperty(null);
                  setRequestInfoReason("");
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing || requestInfoReason.trim().length < 5}
                onClick={() => handleModerate(requestingInfoProperty.id, "REQUEST_INFO", requestInfoReason.trim())}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-50 shadow-xs"
              >
                {isProcessing ? "Sending Request..." : "Send Request to Seller"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Property Modal */}
      {inspectingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Property Inspector</span>
                <h3 className="text-base font-bold text-slate-900">{inspectingProperty.title}</h3>
                <span className="text-xs text-slate-500">Ref #{inspectingProperty.id}</span>
              </div>
              <button onClick={() => setInspectingProperty(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Images */}
            <div className="flex gap-2 overflow-x-auto py-1">
              {inspectingProperty.images?.map((img, i) => (
                <img key={i} src={img.url} alt="" className="w-24 h-20 rounded-lg object-cover shrink-0 border" />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Land Details</span>
                <div><strong>Price:</strong> ₹{inspectingProperty.price.toLocaleString("en-IN")}</div>
                <div><strong>Area:</strong> {inspectingProperty.area} {inspectingProperty.areaUnit}</div>
                <div><strong>Dimensions:</strong> {inspectingProperty.plotDimensions || "Not provided"}</div>
                <div><strong>Facing:</strong> {inspectingProperty.facing || "Not specified"}</div>
                <div><strong>Road Width:</strong> {inspectingProperty.roadWidthFt ? `${inspectingProperty.roadWidthFt} ft` : "Not specified"}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Legal & Documents</span>
                <div><strong>Survey / Patta:</strong> {inspectingProperty.surveyNumber || "Not provided"}</div>
                <div><strong>Classification:</strong> {inspectingProperty.landClassification || "Standard"}</div>
                <div><strong>Doc Status:</strong> {inspectingProperty.documentStatus || "Seller Declared"}</div>
                <div><strong>Approval:</strong> {inspectingProperty.approvalStatus}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Seller Contact</span>
              <div><strong>Name:</strong> {inspectingProperty.sellerName} ({inspectingProperty.sellerType})</div>
              <div><strong>Phone:</strong> {inspectingProperty.sellerPhone}</div>
              <div><strong>Email:</strong> {inspectingProperty.sellerEmail}</div>
            </div>

            <p className="text-xs text-slate-600">{inspectingProperty.description}</p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Link
                href={`/properties/${inspectingProperty.slug}`}
                target="_blank"
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
              >
                <span>View Live Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setInspectingProperty(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
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
