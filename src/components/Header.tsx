"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  UserCheck,
  Languages,
  Check
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { POPULAR_LOCATIONS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

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
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { user, logout, savedIds, openAuthModal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const savedCount = propSavedCount !== undefined ? propSavedCount : savedIds.length;

  // Scroll detection state: merged at top, solid fixed when scrolled
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const supportDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(target)) {
        setCityDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (supportDropdownRef.current && !supportDropdownRef.current.contains(target)) {
        setSupportModalOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setNotifDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            ? "bg-white/50 backdrop-blur-md text-slate-800 border-b border-white/60 py-1.5 sm:py-2" 
            : "bg-white/95 backdrop-blur-md text-slate-800 shadow-md border-b border-slate-200 py-1.5 sm:py-2"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 flex items-center justify-between gap-1 sm:gap-2 lg:gap-2.5 h-11 sm:h-12">
          {/* Left: Brand Logo & Location Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <BrandLogo 
              size="sm" 
              variant="dark" 
            />

            {/* City / Focus Location Selector */}
            <div className="relative shrink-0" ref={cityDropdownRef}>
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-bold px-1.5 sm:px-2 py-1 rounded-lg transition cursor-pointer bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-2xs whitespace-nowrap"
                title={t("nav.selectCity", "Select Focus City")}
              >
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#0c4a3e]" />
                <span className="max-w-[65px] sm:max-w-[100px] truncate">{selectedCity}</span>
                <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-60 sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>{t("nav.popularCities", "Popular Cities & Hubs")}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{t("nav.tamilNadu", "Tamil Nadu")}</span>
                  </div>
                  <div className="py-1 max-h-64 overflow-y-auto">
                    {POPULAR_LOCATIONS.map((loc) => (
                      <button
                        key={loc.city}
                        type="button"
                        onClick={() => handleCitySelect(loc.city)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-[#0c4a3e] transition cursor-pointer ${
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

          {/* Center: Concise, Compact & Single-Line Desktop Navigation Links (Plots is #1 Priority) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[11px] xl:text-xs font-bold shrink-0 whitespace-nowrap">
            {/* 1. Plots & Land (Top Priority Direct & Dropdown) */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setActiveNavDropdown("plots-menu")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <Link 
                href="/plots"
                className="flex items-center gap-1 px-2 py-1 rounded-lg transition text-[#0c4a3e] bg-emerald-50/90 hover:bg-emerald-100 font-extrabold cursor-pointer whitespace-nowrap border border-emerald-200/80 shadow-2xs"
              >
                <Compass className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>{t("nav.plotsAndLand", "Plots & Land")}</span>
                <span className="bg-[#c59b27] text-slate-950 text-[9px] px-1 py-0.2 rounded font-black tracking-wider">
                  TOP
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-emerald-700 shrink-0" />
              </Link>

              {activeNavDropdown === "plots-menu" && (
                <div className="absolute top-full left-0 pt-1 w-68 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/plots" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Compass className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{t("nav.plotsLand", "DTCP & CMDA Villa Plots")}</span>
                          <span className="bg-emerald-100 text-[#0c4a3e] text-[9px] px-1 py-0.2 rounded font-black">ALL</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">Gated communities & residential sites</span>
                      </div>
                    </Link>
                    <Link 
                      href="/properties?propertyType=AGRICULTURAL_LAND" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <span className="text-sm">🌾</span>
                      <div>
                        <div>Agricultural Farmland & Acres</div>
                        <span className="text-[10px] text-slate-400 font-normal">Borewell & free EB water parcels</span>
                      </div>
                    </Link>
                    <Link 
                      href="/properties?propertyType=COMMERCIAL_PLOT" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <span className="text-sm">🛣️</span>
                      <div>
                        <div>Commercial & Highway Plots</div>
                        <span className="text-[10px] text-slate-400 font-normal">NH frontage & high footfall parcels</span>
                      </div>
                    </Link>
                    <Link 
                      href="/plots?maxPrice=2500000" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <span className="text-sm">⚡</span>
                      <div>
                        <div>Affordable Plots Under ₹25 Lac</div>
                        <span className="text-[10px] text-slate-400 font-normal">Budget-friendly verified sites</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Buyers */}
            <div 
              className="relative shrink-0"
              onMouseEnter={() => setActiveNavDropdown("buyers")}
              onMouseLeave={() => setActiveNavDropdown(null)}
            >
              <button 
                type="button"
                className="flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>{t("nav.buyers", "Buyers")}</span>
                <ChevronDown className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-slate-400 shrink-0" />
              </button>

              {activeNavDropdown === "buyers" && (
                <div className="absolute top-full left-0 pt-1 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/plots" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Compass className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{t("nav.plotsLand", "Plots & Land Parcels")}</span>
                          <span className="bg-[#c59b27] text-slate-950 text-[9px] px-1 py-0.2 rounded font-black">{t("nav.top", "TOP")}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.plotsLandSub", "DTCP & CMDA Approved Sites")}</span>
                      </div>
                    </Link>
                    <Link 
                      href="/buy" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Building2 className="w-4 h-4 text-[#0c4a3e]" />
                      <div>
                        <div>{t("nav.buyResidential", "Buy Residential Properties")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.buyResidentialSub", "Houses, Apartments & Villas")}</span>
                      </div>
                    </Link>
                    <Link 
                      href="/commercial" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <div>
                        <div>{t("nav.commercial", "Commercial Properties")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.commercialSub", "Shops, Offices & Industrial")}</span>
                      </div>
                    </Link>
                    <Link 
                      href="/projects" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div>{t("nav.newProjects", "New Launch Projects")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.newProjectsSub", "Gated communities & townships")}</span>
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
                type="button"
                className="flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>{t("nav.tenants", "Tenants")}</span>
                <ChevronDown className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-slate-400 shrink-0" />
              </button>

              {activeNavDropdown === "tenants" && (
                <div className="absolute top-full left-0 pt-1 w-60 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/rent" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>{t("nav.rentHomes", "Rent Homes & Flats")}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{t("nav.rentHomesSub", "Verified owner listings")}</span>
                    </Link>
                    <Link 
                      href="/commercial?listingType=RENT" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>{t("nav.commercialLease", "Commercial Spaces for Lease")}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{t("nav.commercialLeaseSub", "Showrooms & office spaces")}</span>
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
                type="button"
                className="flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>{t("nav.owners", "Owners")}</span>
                <ChevronDown className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-slate-400 shrink-0" />
              </button>

              {activeNavDropdown === "owners" && (
                <div className="absolute top-full left-0 pt-1 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/post-property" 
                      onClick={(e) => {
                        if (!user) {
                          e.preventDefault();
                          openAuthModal({
                            title: "Login to Post Property FREE",
                            subtitle: "Enter your email to verify with OTP and list your plot or property for 0% brokerage",
                            redirectTo: "/post-property",
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>{t("nav.postPropertyFree", "Post Property FREE")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.postPropertyFreeSub", "Direct buyer enquiries")}</span>
                      </div>
                    </Link>
                    <Link 
                      href="/dashboard/seller" 
                      onClick={(e) => {
                        if (!user) {
                          e.preventDefault();
                          openAuthModal({
                            title: "Seller & Owner Dashboard",
                            subtitle: "Login with Email & OTP to access your seller listings and inquiries",
                            redirectTo: "/dashboard/seller",
                          });
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <Building2 className="w-4 h-4 text-[#0c4a3e]" />
                      <div>
                        <div>{t("nav.ownerDashboard", "Owner / Seller Dashboard")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.ownerDashboardSub", "Manage listings & leads")}</span>
                      </div>
                    </Link>
                    <Link 
                      href="/dashboard/packages" 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div>{t("nav.featuredPlans", "Featured Listing Plans")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.featuredPlansSub", "10x visibility for plots & homes")}</span>
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
                type="button"
                className="flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>{t("nav.builders", "Builders")}</span>
                <ChevronDown className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-slate-400 shrink-0" />
              </button>

              {activeNavDropdown === "dealers" && (
                <div className="absolute top-full left-0 pt-1 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 animate-in fade-in duration-100">
                    <Link 
                      href="/dashboard/seller" 
                      onClick={(e) => {
                        if (!user) {
                          e.preventDefault();
                          openAuthModal({
                            title: "Agent & Broker Portal",
                            subtitle: "Login with Email & OTP to manage multi-listing inventory and developer tools",
                            redirectTo: "/dashboard/seller",
                          });
                        }
                      }}
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>{t("nav.agentPortal", "Agent & Broker Portal")}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{t("nav.agentPortalSub", "Multi-listing inventory tools")}</span>
                    </Link>
                    <Link 
                      href="/projects" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <div>{t("nav.devShowcase", "Developer Showcase")}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{t("nav.devShowcaseSub", "Layout & township promotion")}</span>
                    </Link>
                    <Link 
                      href="/admin/dashboard" 
                      className="block px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition border-t border-slate-100 mt-1 pt-2"
                    >
                      <div>{t("nav.adminDesk", "Admin & Verification Desk")}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{t("nav.adminDeskSub", "Moderation & audit portal")}</span>
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
                type="button"
                className="flex items-center gap-0.5 xl:gap-1 px-1.5 xl:px-2 py-1 rounded-lg transition text-slate-800 hover:text-[#0c4a3e] hover:bg-white/80 cursor-pointer whitespace-nowrap"
              >
                <span>{t("nav.insights", "Insights")}</span>
                <span className="bg-rose-500 text-white text-[7.5px] font-black px-1 py-0.2 rounded-full uppercase tracking-wider">
                  {t("nav.new", "NEW")}
                </span>
                <ChevronDown className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-slate-400 shrink-0" />
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
                        <div>{t("nav.priceTrends", "Coimbatore & TN Price Trends")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.priceTrendsSub", "Locality rates & growth indices")}</span>
                      </div>
                    </Link>
                    <Link 
                      href="/help" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-[#0c4a3e] text-xs font-bold transition"
                    >
                      <FileText className="w-4 h-4 text-[#c59b27]" />
                      <div>
                        <div>{t("nav.pattaGuide", "Patta & Title Verification Guide")}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{t("nav.pattaGuideSub", "TNREGINET & CMDA guidelines")}</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Actions (Language Selector, Post Property FREE, Support Headphone, Saved, User Profile, Hamburger) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Language Selector Dropdown (English / தமிழ்) */}
            <div className="relative shrink-0" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 text-[11px] sm:text-xs font-bold px-1.5 sm:px-2 py-1 rounded-lg transition cursor-pointer bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-2xs whitespace-nowrap"
                title={language === "ta" ? "மொழியைத் தேர்ந்தெடுக்கவும்" : "Select Language"}
                aria-label="Language options"
              >
                <Languages className="w-3.5 h-3.5 shrink-0 text-[#0c4a3e]" />
                <span className="font-semibold">{language === "ta" ? "தமிழ்" : "English"}</span>
                <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                  <div className="px-3 py-1 text-[9.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>{t("nav.language", "Language")}</span>
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-bold">2 Options</span>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("en");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-[#0c4a3e] transition cursor-pointer ${
                        language === "en" ? "font-bold text-[#0c4a3e] bg-emerald-50/80" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${language === "en" ? "bg-emerald-600" : "bg-slate-300"}`} />
                        <span>English</span>
                      </div>
                      {language === "en" && <Check className="w-3.5 h-3.5 text-[#0c4a3e] stroke-[2.5]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("ta");
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-emerald-50 hover:text-[#0c4a3e] transition cursor-pointer ${
                        language === "ta" ? "font-bold text-[#0c4a3e] bg-emerald-50/80" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${language === "ta" ? "bg-emerald-600" : "bg-slate-300"}`} />
                        <span className="font-bold">தமிழ் (Tamil)</span>
                      </div>
                      {language === "ta" && <Check className="w-3.5 h-3.5 text-[#0c4a3e] stroke-[2.5]" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post Property FREE Button */}
            <Link
              href="/post-property"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal({
                    title: "Login to Post Property FREE",
                    subtitle: "Enter your email to verify with OTP and list your plot or property for 0% brokerage",
                    redirectTo: "/post-property",
                  });
                }
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition shadow-2xs cursor-pointer bg-[#0c4a3e] hover:bg-[#072e27] text-white whitespace-nowrap shrink-0"
            >
              <span>{t("nav.postProperty", "Post property")}</span>
              <span className="bg-[#c59b27] text-slate-950 text-[8px] font-black px-1 py-0.2 rounded uppercase tracking-wider">
                {t("nav.free", "FREE")}
              </span>
            </Link>

            {/* Support Desk (Headphone icon) */}
            <div className="relative shrink-0" ref={supportDropdownRef}>
              <button
                type="button"
                onClick={() => setSupportModalOpen(!supportModalOpen)}
                title={t("nav.supportDesk", "Customer Support Desk")}
                className="p-1 sm:p-1.5 rounded-full transition cursor-pointer text-slate-700 hover:text-[#0c4a3e] hover:bg-white/80 shrink-0"
              >
                <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {supportModalOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("nav.supportDesk", "Support Desk")}</span>
                    <button 
                      type="button"
                      onClick={() => setSupportModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">+91 422 2345678</div>
                        <div className="text-[10px] text-slate-400">{t("nav.supportHours", "Mon-Sat, 9:00 AM - 7:00 PM IST")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-[#c59b27] shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">{t("nav.tnTitleHelp", "Tamil Nadu Title Help")}</div>
                        <div className="text-[10px] text-slate-400">{t("nav.pattaEcSupport", "Patta & EC verification support")}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link 
                      href="/help" 
                      onClick={() => setSupportModalOpen(false)}
                      className="text-[#0c4a3e] font-bold hover:underline"
                    >
                      {t("nav.helpCentre", "Help Centre")} →
                    </Link>
                    <Link 
                      href="/about" 
                      onClick={() => setSupportModalOpen(false)}
                      className="text-slate-500 hover:text-slate-700 font-medium"
                    >
                      {t("nav.aboutUs", "About Us")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Properties Icon */}
            <Link
              href="/dashboard/saved"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal({
                    title: "Saved Properties",
                    subtitle: "Enter your email & OTP to view and manage your shortlisted plots and properties",
                    redirectTo: "/dashboard/saved",
                  });
                }
              }}
              title={t("nav.savedProperties", "Saved Properties")}
              className="p-1 sm:p-1.5 rounded-full transition cursor-pointer relative text-slate-700 hover:text-rose-600 hover:bg-white/80 shrink-0"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${savedCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {savedCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[8.5px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Notification Bell with Badge & Dropdown */}
            {user && (
              <div className="relative shrink-0" ref={notifDropdownRef}>
                <button
                  type="button"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  title={t("nav.notifications", "Notifications & Alerts")}
                  className="p-1 sm:p-1.5 rounded-full transition cursor-pointer relative text-slate-700 hover:text-emerald-700 hover:bg-white/80 shrink-0 flex items-center justify-center"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full text-[8.5px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#0c4a3e]" />
                        <span className="text-xs font-bold text-slate-900">{t("nav.notifications", "Notifications")}</span>
                        {unreadNotifCount > 0 && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-[#0c4a3e] px-1.5 py-0.2 rounded-full">
                            {unreadNotifCount} {t("nav.newCount", "new")}
                          </span>
                        )}
                      </div>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] font-semibold text-[#0c4a3e] hover:underline"
                      >
                        {t("nav.viewAll", "View All")}
                      </Link>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {recentNotifs.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          {t("nav.noNotifications", "No notifications yet")}
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
                        {t("nav.openNotificationCenter", "Open Notification Center")} &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login Drawer */}
            {user ? (
              <div className="relative shrink-0" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1 p-1 rounded-xl transition cursor-pointer text-slate-800 hover:bg-white/80 sm:px-2 sm:py-1 sm:bg-white/80 sm:border sm:border-slate-200/80 shadow-2xs whitespace-nowrap"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center font-bold text-[10px] sm:text-xs ring-2 ring-emerald-600/20">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 hidden sm:inline" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t("nav.signedInAs", "Signed in as")} ({user.role})</p>
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
                        {t("nav.userDashboard", "User Dashboard")}
                      </Link>
                      <Link 
                        href="/dashboard/profile" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#0c4a3e]" />
                        {t("nav.myProfile", "My Profile & Settings")}
                      </Link>
                      <Link 
                        href="/dashboard/saved" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        {t("nav.savedProperties", "Saved Properties")} ({savedCount})
                      </Link>
                      <Link 
                        href="/dashboard/enquiries" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        {t("nav.myEnquiries", "My Enquiries")}
                      </Link>
                      {(user.role === "SELLER" || user.role === "AGENT" || user.role === "BUILDER" || user.role === "ADMIN") && (
                        <Link 
                          href="/dashboard/seller" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 hover:text-[#0c4a3e]"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#0c4a3e]" />
                          {t("nav.sellerAgentHub", "Seller & Agent Hub")}
                        </Link>
                      )}
                      {user.role === "ADMIN" && (
                        <Link 
                          href="/admin/dashboard" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-emerald-50 text-[#0c4a3e] font-bold border-t border-slate-100 mt-1 pt-2"
                        >
                          <FolderLock className="w-3.5 h-3.5" />
                          {t("nav.adminDashboard", "Admin Dashboard")}
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-100 px-4 pt-2 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left py-1 text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t("nav.logOut", "Log Out")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    openAuthModal({
                      title: "Welcome to Landora",
                      subtitle: "Enter your email to login or create your account with instant OTP verification",
                    })
                  }
                  className="text-[11px] sm:text-xs font-bold px-2 py-1 rounded-lg transition text-[#0c4a3e] bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t("nav.logIn", "Log In")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openAuthModal({
                      title: "Register on Landora",
                      subtitle: "Enter your email to verify and create your buyer or seller account with instant OTP",
                    })
                  }
                  className="text-[11px] sm:text-xs font-bold px-2 py-1 rounded-lg transition text-slate-700 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap shrink-0 border border-transparent sm:border-slate-200 cursor-pointer"
                >
                  {t("nav.register", "Register")}
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 sm:p-1.5 rounded-lg transition cursor-pointer text-slate-800 hover:bg-white/80 shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white text-slate-800 border-t border-slate-200 px-4 py-4 space-y-3 shadow-2xl mt-2 animate-in fade-in duration-150">
            {/* Mobile Language Selector Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Languages className="w-4 h-4 text-[#0c4a3e]" />
                <span>{t("nav.language", "Language")}:</span>
              </div>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100/80">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    language === "en"
                      ? "bg-white text-[#0c4a3e] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("ta")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                    language === "ta"
                      ? "bg-[#0c4a3e] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500">{t("nav.selectedLocation", "Selected Location")}:</span>
              <span className="text-sm font-black text-[#0c4a3e]">{selectedCity}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/plots"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-[#0c4a3e] flex items-center justify-between col-span-2 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#c59b27]" />
                  <div>
                    <span className="text-sm font-black block">{t("nav.plotsAndLand", "Plots & Land Parcels")}</span>
                    <span className="text-[10px] text-emerald-800 font-normal">DTCP & CMDA Approved Layout Sites</span>
                  </div>
                </div>
                <span className="bg-[#c59b27] text-slate-950 text-[9px] px-2 py-0.5 rounded font-black tracking-wider uppercase">
                  TOP
                </span>
              </Link>
              <Link
                href="/buy"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-[#0c4a3e]" />
                <span>{t("nav.buyProperty", "Buy Property")}</span>
              </Link>
              <Link
                href="/rent"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>{t("nav.rentProperty", "Rent Property")}</span>
              </Link>
              <Link
                href="/commercial"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>{t("nav.commercialShort", "Commercial")}</span>
              </Link>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#c59b27]" />
                <span>{t("nav.newProjects", "New Projects")}</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (!user) {
                    e.preventDefault();
                    openAuthModal({
                      title: "User Dashboard",
                      subtitle: "Enter your email & OTP to access your personalized property dashboard",
                      redirectTo: "/dashboard",
                    });
                  }
                }}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-800 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#0c4a3e]" />
                <span>{t("nav.dashboard", "Dashboard")}</span>
              </Link>
            </div>

            {/* Mobile Auth Profile / Log In Buttons */}
            {user ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t("nav.signedInAs", "Signed in as")} ({user.role})</span>
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
                      {t("nav.adminDashboard", "Admin Desk")} →
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-rose-600 font-bold hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t("nav.logOut", "Log Out")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal({
                      title: "Welcome to Landora",
                      subtitle: "Enter your email to login or create your account with instant OTP verification",
                    });
                  }}
                  className="py-2.5 text-xs font-bold text-center border border-[#0c4a3e] text-[#0c4a3e] rounded-xl hover:bg-emerald-50 transition cursor-pointer"
                >
                  {t("nav.logIn", "Log In")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal({
                      title: "Register on Landora",
                      subtitle: "Enter your email to verify and create your buyer or seller account with instant OTP",
                    });
                  }}
                  className="py-2.5 text-xs font-bold text-center bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition cursor-pointer"
                >
                  {t("nav.register", "Register")}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (!user) {
                  openAuthModal({
                    title: "Login to Post Property FREE",
                    subtitle: "Enter your email to verify with OTP and list your plot or property for 0% brokerage",
                    redirectTo: "/post-property",
                  });
                } else {
                  router.push("/post-property");
                }
              }}
              className="w-full py-2.5 text-sm font-bold text-center bg-[#0c4a3e] text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{t("nav.postProperty", "Post Property")}</span>
              <span className="bg-[#c59b27] text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                {t("nav.free", "FREE")}
              </span>
            </button>
          </div>
        )}
      </header>

      {/* Spacer for non-homepage routes so content is never obscured by the fixed header */}
      {!isHome && <div className="h-14" />}
    </>
  );
}
