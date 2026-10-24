"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MapPin, 
  ChevronDown, 
  Heart, 
  Menu, 
  X, 
  Bell,
  ShieldCheck, 
  PhoneCall, 
  HelpCircle,
  PlusCircle,
  Building2,
  LayoutDashboard,
  LogOut,
  FolderLock,
  Headphones,
  Compass,
  FileText,
  TrendingUp,
  Sparkles,
  UserCheck
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { POPULAR_LOCATIONS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  currentCity?: string;
  onCityChange?: (city: string) => void;
  savedCount?: number;
}

export default function Header({ 
  currentCity = "Coimbatore", 
  onCityChange,
  savedCount: propSavedCount 
}: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user, logout, savedIds } = useAuth();
  const savedCount = propSavedCount !== undefined ? propSavedCount : savedIds.length;

  // Scroll detection state: merged at top, solid fixed when scrolled
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/user/notifications");
        const data = await res.json();
        if (data.success) {
          setUnreadNotifCount(data.unreadCount || 0);
          setRecentNotifs((data.notifications || []).slice(0, 4));
        }
      } catch {}
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCityDropdownOpen(false);
    if (onCityChange) onCityChange(city);
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
  };

  // Determine whether navbar is transparent & merged with banner
  const isMerged = isHome && !isScrolled;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMerged 
            ? "bg-white/50 backdrop-blur-md text-slate-800 border-b border-white/60 py-2 sm:py-2.5" 
            : "bg-white/95 backdrop-blur-md text-slate-800 shadow-md border-b border-slate-200 py-2 sm:py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 lg:gap-4 h-12">
          {/* Left: Brand Logo & Location Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <BrandLogo 
              size="sm" 
              variant="dark" 
            />

            {/* City / Focus Location Selector */}
            <div className="relative shrink-0">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg transition cursor-pointer bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-2xs whitespace-nowrap"
                title="Select Focus City"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#0c4a3e]" />
                <span className="max-w-[80px] sm:max-w-[110px] truncate">{selectedCity}</span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                  <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Popular Cities & Hubs</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Tamil Nadu</span>
                  </div>
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {POPULAR_LOCATIONS.map((loc) => (
                      <button
                        key={loc.city}
                        onClick={() => handleCitySelect(loc.city)}
                        className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-emerald-50 hover:text-[#0c4a3e] transition cursor-pointer ${
                          selectedCity === loc.city ? "font-bold text-[#0c4a3e] bg-emerald-50/80" : "text-slate-700"
                        }`}
                      >
                        <span>{loc.city}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{loc.state}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Concise, Neat & Single-Line Desktop Navigation Links (No wrapping) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-xs xl:text-[13px] font-bold shrink-0 whitespace-nowrap">
            {/* Buyers */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setActiveNavDropdown("buyers")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>Buyers</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {activeNavDropdown === "buyers" && (
                <div className="absolute top-full left-0 pt-1 w-60 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/buy" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Building2 className="w-4 h-4 text-[#0c4a3e]" />
                      <div>
                        <div>Buy Residential Properties</div>
                        <span className="text-[10px] text-slate-400 font-normal">Houses, Apartments & Villas</span>
                      </div>
                    </Link>
                    <Link 
                      href="/plots" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Compass className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Plots & Land Parcels</span>
                          <span className="bg-emerald-100 text-[#0c4a3e] text-[9px] px-1 py-0.2 rounded font-black">TOP</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">DTCP & CMDA Approved Sites</span>
                      </div>
                    </Link>
                    <Link 
                      href="/commercial" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>Commercial Properties</div>
                        <span className="text-[10px] text-slate-400 font-normal">Shops, Offices & Industrial</span>
                      </div>
                    </Link>
                    <Link 
                      href="/projects" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div>New Launch Projects</div>
                        <span className="text-[10px] text-slate-400 font-normal">Gated communities & townships</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Tenants */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setActiveNavDropdown("tenants")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>Tenants</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {activeNavDropdown === "tenants" && (
                <div className="absolute top-full left-0 pt-1 w-56 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/rent" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>Rent Homes & Flats</div>
                      <span className="text-[10px] text-slate-400 font-normal">Verified owner listings</span>
                    </Link>
                    <Link 
                      href="/commercial?listingType=RENT" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>Commercial Spaces for Lease</div>
                      <span className="text-[10px] text-slate-400 font-normal">Showrooms & office spaces</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Owners */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setActiveNavDropdown("owners")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>Owners</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {activeNavDropdown === "owners" && (
                <div className="absolute top-full left-0 pt-1 w-60 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/post-property" 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>Post Property FREE</div>
                        <span className="text-[10px] text-slate-400 font-normal">Direct buyer enquiries</span>
                      </div>
                    </Link>
                    <Link 
                      href="/dashboard/seller" 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Building2 className="w-4 h-4 text-[#0c4a3e]" />
                      <div>
                        <div>Owner / Seller Dashboard</div>
                        <span className="text-[10px] text-slate-400 font-normal">Manage listings & leads</span>
                      </div>
                    </Link>
                    <Link 
                      href="/dashboard/packages" 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div>Featured Listing Plans</div>
                        <span className="text-[10px] text-slate-400 font-normal">10x visibility for plots & homes</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Builders */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setActiveNavDropdown("dealers")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>Builders</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {activeNavDropdown === "dealers" && (
                <div className="absolute top-full left-0 pt-1 w-60 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/dashboard/seller" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>Agent & Broker Portal</div>
                      <span className="text-[10px] text-slate-400 font-normal">Multi-listing inventory tools</span>
                    </Link>
                    <Link 
                      href="/projects" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>Developer Showcase</div>
                      <span className="text-[10px] text-slate-400 font-normal">Layout & township promotion</span>
                    </Link>
                    <Link 
                      href="/admin/dashboard" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <div>Admin & Verification Desk</div>
                      <span className="text-[10px] text-slate-400 font-normal">Moderation & audit portal</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Insights */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setActiveNavDropdown("insights")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>Insights</span>
                <span className="bg-rose-500 text-white text-[8.5px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  NEW
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {activeNavDropdown === "insights" && (
                <div className="absolute top-full left-0 pt-1 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/about" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>Coimbatore & TN Price Trends</div>
                        <span className="text-[10px] text-slate-400 font-normal">Locality rates & growth indices</span>
                      </div>
                    </Link>
                    <Link 
                      href="/help" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <FileText className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div>Patta & Title Verification Guide</div>
                        <span className="text-[10px] text-slate-400 font-normal">TNREGINET & CMDA guidelines</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Actions (Post Property FREE, Support Headphone, Saved, User Profile, Hamburger) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Post Property FREE Button */}
            <Link
              href="/post-property"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer bg-[#0c4a3e] hover:bg-[#072e27] text-white whitespace-nowrap shrink-0"
            >
              <span>Post property</span>
              <span className="bg-[#c59b27] text-slate-950 text-[8.5px] font-black px-1 py-0.2 rounded uppercase tracking-wider">
                FREE
              </span>
            </Link>

            {/* Support Desk (Headphone icon) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setSupportModalOpen(!supportModalOpen)}
                title="Customer Support Desk"
                className="p-1.5 rounded-full transition cursor-pointer text-slate-700 hover:text-[#0c4a3e] hover:bg-white/80"
              >
                <Headphones className="w-4 h-4" />
              </button>

              {supportModalOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Support Desk</span>
                    <button 
                      onClick={() => setSupportModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">+91 422 2345678</div>
                        <div className="text-[10px] text-slate-400">Mon-Sat, 9:00 AM - 7:00 PM IST</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Tamil Nadu Title Help</div>
                        <div className="text-[10px] text-slate-400">Patta & EC verification support</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link 
                      href="/help" 
                      onClick={() => setSupportModalOpen(false)}
                      className="text-[#0c4a3e] font-bold hover:underline"
                    >
                      Help Centre →
                    </Link>
                    <Link 
                      href="/about" 
                      onClick={() => setSupportModalOpen(false)}
                      className="text-slate-500 hover:text-slate-700 font-medium"
                    >
                      About Us
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Properties Icon */}
            <Link
              href="/dashboard/saved"
              title="Saved Properties"
              className="p-1.5 rounded-full transition cursor-pointer relative text-slate-700 hover:text-rose-600 hover:bg-white/80 shrink-0"
            >
              <Heart className={`w-4 h-4 ${savedCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {savedCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Notification Bell with Badge & Dropdown */}
            {user && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  title="Notifications & Alerts"
                  className="p-1.5 rounded-full transition cursor-pointer relative text-slate-700 hover:text-emerald-700 hover:bg-white/80 shrink-0 flex items-center justify-center"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0c4a3e]" />
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadNotifCount > 0 && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-[#0c4a3e] px-1.5 py-0.2 rounded-full">
                            {unreadNotifCount} new
                          </span>
                        )}
                      </div>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] font-semibold text-[#0c4a3e] hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {recentNotifs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        recentNotifs.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || "/dashboard/notifications"}
                            onClick={() => setNotifDropdownOpen(false)}
                            className={`block p-3 text-left hover:bg-slate-50 transition ${
                              !n.isRead ? "bg-emerald-50/40" : ""
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                              {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="pt-2 px-3 border-t border-slate-100 text-center">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="block w-full py-1.5 text-xs font-bold text-[#0c4a3e] hover:bg-emerald-50 rounded-lg transition"
                      >
                        Open Notification Center &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login Drawer */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1 p-1 rounded-xl transition cursor-pointer text-slate-800 hover:bg-white/80 sm:px-2 sm:py-1 sm:bg-white/80 sm:border sm:border-slate-200/80 shadow-2xs whitespace-nowrap"
                >
                  <div className="w-6 h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-600/20">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:inline" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Signed in as ({user.role})</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1 text-xs font-semibold text-slate-700">
                      <Link 
                        href="/dashboard" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#0c4a3e]" />
                        User Dashboard
                      </Link>
                      <Link 
                        href="/dashboard/profile" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#0c4a3e]" />
                        My Profile & Settings
                      </Link>
                      <Link 
                        href="/dashboard/saved" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        Saved Properties ({savedCount})
                      </Link>
                      <Link 
                        href="/dashboard/enquiries" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        My Enquiries
                      </Link>
                      {(user.role === "SELLER" || user.role === "AGENT" || user.role === "BUILDER" || user.role === "ADMIN") && (
                        <Link 
                          href="/dashboard/seller" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#0c4a3e]" />
                          Seller & Agent Hub
                        </Link>
                      )}
                      {user.role === "ADMIN" && (
                        <Link 
                          href="/admin/dashboard" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 text-[#0c4a3e] font-bold border-t border-slate-100 mt-1 pt-2"
                        >
                          <FolderLock className="w-3.5 h-3.5" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-100 px-4 pt-2 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left py-1 text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Link
                  href="/login"
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg transition text-[#0c4a3e] bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs whitespace-nowrap shrink-0"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg transition text-slate-700 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 border border-transparent sm:border-slate-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg transition cursor-pointer text-slate-800 hover:bg-white/80 shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white text-slate-800 border-t border-slate-200 px-4 py-4 space-y-3 shadow-2xl mt-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500">Selected Location:</span>
              <span className="text-sm font-black text-[#0c4a3e]">{selectedCity}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/buy"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[#0c4a3e]" />
                <span>Buy Property</span>
              </Link>
              <Link
                href="/rent"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Rent Property</span>
              </Link>
              <Link
                href="/plots"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-emerald-50 text-[#0c4a3e] flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#c59b27]" />
                <span>Plots & Land</span>
              </Link>
              <Link
                href="/commercial"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Commercial</span>
              </Link>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#c59b27]" />
                <span>New Projects</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#0c4a3e]" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Mobile Auth Profile / Log In Buttons */}
            {user ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Signed in as ({user.role})</span>
                    <span className="text-xs font-bold text-slate-900">{user.name}</span>
                    <span className="text-[11px] text-slate-500 block">{user.email}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-600/20">
                    {user.name.charAt(0)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-bold text-[#0c4a3e] hover:underline"
                    >
                      Admin Desk →
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-rose-600 font-bold hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-xs font-bold text-center border border-[#0c4a3e] text-[#0c4a3e] rounded-xl hover:bg-emerald-50 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-xs font-bold text-center bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              href="/post-property"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-bold text-center bg-[#0c4a3e] text-white rounded-xl shadow-xs"
            >
              Post Property FREE
            </Link>
          </div>
        )}
      </header>

      {/* Spacer for non-homepage routes so content is never obscured by the fixed header */}
      {!isHome && <div className="h-14" />}
    </>
  );
}
