"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, ArrowLeft, ArrowRight, Loader2, Calendar, MapPin, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export default function UserEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEnquiries() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/enquiries");
        const data = await res.json();
        if (data.success && data.enquiries) {
          setEnquiries(data.enquiries);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadEnquiries();
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0c4a3e] mb-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
                My Submitted Enquiries ({enquiries.length})
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track direct responses, phone callbacks, and site visit schedules from verified landowners and promoters.
              </p>
            </div>

            <Link
              href="/properties"
              className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
            >
              <span>Explore more properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0c4a3e]" />
              <p className="text-xs font-bold">Loading your enquiries...</p>
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#e2e8e4] space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Enquiries Sent Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                When you find a plot or house you like, use the enquiry form on the property page to directly contact the owner or layout promoter.
              </p>
              <Link
                href="/properties"
                className="inline-block mt-2 bg-[#0c4a3e] text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Find Properties to Enquire
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="bg-white rounded-2xl border border-[#e2e8e4] p-5 sm:p-6 shadow-xs hover:border-[#0c4a3e]/40 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900">
                        {enq.propertyTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#0c4a3e]" />
                          {enq.propertyLocation}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">
                          ₹{enq.propertyPrice?.toLocaleString("en-IN")}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        enq.status === "CONTACTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : enq.status === "CLOSED"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-sky-100 text-sky-800"
                      }`}>
                        Status: {enq.status}
                      </span>

                      {enq.propertySlug && (
                        <Link
                          href={`/properties/${enq.propertySlug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0c4a3e] hover:underline"
                        >
                          <span>View Property</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Your Message:
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                      &quot;{enq.message}&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
