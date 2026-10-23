"use client";

import { useState, useEffect } from "react";
import { 
  SlidersHorizontal, 
  MapPin, 
  IndianRupee, 
  Maximize2, 
  Home, 
  Building, 
  UserCheck, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  PROPERTY_CATEGORIES, 
  POPULAR_LOCATIONS, 
  AREA_UNITS, 
  FURNISHING_OPTIONS, 
  BEDROOM_OPTIONS, 
  SELLER_TYPE_OPTIONS 
} from "@/lib/constants";
import { ListingType, PropertyCategoryType, FurnishingStatus } from "@/types";

export interface FilterState {
  city: string;
  propertyType: string;
  listingType: ListingType;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  areaUnit: string;
  bedrooms: string;
  furnishing: string;
  sellerType: string;
  verifiedOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onClear: () => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
  totalResultsCount?: number;
}

export default function FilterSidebar({
  filters,
  onChange,
  onClear,
  isMobileDrawer = false,
  onCloseMobile,
  totalResultsCount,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state if parent filters change externally (e.g. from URL or chips)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateField = (field: keyof FilterState, value: any) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);

    // Instant update for desktop, or validate
    validateAndUpdate(updated);
  };

  const validateAndUpdate = (state: FilterState) => {
    // Validate minPrice <= maxPrice
    if (state.minPrice && state.maxPrice && Number(state.minPrice) > Number(state.maxPrice)) {
      setValidationError("Min budget cannot exceed Max budget");
      return;
    }
    // Validate minArea <= maxArea
    if (state.minArea && state.maxArea && Number(state.minArea) > Number(state.maxArea)) {
      setValidationError("Min area cannot exceed Max area");
      return;
    }
    setValidationError(null);
    onChange(state);
  };

  const isResidential = ["HOUSE", "APARTMENT", "VILLA", "all"].includes(localFilters.propertyType);

  return (
    <div className={`bg-white rounded-2xl border border-[#e2e8e4] p-5 shadow-xs space-y-6 ${isMobileDrawer ? "border-none shadow-none p-0" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f4f2]">
        <h3 className="font-black text-sm text-[#132a24] uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-[#0c4a3e]" />
          <span>Filters</span>
        </h3>

        <button
          onClick={onClear}
          className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition cursor-pointer hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* 1. Listing Intent (Buy vs Rent) */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Listing Intent
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateField("listingType", "SALE")}
            className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1 ${
              localFilters.listingType === "SALE"
                ? "bg-[#0c4a3e] text-white border-[#0c4a3e] shadow-xs"
                : "bg-[#fbfbfa] text-slate-700 border-[#e2e8e4] hover:bg-slate-50"
            }`}
          >
            <span>Buy / Sale</span>
          </button>
          <button
            type="button"
            onClick={() => updateField("listingType", "RENT")}
            className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1 ${
              localFilters.listingType === "RENT"
                ? "bg-[#0c4a3e] text-white border-[#0c4a3e] shadow-xs"
                : "bg-[#fbfbfa] text-slate-700 border-[#e2e8e4] hover:bg-slate-50"
            }`}
          >
            <span>Rent / Lease</span>
          </button>
        </div>
      </div>

      {/* 2. City & Locality Filter */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          City or Locality
        </label>
        <div className="relative mb-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="e.g. Coimbatore, Peelamedu"
            value={localFilters.city}
            onChange={(e) => updateField("city", e.target.value)}
            className="w-full bg-[#fbfbfa] text-xs font-medium rounded-xl border border-[#e2e8e4] pl-8 pr-3 py-2 outline-none focus:border-[#0c4a3e] focus:bg-white"
          />
        </div>
        {/* Quick location chips */}
        <div className="flex flex-wrap gap-1">
          {["Coimbatore", "Peelamedu", "Saravanampatti", "Chennai", "Madurai", "Tiruppur", "Bengaluru"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => updateField("city", localFilters.city === c ? "" : c)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer ${
                localFilters.city.toLowerCase() === c.toLowerCase()
                  ? "bg-emerald-100 text-[#0c4a3e] border-[#0c4a3e]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Property Category */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Property Category
        </label>
        <select
          value={localFilters.propertyType}
          onChange={(e) => updateField("propertyType", e.target.value)}
          className="w-full bg-[#fbfbfa] text-xs font-semibold rounded-xl border border-[#e2e8e4] px-3 py-2 outline-none focus:border-[#0c4a3e] cursor-pointer"
        >
          <option value="all">All Categories (8 Types)</option>
          {PROPERTY_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.type}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Budget Range */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
          <span>Budget Range</span>
          <span className="text-[10px] text-slate-400 font-normal">INR (₹)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Min Price</span>
            <input
              type="number"
              placeholder={localFilters.listingType === "RENT" ? "₹10,000" : "₹20,00,000"}
              value={localFilters.minPrice}
              onChange={(e) => updateField("minPrice", e.target.value)}
              className="w-full bg-[#fbfbfa] text-xs font-medium rounded-xl border border-[#e2e8e4] px-2.5 py-1.5 outline-none focus:border-[#0c4a3e]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Max Price</span>
            <input
              type="number"
              placeholder={localFilters.listingType === "RENT" ? "₹1,00,000" : "₹1,50,00,000"}
              value={localFilters.maxPrice}
              onChange={(e) => updateField("maxPrice", e.target.value)}
              className="w-full bg-[#fbfbfa] text-xs font-medium rounded-xl border border-[#e2e8e4] px-2.5 py-1.5 outline-none focus:border-[#0c4a3e]"
            />
          </div>
        </div>
        {/* Quick presets */}
        <div className="flex flex-wrap gap-1 mt-2">
          {localFilters.listingType === "SALE" ? (
            <>
              <button
                type="button"
                onClick={() => { updateField("minPrice", ""); updateField("maxPrice", "5000000"); }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                &lt; ₹50 Lac
              </button>
              <button
                type="button"
                onClick={() => { updateField("minPrice", "5000000"); updateField("maxPrice", "10000000"); }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                ₹50L - ₹1 Cr
              </button>
              <button
                type="button"
                onClick={() => { updateField("minPrice", "10000000"); updateField("maxPrice", ""); }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                &gt; ₹1 Cr
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { updateField("minPrice", ""); updateField("maxPrice", "25000"); }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                &lt; ₹25,000
              </button>
              <button
                type="button"
                onClick={() => { updateField("minPrice", "25000"); updateField("maxPrice", "50000"); }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                ₹25k - ₹50k
              </button>
              <button
                type="button"
                onClick={() => { updateField("minPrice", "50000"); updateField("maxPrice", ""); }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                &gt; ₹50,000
              </button>
            </>
          )}
        </div>
      </div>

      {/* 5. Land Area & Units */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
          <span>Land / Built Area</span>
        </label>
        {/* Area Unit Picker */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          {[
            { value: "sqft", label: "Sq.Ft" },
            { value: "cent", label: "Cents" },
            { value: "sqyd", label: "Sq.Yds" },
            { value: "acre", label: "Acres" },
          ].map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => updateField("areaUnit", u.value)}
              className={`py-1 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                localFilters.areaUnit === u.value
                  ? "bg-[#0c4a3e] text-white border-[#0c4a3e]"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400">Min Area</span>
            <input
              type="number"
              placeholder={localFilters.areaUnit === "cent" ? "3" : localFilters.areaUnit === "acre" ? "1" : "1200"}
              value={localFilters.minArea}
              onChange={(e) => updateField("minArea", e.target.value)}
              className="w-full bg-[#fbfbfa] text-xs font-medium rounded-xl border border-[#e2e8e4] px-2.5 py-1.5 outline-none focus:border-[#0c4a3e]"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Max Area</span>
            <input
              type="number"
              placeholder={localFilters.areaUnit === "cent" ? "15" : localFilters.areaUnit === "acre" ? "10" : "5000"}
              value={localFilters.maxArea}
              onChange={(e) => updateField("maxArea", e.target.value)}
              className="w-full bg-[#fbfbfa] text-xs font-medium rounded-xl border border-[#e2e8e4] px-2.5 py-1.5 outline-none focus:border-[#0c4a3e]"
            />
          </div>
        </div>
      </div>

      {/* 6. Residential Options: Bedrooms & Furnishing (Applicable to House, Apartment, Villa) */}
      {isResidential && (
        <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Bedrooms (BHK)
            </label>
            <div className="grid grid-cols-5 gap-1">
              {BEDROOM_OPTIONS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => updateField("bedrooms", localFilters.bedrooms === b.value ? "all" : b.value)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                    localFilters.bedrooms === b.value
                      ? "bg-[#0c4a3e] text-white border-[#0c4a3e]"
                      : "bg-[#fbfbfa] border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Furnishing Status
            </label>
            <select
              value={localFilters.furnishing}
              onChange={(e) => updateField("furnishing", e.target.value)}
              className="w-full bg-[#fbfbfa] text-xs font-semibold rounded-xl border border-[#e2e8e4] px-3 py-2 outline-none focus:border-[#0c4a3e] cursor-pointer"
            >
              {FURNISHING_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 7. Seller Type */}
      <div className="pt-3 border-t border-slate-100">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Listed By / Seller Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {SELLER_TYPE_OPTIONS.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => updateField("sellerType", st.value)}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                localFilters.sellerType === st.value
                  ? "bg-[#0c4a3e] text-white border-[#0c4a3e]"
                  : "bg-[#fbfbfa] border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 8. Verification Toggle */}
      <div className="pt-3 border-t border-slate-100">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Verified Properties Only</span>
              <span className="text-[10px] text-slate-500">Only revenue/contact verified records</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localFilters.verifiedOnly}
            onChange={(e) => updateField("verifiedOnly", e.target.checked)}
            className="w-4 h-4 rounded text-[#0c4a3e] focus:ring-[#0c4a3e] cursor-pointer"
          />
        </label>
      </div>

      {/* Mobile Drawer Action Bar */}
      {isMobileDrawer && (
        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-200 flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 py-3 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex-2 py-3 text-xs font-bold text-white bg-[#0c4a3e] rounded-xl hover:bg-[#072e27] transition shadow-md"
          >
            Show {totalResultsCount ?? "Matching"} Properties
          </button>
        </div>
      )}
    </div>
  );
}
