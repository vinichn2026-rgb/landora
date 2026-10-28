"use client";

import { useState, useEffect, useRef } from "react";
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
  RefreshCw,
  FileText,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  Camera,
  Image as ImageIcon,
  Bell,
  MessageCircle,
  Phone,
  ShieldCheck,
  HelpCircle,
  SlidersHorizontal,
  Sparkles,
  Share2,
  ArrowRight,
  Upload,
  Eye,
  CheckCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PropertyItem, PropertyImageItem, PropertyStatus } from "@/types";
import { SUPPORT_WHATSAPP, SUPPORT_PHONE } from "@/lib/constants";

export default function UserPropertiesDashboard() {
  const { user, openAuthModal } = useAuth();
  const { language, t } = useLanguage();

  const [listings, setListings] = useState<PropertyItem[]>([]);
  const [counts, setCounts] = useState({
    ALL: 0,
    DRAFT: 0,
    SUBMITTED: 0,
    PENDING_VERIFICATION: 0,
    NEEDS_MORE_INFORMATION: 0,
    PUBLISHED: 0,
    REJECTED: 0,
    SOLD_RENTED: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Image Management Modal State ---
  const [selectedPropertyForImages, setSelectedPropertyForImages] = useState<PropertyItem | null>(null);
  const [propertyImages, setPropertyImages] = useState<PropertyImageItem[]>([]);
  const [isSavingImages, setIsSavingImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Notification Preferences Modal State ---
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifPreferences, setNotifPreferences] = useState({
    transactionalSms: true,
    transactionalWhatsapp: true,
    promotionalOffers: false,
  });
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  // --- Delete Confirmation Modal State ---
  const [deletingProperty, setDeletingProperty] = useState<PropertyItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch listings and category counts
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter !== "ALL"
        ? `/api/seller/listings?status=${statusFilter}`
        : "/api/seller/listings";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setListings(data.listings || []);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchListings();
      loadCommunicationPreferences();
    } else {
      setIsLoading(false);
    }
  }, [statusFilter, user]);

  const loadCommunicationPreferences = async () => {
    try {
      const res = await fetch("/api/user/communication-preferences");
      const data = await res.json();
      if (data.success && data.preferences) {
        setNotifPreferences({
          transactionalSms: data.preferences.transactionalSms ?? true,
          transactionalWhatsapp: data.preferences.transactionalWhatsapp ?? true,
          promotionalOffers: data.preferences.promotionalOffers ?? false,
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingNotif(true);
    try {
      const res = await fetch("/api/user/communication-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifPreferences),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice("Communication preferences updated successfully.");
        setShowNotifModal(false);
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch {
      alert("Failed to update preferences.");
    } finally {
      setIsSavingNotif(false);
    }
  };

  const handleCopyRef = (refId: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(refId);
      setCopiedId(refId);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
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
      } else {
        alert(data.error || "Failed to update status.");
      }
    } catch {
      alert("Failed to update listing status.");
    }
  };

  const handleDeleteListing = async () => {
    if (!deletingProperty) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/seller/listings/${deletingProperty.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Listing "${deletingProperty.title}" deleted.`);
        setDeletingProperty(null);
        fetchListings();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Failed to delete listing.");
      }
    } catch {
      alert("Network error deleting listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Image Management Handlers ---
  const handleOpenImageManager = (property: PropertyItem) => {
    setSelectedPropertyForImages(property);
    setPropertyImages(property.images || []);
  };

  const handleSetPrimaryImage = (index: number) => {
    setPropertyImages(prev =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setPropertyImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const newImgItem: PropertyImageItem = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: data.url,
          isPrimary: propertyImages.length === 0,
          order: propertyImages.length,
        };
        setPropertyImages(prev => [...prev, newImgItem]);
      } else {
        alert(data.error || "Failed to upload image.");
      }
    } catch {
      alert("Network error uploading photo.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveImages = async () => {
    if (!selectedPropertyForImages) return;
    setIsSavingImages(true);
    try {
      const res = await fetch(`/api/seller/listings/${selectedPropertyForImages.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: propertyImages }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice("Property photos updated successfully.");
        setSelectedPropertyForImages(null);
        fetchListings();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Failed to save photos.");
      }
    } catch {
      alert("Failed to save photos.");
    } finally {
      setIsSavingImages(false);
    }
  };

  // Filter listings by search query (title, ref, locality, city)
  const filteredListings = listings.filter(l => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const ref = (l.referenceNumber || l.id).toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      ref.includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.locality.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
      case "ACTIVE":
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Published • Live</span>
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Submitted • Under Review</span>
          </span>
        );
      case "PENDING_VERIFICATION":
      case "PENDING":
        return (
          <span className="bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pending Verification</span>
          </span>
        );
      case "NEEDS_MORE_INFORMATION":
        return (
          <span className="bg-amber-100 text-amber-950 border border-amber-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>Needs More Information</span>
          </span>
        );
      case "DRAFT":
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Draft • Incomplete</span>
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      case "SOLD":
        return (
          <span className="bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Sold</span>
          </span>
        );
      case "RENTED":
        return (
          <span className="bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Rented</span>
          </span>
        );
      case "DEACTIVATED":
      default:
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Power className="w-3.5 h-3.5 text-slate-400" />
            <span>Deactivated</span>
          </span>
        );
    }
  };

  const formatPrice = (price: number) => {
    if (!price || price <= 0) return "Price on Request";
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(2)} Lakhs`;
    return `₹ ${price.toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // If user is not authenticated, prompt sign in
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center space-y-4 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0c4a3e] flex items-center justify-center mx-auto border-2 border-emerald-100">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Sign In to View Your Properties</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please sign in with your mobile number or email to manage your property submissions, track verification, and update photos.
          </p>
          <div className="pt-2">
            <button
              onClick={() => openAuthModal({ title: "My Properties Dashboard", redirectTo: "/dashboard/seller/listings" })}
              className="w-full py-3 px-4 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer"
            >
              Sign In with Mobile OTP / Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">

        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                Phase 8 • User Dashboard
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {user?.name || "Member"} ({user?.phoneNumber || user?.email || "Account"})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Property Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track verification progress, review feedback from the Landora team, edit details, manage photos, and update notification preferences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Notification Preferences Button */}
            <button
              type="button"
              onClick={() => setShowNotifModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Configure SMS & WhatsApp Updates"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Notification Preferences</span>
            </button>

            {/* Post New Property CTA */}
            <Link
              href="/post-property"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-extrabold transition shadow-sm cursor-pointer active:scale-[0.99]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Post New Property</span>
            </Link>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:underline text-xs font-bold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          
          {/* Scrollable Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {[
              { id: "ALL", label: "My Properties", count: counts.ALL },
              { id: "DRAFT", label: "Drafts", count: counts.DRAFT },
              { id: "SUBMITTED", label: "Submitted", count: counts.SUBMITTED },
              { id: "PENDING_VERIFICATION", label: "Pending Verification", count: counts.PENDING_VERIFICATION },
              { id: "NEEDS_MORE_INFORMATION", label: "Needs More Information", count: counts.NEEDS_MORE_INFORMATION, alert: counts.NEEDS_MORE_INFORMATION > 0 },
              { id: "PUBLISHED", label: "Published", count: counts.PUBLISHED },
              { id: "REJECTED", label: "Rejected", count: counts.REJECTED },
              { id: "SOLD_RENTED", label: "Sold or Rented", count: counts.SOLD_RENTED },
            ].map(tab => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-[#0c4a3e] text-white shadow-2xs"
                      : tab.alert
                      ? "bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-extrabold"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive
                        ? "bg-emerald-800 text-white"
                        : tab.alert
                        ? "bg-amber-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, locality, city, or Reference ID (#LND-...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#0c4a3e] bg-slate-50/50"
            />
          </div>
        </div>

        {/* Listings Cards List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-[#0c4a3e] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading your property submissions...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No properties found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {statusFilter !== "ALL"
                    ? `You do not have any property submissions with status "${statusFilter}".`
                    : "You haven't submitted any properties yet. Tap below to post your first property."}
                </p>
              </div>
              <Link
                href="/post-property"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0c4a3e] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-emerald-300" />
                <span>Post a Property</span>
              </Link>
            </div>
          ) : (
            filteredListings.map(listing => {
              const refId = listing.referenceNumber || `LND-${listing.id.slice(-6).toUpperCase()}`;
              const isNeedsMoreInfo = listing.status === "NEEDS_MORE_INFORMATION";
              const isRejected = listing.status === "REJECTED";
              const isPending = listing.status === "PENDING_VERIFICATION" || listing.status === "PENDING";
              const isSubmitted = listing.status === "SUBMITTED";
              const isLive = listing.status === "ACTIVE" || listing.status === "PUBLISHED";
              const canEdit = listing.status !== "SOLD" && listing.status !== "RENTED";

              return (
                <div
                  key={listing.id}
                  className={`bg-white rounded-3xl border transition shadow-2xs p-5 sm:p-6 space-y-4 ${
                    isNeedsMoreInfo
                      ? "border-amber-300 ring-2 ring-amber-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Top Bar: Reference ID & Status & Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                        <span>Ref #{refId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(refId)}
                          title="Copy Reference ID"
                          className="text-slate-400 hover:text-slate-700 transition"
                        >
                          {copiedId === refId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </span>

                      {getStatusBadge(listing.status)}

                      <span className="text-[11px] font-bold uppercase text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {listing.listingType}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium">
                      <span>Submitted: {formatDate(listing.submittedAt || listing.createdAt)}</span>
                    </div>
                  </div>

                  {/* Main Property Card Body */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Photo Thumbnail with Image Count Badge */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={
                            listing.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=300"
                          }
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{listing.images?.length || 0}</span>
                        </span>
                      </div>

                      {/* Title, Pricing & Details */}
                      <div className="min-w-0 space-y-1.5">
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                          {listing.title}
                        </h3>

                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                          <span className="font-extrabold text-[#0c4a3e] text-sm">
                            {formatPrice(listing.price)}
                          </span>
                          <span>•</span>
                          <span className="font-semibold">
                            {listing.area} {listing.areaUnit?.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>
                            {listing.locality ? `${listing.locality}, ` : ""}
                            {listing.city}
                          </span>
                        </div>

                        {/* Property Specifics Preview */}
                        <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap pt-0.5">
                          {listing.approvalStatus && (
                            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">
                              {listing.approvalStatus}
                            </span>
                          )}
                          {listing.facing && (
                            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">
                              Facing: {listing.facing}
                            </span>
                          )}
                          {listing.bedrooms && (
                            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-medium">
                              {listing.bedrooms} BHK
                            </span>
                          )}
                          {listing.viewsCount > 0 && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{listing.viewsCount} views</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons Group */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0 self-start md:self-center">
                      {/* Public Live View */}
                      {isLive && (
                        <Link
                          href={`/properties/${listing.slug}`}
                          target="_blank"
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Public Page</span>
                        </Link>
                      )}

                      {/* Online Status Tracker */}
                      <Link
                        href={`/sell/status?ref=${encodeURIComponent(refId)}`}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Track Status</span>
                      </Link>

                      {/* Image Management Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenImageManager(listing)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Manage Photos ({listing.images?.length || 0})</span>
                      </button>

                      {/* Edit Details Button */}
                      {canEdit && (
                        <Link
                          href={`/dashboard/seller/listings/${listing.id}/edit`}
                          className="px-3 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Edit Details</span>
                        </Link>
                      )}

                      {/* Quick Status / Mark Sold / Deactivate Dropdown */}
                      {isLive ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(listing.id, "SOLD")}
                          className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                          title="Mark as Sold"
                        >
                          <span>Mark Sold</span>
                        </button>
                      ) : listing.status === "SOLD" || listing.status === "RENTED" || listing.status === "DEACTIVATED" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(listing.id, "PENDING")}
                          className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Reactivate</span>
                        </button>
                      ) : null}

                      {/* Delete Option for Draft or Incomplete Submissions */}
                      {(listing.status === "DRAFT" || listing.status === "REJECTED") && (
                        <button
                          type="button"
                          onClick={() => setDeletingProperty(listing)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* RELEVANT FEEDBACK FROM THE LANDORA TEAM */}
                  {/* Case 1: NEEDS_MORE_INFORMATION */}
                  {isNeedsMoreInfo && (
                    <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-xs text-amber-950 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <h4 className="font-extrabold text-amber-950 text-sm">
                            Landora Verification Team Feedback — Action Required:
                          </h4>
                          <p className="text-amber-900 leading-relaxed font-medium">
                            {listing.verificationNotes ||
                              "Please provide clearer survey sketch documents or boundary dimensions so our team can approve your listing."}
                          </p>
                          <div className="pt-2 flex items-center gap-2">
                            <Link
                              href={`/dashboard/seller/listings/${listing.id}/edit`}
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Update Required Details Now</span>
                            </Link>
                            <a
                              href={`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello Landora Team, I have a query regarding feedback on my submission #${refId}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 border border-amber-300 bg-white text-amber-900 rounded-xl font-bold text-xs hover:bg-amber-100 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Clarify on WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case 2: REJECTED */}
                  {isRejected && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <div className="flex items-start gap-2.5">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-extrabold text-rose-950 text-sm">
                            Submission Not Approved:
                          </h4>
                          <p className="text-rose-800 leading-relaxed mt-0.5 font-medium">
                            {listing.rejectionReason || listing.verificationNotes || "The property could not be verified against the state revenue survey portal. Please review and update."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Case 3: PENDING_VERIFICATION */}
                  {isPending && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-950">Verification in Progress: </span>
                        <span>Our legal & field desk is reviewing survey map coordinates and records against state portal registries. Standard turnaround: <strong>within 24 hours</strong>.</span>
                      </div>
                    </div>
                  )}

                  {/* Case 4: SUBMITTED */}
                  {isSubmitted && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-blue-950">Submission Queued: </span>
                        <span>Your listing details are safely stored in Landora database and assigned to our review desk.</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: IMAGE MANAGEMENT (View, Set Primary, Remove, Upload)            */}
      {/* ========================================================================= */}
      {selectedPropertyForImages && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Manage Photos: {selectedPropertyForImages.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ref #{selectedPropertyForImages.referenceNumber || selectedPropertyForImages.id.slice(-6)} • {propertyImages.length} photo(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPropertyForImages(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photos Grid */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {propertyImages.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                  No photos uploaded for this listing yet. Upload photos below.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {propertyImages.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={`relative group rounded-2xl overflow-hidden border-2 transition ${
                        img.isPrimary
                          ? "border-emerald-600 shadow-md ring-2 ring-emerald-100"
                          : "border-slate-200"
                      }`}
                    >
                      <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-32 object-cover" />

                      {/* Primary Cover Badge */}
                      {img.isPrimary && (
                        <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          Cover Photo
                        </span>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="p-1.5 rounded-lg bg-white/90 text-slate-900 text-[11px] font-bold hover:bg-white shadow-xs cursor-pointer"
                            title="Set as Cover Photo"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Photo Upload Bar */}
              <div className="pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadNewImage}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-[#0c4a3e]/40 hover:border-[#0c4a3e] bg-emerald-50/50 hover:bg-emerald-50 text-[#0c4a3e] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className={`w-4 h-4 ${isUploadingImage ? "animate-spin" : ""}`} />
                  <span>{isUploadingImage ? "Uploading Photo..." : "+ Upload New Photo"}</span>
                </button>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPropertyForImages(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveImages}
                disabled={isSavingImages}
                className="py-2.5 px-6 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-black transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingImages ? "Saving Changes..." : "Save Photo Updates"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NOTIFICATION PREFERENCES                                         */}
      {/* ========================================================================= */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Communication Preferences</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Choose how you wish to receive updates regarding your property submissions and buyer inquiries.
            </p>

            <div className="space-y-3 pt-1">
              {/* Option 1: WhatsApp */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:border-slate-300 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifPreferences.transactionalWhatsapp}
                  onChange={e => setNotifPreferences(prev => ({ ...prev, transactionalWhatsapp: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#0c4a3e] focus:ring-[#0c4a3e] mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Submission Updates</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Receive instant alerts when review status changes or buyer inquiries arrive.
                  </p>
                </div>
              </label>

              {/* Option 2: SMS */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:border-slate-300 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifPreferences.transactionalSms}
                  onChange={e => setNotifPreferences(prev => ({ ...prev, transactionalSms: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#0c4a3e] focus:ring-[#0c4a3e] mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>SMS Transactional Alerts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Critical submission receipts and verification notifications via SMS.
                  </p>
                </div>
              </label>

              {/* Option 3: Promotional */}
              <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:border-slate-300 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifPreferences.promotionalOffers}
                  onChange={e => setNotifPreferences(prev => ({ ...prev, promotionalOffers: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#0c4a3e] focus:ring-[#0c4a3e] mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Market Insights & Announcements</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Optional quarterly price trend digests and platform announcements.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNotifModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSavingNotif}
                className="py-2.5 px-6 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-black transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingNotif ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION                                              */}
      {/* ========================================================================= */}
      {deletingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Property Submission?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deletingProperty.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProperty(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteListing}
                disabled={isDeleting}
                className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
