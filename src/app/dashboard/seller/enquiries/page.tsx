"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Building2,
  ExternalLink,
  Search,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SellerEnquiriesPage() {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Responding state
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error("Failed to load seller enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [user]);

  const handleSendResponse = async () => {
    if (!selectedEnquiry || !replyMessage.trim()) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/seller/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: selectedEnquiry.id,
          replyMessage: replyMessage.trim(),
          status: "CONTACTED",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice("Response delivered to buyer and enquiry marked as Contacted!");
        setSelectedEnquiry(null);
        setReplyMessage("");
        fetchEnquiries();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Failed to submit response.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredEnquiries = enquiries.filter(e => {
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      e.buyerName.toLowerCase().includes(q) ||
      e.propertyTitle.toLowerCase().includes(q) ||
      e.buyerPhone.includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/seller" className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buyer Enquiries Inbox</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct inquiries submitted by interested buyers and investors across Tamil Nadu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEnquiries}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Refresh inbox"
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Enquiries" },
              { id: "NEW", label: "New (Unread)" },
              { id: "CONTACTED", label: "Contacted" },
              { id: "FOLLOW_UP", label: "Follow Up" },
              { id: "CLOSED", label: "Closed / Deal Done" },
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

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by buyer name, phone..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
            />
          </div>
        </div>

        {/* Enquiries List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading enquiries...</div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No buyer enquiries found.</p>
              <p className="text-xs text-slate-400">
                {statusFilter !== "ALL" ? `No enquiries with status "${statusFilter}".` : "Incoming leads will appear here once buyers reach out."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEnquiries.map(enq => (
                <div key={enq.id} className="p-5 hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{enq.buyerName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enq.status === "NEW" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {enq.status}
                      </span>
                      <span className="text-[11px] text-slate-400">• {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <a href={`tel:${enq.buyerPhone}`} className="text-[#0c4a3e] font-bold hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{enq.buyerPhone}</span>
                      </a>
                      <a href={`mailto:${enq.buyerEmail}`} className="text-slate-500 hover:underline flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{enq.buyerEmail}</span>
                      </a>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      Listing: <Link href={`/properties/${enq.propertySlug || enq.propertyId}`} target="_blank" className="text-[#0c4a3e] hover:underline">
                        {enq.propertyTitle}
                      </Link>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic">
                      "{enq.message}"
                    </div>

                    {enq.sellerReply && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                        <div className="font-bold flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Your Reply:</span>
                        </div>
                        <p>{enq.sellerReply}</p>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 self-end md:self-start">
                    <button
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setReplyMessage(enq.sellerReply || "");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{enq.sellerReply ? "Update Reply" : "Respond to Buyer"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Response Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Respond to {selectedEnquiry.buyerName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Regarding: <strong>{selectedEnquiry.propertyTitle}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Your Response Message
              </label>
              <textarea
                rows={4}
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                placeholder="Share available site visit dates, document copies (Patta/EC), or answer the buyer's query directly..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSending || !replyMessage.trim()}
                onClick={handleSendResponse}
                className="px-5 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
