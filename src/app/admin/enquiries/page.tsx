"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Mail,
  Building2,
  Search,
  RefreshCw,
  ExternalLink,
  Clock
} from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error("Failed to load platform enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      e.buyerName?.toLowerCase().includes(q) ||
      e.buyerPhone?.includes(q) ||
      e.propertyTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Buyer Enquiries</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global oversight of buyer inquiries, site visit requests, and landowner interactions.
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by buyer name, phone, property..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
          />
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Found <strong>{filteredEnquiries.length}</strong> enquiries across marketplace</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading platform enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No enquiries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Buyer</th>
                  <th className="p-3.5">Property Listing</th>
                  <th className="p-3.5">Message Excerpt</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredEnquiries.map(enq => (
                  <tr key={enq.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{enq.buyerName}</div>
                      <div className="text-[10px] text-slate-500">{enq.buyerPhone}</div>
                      <div className="text-[10px] text-slate-400">{enq.buyerEmail}</div>
                    </td>

                    <td className="p-3.5 max-w-xs truncate">
                      <Link
                        href={`/properties/${enq.propertySlug || enq.propertyId}`}
                        target="_blank"
                        className="font-bold text-[#0c4a3e] hover:underline block truncate"
                      >
                        {enq.propertyTitle}
                      </Link>
                      <span className="text-[10px] text-slate-400">{enq.propertyLocation}</span>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <p className="line-clamp-2 italic text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                        "{enq.message}"
                      </p>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enq.status === "NEW" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {enq.status}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-slate-400">
                      {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
