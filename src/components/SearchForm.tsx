"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Compass, Building2, Briefcase, ChevronRight, SlidersHorizontal } from "lucide-react";
import { PROPERTY_CATEGORIES } from "@/lib/constants";
import Button from "./ui/Button";

export default function SearchForm() {
  const router = useRouter();

  // Active intent tab
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "plots" | "commercial">("plots");

  // Form states
  const [cityLocality, setCityLocality] = useState("Coimbatore");
  const [propertyCategory, setPropertyCategory] = useState("all");
  const [budgetRange, setBudgetRange] = useState("all");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Map intent tab
    if (activeTab === "plots") {
      params.set("propertyType", "RESIDENTIAL_PLOT");
      params.set("listingType", "SALE");
    } else if (activeTab === "commercial") {
      params.set("propertyType", "COMMERCIAL_PLOT");
      params.set("listingType", "SALE");
    } else if (activeTab === "buy") {
      params.set("listingType", "SALE");
      if (propertyCategory !== "all") params.set("propertyType", propertyCategory);
    } else if (activeTab === "rent") {
      params.set("listingType", "RENT");
      if (propertyCategory !== "all") params.set("propertyType", propertyCategory);
    }

    // City / locality
    if (cityLocality.trim()) {
      params.set("city", cityLocality.trim());
    }

    // Budget range
    if (budgetRange === "under-30l") {
      params.set("maxPrice", "3000000");
    } else if (budgetRange === "30l-75l") {
      params.set("minPrice", "3000000");
      params.set("maxPrice", "7500000");
    } else if (budgetRange === "75l-1.5cr") {
      params.set("minPrice", "7500000");
      params.set("maxPrice", "15000000");
    } else if (budgetRange === "above-1.5cr") {
      params.set("minPrice", "15000000");
    }

    // Area
    if (minArea) params.set("minArea", minArea);
    if (maxArea) params.set("maxArea", maxArea);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 text-[#132a24] border border-[#e2e8e4]">
      {/* Search Intent Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab("plots");
            setPropertyCategory("RESIDENTIAL_PLOT");
          }}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "plots"
              ? "bg-[#0c4a3e] text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-[#0c4a3e]"
          }`}
        >
          <Compass className="w-4 h-4 text-[#c59b27]" />
          <span>Plots / Land</span>
          <span className="bg-[#c59b27] text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-black">
            TOP
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("buy");
            setPropertyCategory("all");
          }}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "buy"
              ? "bg-[#0c4a3e] text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-[#0c4a3e]"
          }`}
        >
          <Building2 className="w-4 h-4 text-[#c59b27]" />
          <span>Buy Property</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("rent");
            setPropertyCategory("all");
          }}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "rent"
              ? "bg-[#0c4a3e] text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-[#0c4a3e]"
          }`}
        >
          <span>Rent Property</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("commercial");
            setPropertyCategory("COMMERCIAL_PLOT");
          }}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === "commercial"
              ? "bg-[#0c4a3e] text-white shadow-xs"
              : "text-slate-600 hover:bg-emerald-50 hover:text-[#0c4a3e]"
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#c59b27]" />
          <span>Commercial</span>
        </button>
      </div>

      {/* Main Search Fields Form */}
      <form onSubmit={handleSearchSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* City / Locality Input */}
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              City or Locality
            </label>
            <div className="flex items-center bg-[#fbfbfa] border border-[#e2e8e4] hover:border-[#0c4a3e]/40 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#0c4a3e] focus-within:bg-white transition">
              <MapPin className="w-4 h-4 text-[#0c4a3e] mr-2 shrink-0" />
              <input
                type="text"
                value={cityLocality}
                onChange={(e) => setCityLocality(e.target.value)}
                placeholder="e.g. Peelamedu, Coimbatore or OMR Chennai"
                className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder-slate-400 font-medium"
              />
              {cityLocality && (
                <button 
                  type="button" 
                  onClick={() => setCityLocality("")} 
                  className="text-slate-400 hover:text-slate-700 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Property Category */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Property Category
            </label>
            <div className="relative">
              <select
                value={propertyCategory}
                onChange={(e) => setPropertyCategory(e.target.value)}
                className="w-full text-xs sm:text-sm bg-[#fbfbfa] border border-[#e2e8e4] hover:border-[#0c4a3e]/40 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-[#0c4a3e] text-slate-800 font-semibold cursor-pointer transition appearance-none"
              >
                <option value="all">All Categories</option>
                {PROPERTY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.type}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Budget Range
            </label>
            <div className="relative">
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full text-xs sm:text-sm bg-[#fbfbfa] border border-[#e2e8e4] hover:border-[#0c4a3e]/40 rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-[#0c4a3e] text-slate-800 font-semibold cursor-pointer transition appearance-none"
              >
                <option value="all">Any Budget</option>
                <option value="under-30l">Under ₹30 Lac</option>
                <option value="30l-75l">₹30 Lac - ₹75 Lac</option>
                <option value="75l-1.5cr">₹75 Lac - ₹1.5 Cr</option>
                <option value="above-1.5cr">Above ₹1.5 Cr</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full bg-[#0c4a3e] hover:bg-[#072e27] text-white py-3 px-4 rounded-xl font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-5 border border-[#c59b27]/30"
            >
              <Search className="w-4 h-4 text-[#c59b27]" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Advanced Area Filter Toggle */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 font-semibold text-[#0c4a3e] hover:underline cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvanced ? "Hide Area Filters" : "Filter by Plot / Built-up Area"}</span>
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-3 pt-3 border-t border-[#f1f4f2] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Min Area (Sq.Ft)</label>
              <input
                type="number"
                placeholder="e.g. 1200"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                className="w-full bg-[#fbfbfa] border border-[#e2e8e4] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0c4a3e]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Max Area (Sq.Ft)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                className="w-full bg-[#fbfbfa] border border-[#e2e8e4] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0c4a3e]"
              />
            </div>
          </div>
        )}

        {/* Popular Location Shortcuts */}
        <div className="mt-4 pt-3 border-t border-[#f1f4f2] flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-slate-500">Popular Locations:</span>
          {["Coimbatore", "Peelamedu", "Saravanampatti", "Gandhipuram", "Chennai", "Bengaluru", "Madurai"].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                setCityLocality(loc);
                router.push(`/properties?city=${encodeURIComponent(loc)}`);
              }}
              className="bg-[#f1f4f2] hover:bg-emerald-50 hover:text-[#0c4a3e] text-slate-700 px-2.5 py-1 rounded-md border border-[#e2e8e4] transition font-medium cursor-pointer"
            >
              {loc}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
