"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building, 
  Heart, 
  MessageSquare, 
  PlusCircle, 
  ArrowRight, 
  Bell, 
  User, 
  ShieldCheck, 
  Compass,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { PropertyItem } from "@/types";

export default function UserDashboardPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState({
    savedCount: 0,
    enquiryCount: 0,
    unreadNotifications: 0,
  });
  const [recentSaved, setRecentSaved] = useState<PropertyItem[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch saved properties
        const savedRes = await fetch("/api/user/saved-properties");
        const savedData = await savedRes.json();
        if (savedData.success) {
          setStats(prev => ({ ...prev, savedCount: savedData.count || 0 }));
          setRecentSaved(savedData.properties?.slice(0, 3) || []);
        }

        // Fetch enquiries
        const enqRes = await fetch("/api/user/enquiries");
        const enqData = await enqRes.json();
        if (enqData.success) {
          setStats(prev => ({ ...prev, enquiryCount: enqData.count || 0 }));
          setRecentEnquiries(enqData.enquiries?.slice(0, 3) || []);
        }

        // Fetch notifications
        const notifRes = await fetch("/api/user/notifications");
        const notifData = await notifRes.json();
        if (notifData.success) {
          setStats(prev => ({ ...prev, unreadNotifications: notifData.unreadCount || 0 }));
        }
      } catch (err) {
        console.warn("[DASHBOARD] Could not load metrics:", err);
      }
    }

    fetchDashboardData();
  }, []);

  const isSellerOrAgent = user?.role === "SELLER" || user?.role === "AGENT" || user?.role === "BUILDER" || user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6 sm:space-y-8">
          {/* Welcome User Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8e4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                  {user?.role || "BUYER"} ACCOUNT
                </span>
                {user?.profile?.isEmailVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
                Welcome back, {user?.name || "Member"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {user?.email || "user@landora.in"} • Primary Focus: <strong className="text-slate-800">{user?.profile?.city || user?.city || "Coimbatore"}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition"
              >
                <User className="w-4 h-4 text-[#0c4a3e]" />
                <span>My Profile</span>
              </Link>

              {isSellerOrAgent && (
                <Link
                  href="/post-property"
                  className="inline-flex items-center gap-1.5 bg-[#0c4a3e] hover:bg-[#072e27] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-[#c59b27]" />
                  <span>Post Property</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Saved Shortlists */}
            <Link
              href="/dashboard/saved"
              className="bg-white p-5 rounded-2xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Saved Properties</span>
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-[#132a24]">{stats.savedCount} Shortlisted</div>
              <p className="text-[11px] text-slate-400 group-hover:text-[#0c4a3e] flex items-center gap-1 font-semibold">
                <span>View shortlisted plots</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </Link>

            {/* 2. Enquiries Sent */}
            <Link
              href="/dashboard/enquiries"
              className="bg-white p-5 rounded-2xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">My Enquiries</span>
                <MessageSquare className="w-5 h-5 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-[#132a24]">{stats.enquiryCount} Sent</div>
              <p className="text-[11px] text-slate-400 group-hover:text-sky-700 flex items-center gap-1 font-semibold">
                <span>Track seller responses</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </Link>

            {/* 3. Notifications */}
            <Link
              href="/dashboard/notifications"
              className="bg-white p-5 rounded-2xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notifications</span>
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-[#132a24]">
                {stats.unreadNotifications} Unread
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-[#0c4a3e] flex items-center gap-1 font-semibold">
                <span>View alerts & updates</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </Link>

            {/* 4. Seller / Agent Hub Link or Buyer Search */}
            {isSellerOrAgent ? (
              <Link
                href="/dashboard/seller"
                className="bg-white p-5 rounded-2xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Seller Hub</span>
                  <Building className="w-5 h-5 text-[#0c4a3e]" />
                </div>
                <div className="text-2xl font-black text-[#132a24]">Manage Listings</div>
                <p className="text-[11px] text-slate-400 group-hover:text-[#0c4a3e] flex items-center gap-1 font-semibold">
                  <span>Inventory & leads portal</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            ) : (
              <Link
                href="/properties"
                className="bg-white p-5 rounded-2xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Discover Land</span>
                  <Compass className="w-5 h-5 text-[#0c4a3e]" />
                </div>
                <div className="text-2xl font-black text-[#132a24]">Browse Plots</div>
                <p className="text-[11px] text-slate-400 group-hover:text-[#0c4a3e] flex items-center gap-1 font-semibold">
                  <span>Explore verified titles</span>
                  <ArrowRight className="w-3 h-3" />
                </p>
              </Link>
            )}
          </div>

          {/* Saved Properties & Enquiries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent Shortlisted Properties */}
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <h2 className="text-base font-bold text-[#132a24]">Shortlisted Properties</h2>
                </div>
                <Link href="/dashboard/saved" className="text-xs font-bold text-[#0c4a3e] hover:underline">
                  View All ({stats.savedCount})
                </Link>
              </div>

              {recentSaved.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                  <p>You haven&apos;t shortlisted any properties yet.</p>
                  <Link
                    href="/properties"
                    className="inline-block bg-[#0c4a3e] text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Browse Listings
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentSaved.map((prop) => (
                    <div key={prop.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{prop.title}</h3>
                        <p className="text-[11px] text-slate-500">
                          {prop.locality}, {prop.city} • ₹{prop.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Link
                        href={`/properties/${prop.slug}`}
                        className="text-xs font-bold text-[#0c4a3e] hover:underline shrink-0"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Submitted Enquiries */}
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <h2 className="text-base font-bold text-[#132a24]">Recent Enquiries Sent</h2>
                </div>
                <Link href="/dashboard/enquiries" className="text-xs font-bold text-[#0c4a3e] hover:underline">
                  View All ({stats.enquiryCount})
                </Link>
              </div>

              {recentEnquiries.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                  <p>You haven&apos;t sent any buyer enquiries yet.</p>
                  <p className="text-[11px] text-slate-400">
                    When you enquire about a plot or house, you can track seller responses here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentEnquiries.map((enq) => (
                    <div key={enq.id} className="py-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-slate-900 font-bold line-clamp-1">
                          {enq.propertyTitle}
                        </strong>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          enq.status === "CONTACTED" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-sky-100 text-sky-800"
                        }`}>
                          {enq.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        &quot;{enq.message}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
