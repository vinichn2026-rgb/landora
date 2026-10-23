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

const CATEGORIES = [
  { id: "all", label: "All Residential", type: "all" },
  { id: "plots", label: "Plots / Land", type: "RESIDENTIAL_PLOT" },
  { id: "apartments", label: "Flats / Apartments", type: "APARTMENT" },
  { id: "houses", label: "Independent Houses & Villas", type: "HOUSE" },
  { id: "commercial", label: "Commercial Properties", type: "COMMERCIAL_PLOT" },
  { id: "agri", label: "Agricultural Land", type: "AGRICULTURAL_LAND" },
];

const SUGGESTIONS = [
  { city: "Coimbatore", locality: "Peelamedu", tag: "IT & Airport Corridor" },
  { city: "Coimbatore", locality: "Saravanampatti", tag: "Tech Park SEZ" },
  { city: "Coimbatore", locality: "Gandhipuram", tag: "City Core Hub" },
  { city: "Chennai", locality: "OMR IT Expressway", tag: "Top Investment" },
  { city: "Madurai", locality: "Ring Road & Othakadai", tag: "High Growth" },
  { city: "Tiruppur", locality: "Avinashi Highway", tag: "Industrial Corridor" },
  { city: "Bengaluru", locality: "Whitefield & Electronic City", tag: "Tech Corridor" },
];

export default function BannerSearchCard() {
  const router = useRouter();

  // Active top tab (Buy, Rent, New Launch, Commercial, Plots/Land, Projects)
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "new-launch" | "commercial" | "plots" | "projects">("buy");
  const [selectedCategory, setSelectedCategory] = useState("All Residential");
  const [selectedCategoryType, setSelectedCategoryType] = useState("all");
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

  const handleTabChange = (tab: "buy" | "rent" | "new-launch" | "commercial" | "plots" | "projects") => {
    setActiveTab(tab);
    if (tab === "plots") {
      setSelectedCategory("Plots / Land");
      setSelectedCategoryType("RESIDENTIAL_PLOT");
    } else if (tab === "commercial") {
      setSelectedCategory("Commercial Properties");
      setSelectedCategoryType("COMMERCIAL_PLOT");
    } else if (tab === "new-launch" || tab === "projects") {
      setSelectedCategory("New Projects");
      setSelectedCategoryType("all");
    } else {
      setSelectedCategory("All Residential");
      setSelectedCategoryType("all");
    }
  };

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat.label);
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
      params.set("propertyType", "RESIDENTIAL_PLOT");
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
      {/* TOP ROW: Search Intent Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 pt-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm font-bold whitespace-nowrap">
          {/* Buy */}
          <button
            type="button"
            onClick={() => handleTabChange("buy")}
            className={`py-3.5 transition-all relative cursor-pointer ${
              activeTab === "buy" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Buy</span>
            {activeTab === "buy" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0066cc] rounded-t-full" />
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
            <span>Rent</span>
            {activeTab === "rent" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0066cc] rounded-t-full" />
            )}
          </button>

          {/* New Launch (with red notification dot) */}
          <button
            type="button"
            onClick={() => handleTabChange("new-launch")}
            className={`py-3.5 transition-all relative cursor-pointer flex items-center gap-1 ${
              activeTab === "new-launch" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>New Launch</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
            {activeTab === "new-launch" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0066cc] rounded-t-full" />
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
            <span>Commercial</span>
            {activeTab === "commercial" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0066cc] rounded-t-full" />
            )}
          </button>

          {/* Plots/Land */}
          <button
            type="button"
            onClick={() => handleTabChange("plots")}
            className={`py-3.5 transition-all relative cursor-pointer flex items-center gap-1 ${
              activeTab === "plots" 
                ? "text-slate-900 font-extrabold" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Plots/Land</span>
            {activeTab === "plots" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0066cc] rounded-t-full" />
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
            <span>Projects</span>
            {activeTab === "projects" && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0066cc] rounded-t-full" />
            )}
          </button>
        </div>

        {/* Right side of tab bar: Post Property FREE with divider */}
        <div className="hidden md:flex items-center pl-4 border-l border-slate-200 my-2">
          <Link
            href="/post-property"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#0c4a3e] transition py-1"
          >
            <span>Post Property</span>
            <span className="bg-[#00875a] text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
              FREE
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
                  Select Property Type
                </div>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition cursor-pointer"
                  >
                    <span>{cat.label}</span>
                    {selectedCategory === cat.label && (
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
              placeholder='Search "Coimbatore", "Peelamedu", "Saravanampatti", "Chennai"...'
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-800 font-medium placeholder-slate-400 py-1.5"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600 px-2 text-xs"
              >
                ✕
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {suggestionsOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100 text-slate-800">
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Popular Growth Localities</span>
                  <span className="text-[10px] text-emerald-600">Quick Select</span>
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
                        {item.tag}
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
              title="Detect my current location"
              className="p-2 sm:p-2.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-600 transition cursor-pointer relative"
            >
              <Crosshair className={`w-4 h-4 ${isDetectingLocation ? "animate-spin text-sky-700" : ""}`} />
            </button>

            {/* Voice Mic Search */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              title="Search by voice"
              className={`p-2 sm:p-2.5 rounded-full transition cursor-pointer ${
                isVoiceListening 
                  ? "bg-rose-500 text-white animate-pulse" 
                  : "bg-sky-50 hover:bg-sky-100 text-sky-600"
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Primary Search Button (Blue 99acres style) */}
            <button
              type="submit"
              className="bg-[#0066cc] hover:bg-[#0052a3] text-white font-black text-xs sm:text-sm px-5 sm:px-7 py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Search</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
