"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  MessageCircle,
  TrendingUp,
  MapPin,
  ExternalLink,
  Edit,
  Power,
  RefreshCw,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PropertyItem } from "@/types";

export default function SellerDashboardPage() {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    draft: 0,
    rejected: 0,
    deactivated: 0,
    enquiriesCount: 0,
    totalViews: 0,
  });

  const [listings, setListings] = useState<PropertyItem[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingEnquiry, setRespondingEnquiry] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchSellerData = async () => {
    setIsLoading(true);
    try {
      const [resMetrics, resListings, resEnquiries] = await Promise.all([
        fetch("/api/seller/metrics"),
        fetch("/api/seller/listings"),
        fetch("/api/seller/enquiries"),
      ]);

      const dataMetrics = await resMetrics.json();
      const dataListings = await resListings.json();
      const dataEnquiries = await resEnquiries.json();

      if (dataMetrics.success) setMetrics(dataMetrics.metrics);
      if (dataListings.success) setListings(dataListings.listings);
      if (dataEnquiries.success) setEnquiries(dataEnquiries.enquiries);
    } catch (err) {
      console.error("Failed to load seller dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [user]);

  // Handle deactivating or reactivating listing
  const handleToggleStatus = async (propertyId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "DEACTIVATED" || currentStatus === "SOLD" ? "PENDING" : "DEACTIVATED";
      const res = await fetch(`/api/seller/listings/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Listing marked as ${newStatus}.`);
        fetchSellerData();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {
      alert("Failed to update listing status.");
    }
  };

  // Handle responding to enquiry
  const handleSendReply = async () => {
    if (!respondingEnquiry || !replyText.trim()) return;
    setIsSendingReply(true);
    try {
      const res = await fetch("/api/seller/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: respondingEnquiry.id,
          replyMessage: replyText.trim(),
          status: "CONTACTED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice("Reply sent to buyer successfully!");
        setRespondingEnquiry(null);
        setReplyText("");
        fetchSellerData();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Failed to send response.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="bg-emerald-100 text-[#0c4a3e] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Live (Active)
        </span>;
      case "PENDING":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> Under Moderation
        </span>;
      case "DRAFT":
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <FileText className="w-3 h-3" /> Draft
        </span>;
      case "REJECTED":
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Rejected
        </span>;
      case "DEACTIVATED":
      case "SOLD":
        return <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Power className="w-3 h-3" /> Deactivated
        </span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seller & Agent Hub</h1>
              <span className="bg-[#0c4a3e] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {user?.role || "SELLER"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage your properties, review verification status, and respond to incoming buyer enquiries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/post-property"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Post New Property</span>
            </Link>
            <button
              onClick={fetchSellerData}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Refresh statistics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>✓ {actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Listings</span>
              <Building2 className="w-4 h-4 text-[#0c4a3e]" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{metrics.total}</div>
            <span className="text-[10px] text-slate-400">In your inventory</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Active / Live</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">{metrics.active}</div>
            <span className="text-[10px] text-emerald-600">Visible to buyers</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700 mt-2">{metrics.pending}</div>
            <span className="text-[10px] text-amber-600">In moderation desk</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Buyer Enquiries</span>
              <MessageCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700 mt-2">{metrics.enquiriesCount}</div>
            <span className="text-[10px] text-blue-600">Leads received</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Rejected / Action Req.</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-700 mt-2">{metrics.rejected}</div>
            <span className="text-[10px] text-rose-600">Requires revision</span>
          </div>
        </div>

        {/* Navigation Tabs for Subsections */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Link
            href="/dashboard/seller"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0c4a3e] text-white shadow-xs"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/seller/listings"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
          >
            All Listings ({listings.length})
          </Link>
          <Link
            href="/dashboard/seller/enquiries"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
          >
            Enquiries Inbox ({enquiries.length})
          </Link>
        </div>

        {/* Section 1: Recent Property Listings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Property Listings</h2>
              <p className="text-xs text-slate-400">Track moderation progress and manage availability</p>
            </div>
            <Link
              href="/dashboard/seller/listings"
              className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
            >
              <span>View all ({listings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your listings...</div>
          ) : listings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No properties listed yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Reach thousands of active property buyers in Tamil Nadu by posting your land or home today.
              </p>
              <Link
                href="/post-property"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0c4a3e] text-white text-xs font-bold shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Post Your First Property FREE
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {listings.slice(0, 5).map(listing => (
                <div key={listing.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=300"}
                      alt={listing.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getStatusBadge(listing.status)}
                        <span className="text-[11px] font-bold text-slate-500 uppercase">{listing.listingType}</span>
                        <span className="text-[11px] text-slate-400">• Ref #{listing.id.slice(-6)}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">{listing.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-[#0c4a3e]">
                          ₹{listing.price >= 10000000 ? `${(listing.price / 10000000).toFixed(2)} Cr` : `${(listing.price / 100000).toFixed(2)} Lac`}
                        </span>
                        <span>•</span>
                        <span>{listing.area} {listing.areaUnit}</span>
                        <span>•</span>
                        <span>{listing.locality}, {listing.city}</span>
                      </div>

                      {/* Rejection notice if listing was rejected */}
                      {listing.status === "REJECTED" && listing.rejectionReason && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                          <strong>Rejection Reason:</strong> {listing.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {listing.status === "ACTIVE" && (
                      <Link
                        href={`/properties/${listing.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                        title="View Live Listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Live</span>
                      </Link>
                    )}

                    <Link
                      href={`/dashboard/seller/listings/${listing.id}/edit`}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      title="Edit Listing Details"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(listing.id, listing.status)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                        listing.status === "DEACTIVATED" || listing.status === "SOLD"
                          ? "border-emerald-200 bg-emerald-50 text-[#0c4a3e] hover:bg-emerald-100"
                          : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                      }`}
                      title={listing.status === "DEACTIVATED" ? "Reactivate listing" : "Deactivate listing"}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {listing.status === "DEACTIVATED" || listing.status === "SOLD" ? "Reactivate" : "Deactivate"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Recent Buyer Enquiries Inbox */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Buyer Enquiries</h2>
              <p className="text-xs text-slate-400">Buyers who contacted you for site visits or property details</p>
            </div>
            <Link
              href="/dashboard/seller/enquiries"
              className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
            >
              <span>View all ({enquiries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No buyer enquiries received yet. Enquiries from verified buyers will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {enquiries.slice(0, 3).map(enq => (
                <div key={enq.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{enq.buyerName}</span>
                      <span className="text-xs text-slate-400">• {enq.buyerPhone}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enq.status === "NEW" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {enq.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#0c4a3e] font-semibold">
                      Interested in: {enq.propertyTitle}
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                      "{enq.message}"
                    </p>
                    {enq.sellerReply && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                        <strong>Your Reply:</strong> {enq.sellerReply}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setRespondingEnquiry(enq)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition cursor-pointer"
                    >
                      Respond / Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Response Modal */}
      {respondingEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Respond to {respondingEnquiry.buyerName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Direct Contact: <a href={`tel:${respondingEnquiry.buyerPhone}`} className="text-[#0c4a3e] font-bold underline">{respondingEnquiry.buyerPhone}</a> | <a href={`mailto:${respondingEnquiry.buyerEmail}`} className="underline">{respondingEnquiry.buyerEmail}</a>
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Your Response Message
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="e.g. Hello, thank you for your enquiry. The layout approval copy is ready, and we can arrange a site visit this Saturday at 10 AM..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRespondingEnquiry(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSendingReply || !replyText.trim()}
                onClick={handleSendReply}
                className="px-5 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSendingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
