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
  ExternalLink,
  AlertCircle,
  Clock,
  Camera,
  Edit,
  Building2,
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
    myPropertiesCount: 0,
  });
  const [recentSaved, setRecentSaved] = useState<PropertyItem[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<PropertyItem[]>([]);
  const [needsInfoList, setNeedsInfoList] = useState<PropertyItem[]>([]);

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

        // Fetch user's own property submissions (Phase 8: User Dashboard)
        const propRes = await fetch("/api/seller/listings");
        const propData = await propRes.json();
        if (propData.success && propData.listings) {
          const allProps: PropertyItem[] = propData.listings;
          setStats(prev => ({ ...prev, myPropertiesCount: allProps.length }));
          setRecentSubmissions(allProps.slice(0, 3));
          setNeedsInfoList(allProps.filter(p => p.status === "NEEDS_MORE_INFORMATION"));
        }
      } catch (err) {
        console.warn("[DASHBOARD] Could not load metrics:", err);
      }
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const isSellerOrAgent = user?.role === "SELLER" || user?.role === "AGENT" || user?.role === "BUILDER" || user?.role === "ADMIN" || stats.myPropertiesCount > 0;

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6 sm:space-y-8">

          {/* Welcome User Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e2e8e4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                  {user?.role || "MEMBER"} ACCOUNT
                </span>
                {user?.profile?.isEmailVerified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
                Welcome back, {user?.name || "Member"}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {user?.phoneNumber || user?.email || "user@landora.in"} • Region: <strong className="text-slate-800">{user?.profile?.city || user?.city || "Coimbatore"}</strong>
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

              <Link
                href="/post-property"
                className="inline-flex items-center gap-1.5 bg-[#0c4a3e] hover:bg-[#072e27] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-[#c59b27]" />
                <span>Post Property</span>
              </Link>
            </div>
          </div>

          {/* CRITICAL ACTION ALERT: If any property is in NEEDS_MORE_INFORMATION */}
          {needsInfoList.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-sm text-amber-950">
                    Action Required: {needsInfoList.length} Property Submission Needs More Information
                  </h3>
                  <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                    The Landora verification team has reviewed your submission and requested additional details or documents.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/seller/listings?status=NEEDS_MORE_INFORMATION"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shrink-0 transition shadow-xs text-center"
              >
                Review & Update Now →
              </Link>
            </div>
          )}

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. My Properties (Phase 8 Highlight) */}
            <Link
              href="/dashboard/seller/listings"
              className="bg-white p-5 rounded-2xl border border-[#e2e8e4] hover:border-[#0c4a3e] transition shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">My Properties</span>
                <Building2 className="w-5 h-5 text-[#0c4a3e]" />
              </div>
              <div className="text-2xl font-black text-[#132a24]">
                {stats.myPropertiesCount} {stats.myPropertiesCount === 1 ? "Property" : "Properties"}
              </div>
              <p className="text-[11px] text-slate-400 group-hover:text-[#0c4a3e] flex items-center gap-1 font-semibold">
                <span>View all submissions</span>
                <ArrowRight className="w-3 h-3" />
              </p>
            </Link>

            {/* 2. Saved Shortlists */}
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

            {/* 3. Enquiries Sent */}
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

            {/* 4. Notifications & Preferences */}
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
          </div>

          {/* Section: My Property Submissions (Phase 8 Widget) */}
          <div className="bg-white p-6 rounded-3xl border border-[#e2e8e4] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0c4a3e]" />
                <h2 className="text-base font-black text-[#132a24]">My Property Submissions</h2>
              </div>
              <Link
                href="/dashboard/seller/listings"
                className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
              >
                <span>Manage Submissions ({stats.myPropertiesCount})</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentSubmissions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-3">
                <p>You haven&apos;t posted any properties on Landora yet.</p>
                <Link
                  href="/post-property"
                  className="inline-flex items-center gap-1.5 bg-[#0c4a3e] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-300" />
                  <span>Post Your First Property Free</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentSubmissions.map((prop) => (
                  <div key={prop.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={prop.images?.[0]?.url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=200"}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            Ref #{prop.referenceNumber || prop.id.slice(-6)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prop.status === "ACTIVE" || prop.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : prop.status === "NEEDS_MORE_INFORMATION"
                              ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                              : prop.status === "SUBMITTED"
                              ? "bg-blue-50 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {prop.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 truncate max-w-md">{prop.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          ₹{prop.price.toLocaleString("en-IN")} • {prop.area} {prop.areaUnit} • {prop.locality}, {prop.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <Link
                        href={`/sell/status?ref=${encodeURIComponent(prop.referenceNumber || prop.id)}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Status</span>
                      </Link>
                      <Link
                        href={`/dashboard/seller/listings/${prop.id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Properties & Enquiries Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent Shortlisted Properties */}
            <div className="bg-white p-6 rounded-3xl border border-[#e2e8e4] shadow-xs space-y-4">
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
            <div className="bg-white p-6 rounded-3xl border border-[#e2e8e4] shadow-xs space-y-4">
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
