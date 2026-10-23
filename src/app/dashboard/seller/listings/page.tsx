"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Power,
  Edit,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PropertyItem } from "@/types";

export default function SellerListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter !== "ALL" 
        ? `/api/seller/listings?status=${statusFilter}` 
        : "/api/seller/listings";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter, user]);

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
        setActionNotice(`Listing status updated to ${newStatus}.`);
        fetchListings();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {
      alert("Failed to update listing status.");
    }
  };

  const filteredListings = listings.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      l.title.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.locality.toLowerCase().includes(q)
    );
  });

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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">All Property Listings</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your property inventory, monitor review progress, and update details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/seller/listings/new"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Post New Property</span>
            </Link>
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

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All" },
              { id: "ACTIVE", label: "Live (Active)" },
              { id: "PENDING", label: "Pending Review" },
              { id: "DRAFT", label: "Drafts" },
              { id: "REJECTED", label: "Rejected" },
              { id: "DEACTIVATED", label: "Deactivated" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#0c4a3e] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by title, city..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
            />
          </div>
        </div>

        {/* Listings Table / Card List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No matching listings found.</p>
              <p className="text-xs text-slate-400">
                {statusFilter !== "ALL" ? `No listings with status "${statusFilter}".` : "You haven't posted any properties yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredListings.map(listing => (
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

                      {listing.status === "REJECTED" && listing.rejectionReason && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                          <strong>Rejection Reason:</strong> {listing.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {listing.status === "ACTIVE" && (
                      <Link
                        href={`/properties/${listing.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    )}

                    <Link
                      href={`/dashboard/seller/listings/${listing.id}/edit`}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(listing.id, listing.status)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                        listing.status === "DEACTIVATED" || listing.status === "SOLD"
                          ? "border-emerald-200 bg-emerald-50 text-[#0c4a3e] hover:bg-emerald-100"
                          : "border-slate-200 bg-white hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{listing.status === "DEACTIVATED" || listing.status === "SOLD" ? "Reactivate" : "Deactivate"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
