"use client";

import { X } from "lucide-react";
import { formatIndianCurrency } from "@/lib/constants";
import { ListingType, PropertyCategoryType, FurnishingStatus } from "@/types";

interface ActiveFilterChipsProps {
  city?: string;
  propertyType?: string;
  categories?: PropertyCategoryType[];
  listingType?: ListingType;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  areaUnit?: string;
  bedrooms?: string;
  furnishing?: string;
  sellerType?: string;
  verifiedOnly?: boolean;
  onRemove: (filterKey: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilterChips({
  city,
  propertyType,
  categories,
  listingType,
  minPrice,
  maxPrice,
  minArea,
  maxArea,
  areaUnit = "sqft",
  bedrooms,
  furnishing,
  sellerType,
  verifiedOnly,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips: { key: string; label: string }[] = [];

  if (city) {
    chips.push({ key: "city", label: `Location: ${city}` });
  }

  if (propertyType && propertyType !== "all") {
    chips.push({ key: "propertyType", label: `Type: ${propertyType.replace(/_/g, " ")}` });
  }

  if (categories && categories.length > 0 && (!propertyType || propertyType === "all")) {
    chips.push({ key: "categories", label: `Category: ${categories.length} Selected` });
  }

  if (listingType) {
    chips.push({ key: "listingType", label: listingType === "SALE" ? "For Sale" : "For Rent" });
  }

  if (minPrice || maxPrice) {
    const minStr = minPrice ? formatIndianCurrency(Number(minPrice)) : "₹0";
    const maxStr = maxPrice ? formatIndianCurrency(Number(maxPrice)) : "Any";
    chips.push({ key: "price", label: `Budget: ${minStr} - ${maxStr}` });
  }

  if (minArea || maxArea) {
    const unitLabel = areaUnit === "cent" ? "Cents" : areaUnit === "acre" ? "Acres" : areaUnit === "sqyd" ? "Sq.Yd" : "Sq.Ft";
    const minStr = minArea ? `${minArea} ` : "0 ";
    const maxStr = maxArea ? `${maxArea} ` : "Max ";
    chips.push({ key: "area", label: `Area: ${minStr}- ${maxStr}${unitLabel}` });
  }

  if (bedrooms && bedrooms !== "all") {
    chips.push({ key: "bedrooms", label: `${bedrooms} BHK` });
  }

  if (furnishing && furnishing !== "all") {
    chips.push({ key: "furnishing", label: furnishing });
  }

  if (sellerType && sellerType !== "all") {
    const sellerLabels: Record<string, string> = {
      OWNER: "Owner Listed",
      AGENT: "Agent Listed",
      BUILDER: "Builder Project",
    };
    chips.push({ key: "sellerType", label: sellerLabels[sellerType] || sellerType });
  }

  if (verifiedOnly) {
    chips.push({ key: "verifiedOnly", label: "Verified Only" });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2.5">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Active Filters ({chips.length}):
      </span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#0c4a3e] border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs animate-in fade-in"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemove(chip.key)}
            className="text-emerald-700 hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-emerald-100"
            title={`Remove ${chip.label}`}
            aria-label={`Remove ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline px-2 py-0.5 transition cursor-pointer ml-1"
      >
        Clear All
      </button>
    </div>
  );
}
