"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  ChevronDown, 
  Crosshair, 
  Mic, 
  MapPin, 
  Check, 
  Sparkles,
  Building2,
  Compass,
  Briefcase
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  { id: "plots", label: "Plots & Land Sites", labelTa: "மனைகள் / லேஅவுட் நிலம்", type: "RESIDENTIAL_PLOT" },
  { id: "agri", label: "Agricultural Farmland", labelTa: "விவசாய நிலம்", type: "AGRICULTURAL_LAND" },
  { id: "commercial-plots", label: "Commercial Highway Plots", labelTa: "வணிக நில மனைகள்", type: "COMMERCIAL_PLOT" },
  { id: "all", label: "All Properties", labelTa: "அனைத்து சொத்துகள்", type: "all" },
  { id: "apartments", label: "Flats / Apartments", labelTa: "அடுக்குமாடி குடியிருப்புகள்", type: "APARTMENT" },
  { id: "houses", label: "Independent Houses & Villas", labelTa: "தனி வீடுகள் & வில்லாக்கள்", type: "HOUSE" },
  { id: "commercial", label: "Commercial Buildings", labelTa: "வணிக கட்டிடங்கள்", type: "COMMERCIAL_BUILDING" },
];

const SUGGESTIONS = [
  { city: "Coimbatore", locality: "Peelamedu", tag: "IT & Airport Corridor", tagTa: "IT & விமான நிலைய காரிடார்" },
  { city: "Coimbatore", locality: "Saravanampatti", tag: "Tech Park SEZ", tagTa: "டெக் பார்க் SEZ" },
  { city: "Coimbatore", locality: "Gandhipuram", tag: "City Core Hub", tagTa: "நகர மைய பகுதி" },
  { city: "Chennai", locality: "OMR IT Expressway", tag: "Top Investment", tagTa: "சிறந்த முதலீடு" },
  { city: "Madurai", locality: "Ring Road & Othakadai", tag: "High Growth", tagTa: "விரைவான வளர்ச்சி" },
  { city: "Tiruppur", locality: "Avinashi Highway", tag: "Industrial Corridor", tagTa: "தொழிற்துறை காரிடார்" },
  { city: "Bengaluru", locality: "Whitefield & Electronic City", tag: "Tech Corridor", tagTa: "தொழில்நுட்ப மையம்" },
];

export default function BannerSearchCard() {
  const router = useRouter();
  const { language, t } = useLanguage();

  // Active top tab (Plots/Land is #1 FIRST PRIORITY)
  const [activeTab, setActiveTab] = useState<"plots" | "buy" | "rent" | "new-launch" | "commercial" | "projects">("plots");
  const [selectedCategory, setSelectedCategory] = useState("Plots & Land Sites");
  const [selectedCategoryType, setSelectedCategoryType] = useState("RESIDENTIAL_PLOT");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (tab: "plots" | "buy" | "rent" | "new-launch" | "commercial" | "projects") => {
    setActiveTab(tab);
    if (tab === "plots") {
      setSelectedCategory(language === "ta" ? "மனைகள் / லேஅவுட் நிலம்" : "Plots & Land Sites");
      setSelectedCategoryType("RESIDENTIAL_PLOT");
    } else if (tab === "commercial") {
      setSelectedCategory(language === "ta" ? "வணிகக் கட்டிடங்கள்" : "Commercial Properties");
      setSelectedCategoryType("COMMERCIAL_PLOT");
    } else if (tab === "new-launch" || tab === "projects") {
      setSelectedCategory(language === "ta" ? "புதிய திட்டங்கள்" : "New Projects");
      setSelectedCategoryType("all");
    } else if (tab === "buy") {
      setSelectedCategory(language === "ta" ? "தனி வீடுகள் & வில்லாக்கள்" : "Independent Houses & Villas");
      setSelectedCategoryType("HOUSE");
    } else {
      setSelectedCategory(language === "ta" ? "அனைத்து சொத்துகள்" : "All Properties");
      setSelectedCategoryType("all");
    }
  };

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(language === "ta" ? cat.labelTa : cat.label);
    setSelectedCategoryType(cat.type);
    setCategoryDropdownOpen(false);
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingLocation(false);
          setSearchQuery("Coimbatore");
        },
        () => {
          setIsDetectingLocation(false);
          setSearchQuery("Coimbatore");
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingLocation(false);
      setSearchQuery("Coimbatore");
    }
  };

  const handleVoiceSearch = () => {
    setIsVoiceListening(true);
    // Simulate voice capture
    setTimeout(() => {
      setIsVoiceListening(false);
      setSearchQuery("Peelamedu, Coimbatore");
    }, 1500);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();

    // Map intent tab
    if (activeTab === "rent") {
      params.set("listingType", "RENT");
    } else {
      params.set("listingType", "SALE");
    }

    if (activeTab === "plots") {
      if (selectedCategoryType && selectedCategoryType !== "all") {
        params.set("propertyType", selectedCategoryType);
      } else {
        params.set("propertyType", "RESIDENTIAL_PLOT");
      }
      params.set("listingType", "SALE");
    } else if (activeTab === "commercial") {
      params.set("propertyType", "COMMERCIAL_PLOT");
    } else if (selectedCategoryType !== "all") {
      params.set("propertyType", selectedCategoryType);
    }

    if (activeTab === "new-launch" || activeTab === "projects") {
      router.push(`/projects?city=${encodeURIComponent(searchQuery.trim() || "Coimbatore")}`);
      return;
    }

    if (searchQuery.trim()) {
      params.set("city", searchQuery.trim());
    }

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div 
      ref={containerRef}
      className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-visible text-slate-800"
    >
      {/* TOP ROW: Search Intent Tabs (Plots & Land is #1 Priority) */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 pt-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold whitespace-nowrap">
          {/* Plots & Land - TOP PRIORITY */}
          <button
            type="button"
            onClick={() => handleTabChange("plots")}
            className={`py-3.5 transition-all relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === "plots" 
                ? "text-[#0c4a3e] font-black" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Compass className={`w-4 h-4 ${activeTab === "plots" ? "text-[#c59b27]" : "text-slate-400"}`} />
            <span>{language === "ta" ? "மனைகள் & நிலம்" : "Plots & Land"}</span>
            <span className="bg-[#c59b27] text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider uppercase shadow-2xs">
              TOP
            </span>
            {activeTab === "plots" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0c4a3e] rounded-t-full" />
            )}
          </button>

          {/* Buy Homes */}
          <button
            type="button"
            onClick={() => handleTabChange("buy")}
            className={`py-3.5 transition-all relative cursor-pointer ${
              activeTab === "buy" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{language === "ta" ? "வீடுகள் வாங்க" : "Buy Homes"}</span>
            {activeTab === "buy" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0c4a3e] rounded-t-full" />
            )}
          </button>

          {/* Rent */}
          <button
            type="button"
            onClick={() => handleTabChange("rent")}
            className={`py-3.5 transition-all relative cursor-pointer ${
              activeTab === "rent" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{language === "ta" ? "வாடகைக்கு" : "Rent"}</span>
            {activeTab === "rent" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0c4a3e] rounded-t-full" />
            )}
          </button>

          {/* New Launch (with notification dot) */}
          <button
            type="button"
            onClick={() => handleTabChange("new-launch")}
            className={`py-3.5 transition-all relative cursor-pointer flex items-center gap-1 ${
              activeTab === "new-launch" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{language === "ta" ? "புதிய திட்டங்கள்" : "New Launch"}</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
            {activeTab === "new-launch" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0c4a3e] rounded-t-full" />
            )}
          </button>

          {/* Commercial */}
          <button
            type="button"
            onClick={() => handleTabChange("commercial")}
            className={`py-3.5 transition-all relative cursor-pointer ${
              activeTab === "commercial" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{language === "ta" ? "வணிகம்" : "Commercial"}</span>
            {activeTab === "commercial" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0c4a3e] rounded-t-full" />
            )}
          </button>

          {/* Projects */}
          <button
            type="button"
            onClick={() => handleTabChange("projects")}
            className={`py-3.5 transition-all relative cursor-pointer ${
              activeTab === "projects" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{language === "ta" ? "திட்டங்கள்" : "Layout Projects"}</span>
            {activeTab === "projects" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0c4a3e] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Right side of tab bar: Post Property FREE with divider */}
        <div className="hidden md:flex items-center pl-4 border-l border-slate-200 my-2">
          <Link
            href="/post-property"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0c4a3e] transition py-1"
          >
            <span>{t("nav.postProperty", "Post Property")}</span>
            <span className="bg-[#00875a] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
              {t("nav.free", "FREE")}
            </span>
          </Link>
        </div>
      </div>

      {/* BOTTOM ROW: Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-[#fbfbfa] sm:bg-white rounded-xl sm:rounded-xl border border-slate-200 sm:border-slate-200 p-1.5 sm:p-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition shadow-2xs">
          
          {/* Category Dropdown (e.g. All Residential ⌵) */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setCategoryDropdownOpen(!categoryDropdownOpen);
                setSuggestionsOpen(false);
              }}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-[#0c4a3e] bg-slate-50 sm:bg-transparent rounded-lg transition cursor-pointer"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {language === "ta" ? "சொத்து வகையைத் தேர்ந்தெடுக்கவும்" : "Select Property Type"}
                </div>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>{language === "ta" ? cat.labelTa : cat.label}</span>
                    {selectedCategory === (language === "ta" ? cat.labelTa : cat.label) && (
                      <Check className="w-3.5 h-3.5 text-sky-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vertical Divider (Desktop) */}
          <div className="hidden sm:block w-[1px] h-7 bg-slate-200" />

          {/* Search Input with Autocomplete */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-4.5 h-4.5 text-slate-400 shrink-0 ml-1.5 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              placeholder={language === "ta" ? 'தேடுக "கோவை", "பீளமேடு", "சரவணம்பட்டி", "சென்னை"...' : 'Search "Coimbatore", "Peelamedu", "Saravanampatti", "Chennai"...'}
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 font-medium placeholder-slate-400 py-1.5"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 px-2 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {suggestionsOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100 text-slate-800">
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>{language === "ta" ? "பிரபலமான வளர்ச்சிப் பகுதிகள்" : "Popular Growth Localities"}</span>
                  <span className="text-[10px] text-emerald-600">{language === "ta" ? "விரைவுத் தேர்வு" : "Quick Select"}</span>
                </div>
                <div className="py-1">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={`${item.city}-${item.locality}`}
                      type="button"
                      onClick={() => {
                        setSearchQuery(`${item.locality}, ${item.city}`);
                        setSuggestionsOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-sky-50 flex items-center justify-between text-xs transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <div>
                          <strong className="text-slate-900 font-bold">{item.locality}</strong>
                          <span className="text-slate-400 text-[11px]">, {item.city}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                        {language === "ta" ? item.tagTa : item.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Right Action Icons: GPS Location, Mic Voice, and Blue Search Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0">
            {/* GPS Location Target */}
            <button
              type="button"
              onClick={handleDetectLocation}
              title={language === "ta" ? "எனது இருப்பிடத்தைக் கண்டறி" : "Detect my current location"}
              className="p-2 sm:p-2.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 transition cursor-pointer relative"
            >
              <Crosshair className={`w-4 h-4 ${isDetectingLocation ? "animate-spin text-sky-700" : ""}`} />
            </button>

            {/* Voice Mic Search */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              title={language === "ta" ? "குரல் மூலம் தேடுக" : "Search by voice"}
              className={`p-2 sm:p-2.5 rounded-full transition cursor-pointer ${
                isVoiceListening 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : "bg-sky-50 hover:bg-sky-100 text-sky-600"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Primary Search Button */}
            <button
              type="submit"
              className="bg-[#0c4a3e] hover:bg-[#072e27] text-white font-black text-xs sm:text-sm px-5 sm:px-7 py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{language === "ta" ? "தேடுக" : "Search"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Quick Plot Searches Shortcut Strip */}
      <div className="bg-[#f8fbf9] px-4 sm:px-6 py-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs rounded-b-2xl">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-[#0c4a3e]" />
          <span>{language === "ta" ? "பிரபல மனைகள்:" : "Trending Plots:"}</span>
        </span>
        <button
          type="button"
          onClick={() => router.push("/plots?propertyType=RESIDENTIAL_PLOT")}
          className="text-[11px] font-semibold text-[#0c4a3e] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
        >
          ✓ {language === "ta" ? "DTCP வீட்டு மனைகள்" : "DTCP Villa Plots"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/properties?propertyType=AGRICULTURAL_LAND")}
          className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
        >
          🌾 {language === "ta" ? "விவசாய நிலங்கள்" : "Farmland & Acres"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/properties?propertyType=COMMERCIAL_PLOT")}
          className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
        >
          🛣️ {language === "ta" ? "ஹைவே வணிக மனைகள்" : "Highway Commercial Land"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/plots?maxPrice=2500000")}
          className="text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full transition cursor-pointer"
        >
          ⚡ {language === "ta" ? "₹25 லட்சத்திற்குள் மனைகள்" : "Plots Under ₹25 Lac"}
        </button>
      </div>
    </div>
  );
}
