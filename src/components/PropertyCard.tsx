"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Heart, 
  ArrowRight, 
  UserCheck
} from "lucide-react";
import { PropertyItem } from "@/types";
import { formatIndianCurrency, VERIFICATION_STATUSES } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import Badge from "./ui/Badge";

interface PropertyCardProps {
  property: PropertyItem;
  onToggleSave?: (id: string) => void;
  isSaved?: boolean;
}

export default function PropertyCard({ 
  property, 
  onToggleSave,
  isSaved: propIsSaved 
}: PropertyCardProps) {
  const { user, isSaved: authIsSaved, toggleSaveProperty } = useAuth();
  const isHeartActive = propIsSaved !== undefined ? propIsSaved : authIsSaved(property.id);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Action-based authentication: Require login to save favourites
    if (!user) {
      if (typeof window !== "undefined") {
        const currentUrl = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}&action=save&targetId=${property.id}`;
      }
      return;
    }

    if (onToggleSave) {
      onToggleSave(property.id);
    } else {
      await toggleSaveProperty(property.id);
    }
  };

  const primaryImage = property.images?.find(i => i.isPrimary) || property.images?.[0] || {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop"
  };

  const verificationConfig = VERIFICATION_STATUSES[property.verificationStatus] || VERIFICATION_STATUSES.UNREVIEWED;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8e4] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0c4a3e]/50 transition-all duration-300 flex flex-col group">
      {/* Property Visual Card Header */}
      <div className="relative h-52 bg-slate-900 overflow-hidden">
        {/* Subtle dark gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-10" />

        <div 
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url('${primaryImage.url}')` }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
          {property.isFeatured && (
            <Badge variant="gold" size="sm">
              FEATURED
            </Badge>
          )}

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border ${verificationConfig.badgeColor}`}>
            {verificationConfig.label}
          </span>
        </div>

        {/* Save / Favourite Heart Button */}
        <button
          onClick={handleSaveClick}
          title={isHeartActive ? "Remove from Saved" : "Save Property"}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition cursor-pointer ${
            isHeartActive 
              ? "bg-rose-50 text-rose-600 shadow-sm" 
              : "bg-black/40 hover:bg-black/60 text-white"
          }`}
          aria-label="Save property"
        >
          <Heart className={`w-4 h-4 ${isHeartActive ? "fill-rose-600 text-rose-600" : ""}`} />
        </button>

        {/* Price & Area Overlay at Bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between text-white">
          <div>
            <span className="text-[11px] font-medium text-emerald-200">
              {property.area} {property.areaUnit}
              {property.builtUpArea ? ` (${property.builtUpArea} sq.ft built-up)` : ""}
            </span>
            <p className="text-xl sm:text-2xl font-black drop-shadow-sm tracking-tight text-white">
              {formatIndianCurrency(property.price)}
            </p>
          </div>
          <span className="text-[11px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white">
            {property.pricePerUnit}
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/properties/${property.slug}`}>
            <h3 className="font-bold text-[#132a24] text-sm sm:text-base leading-snug line-clamp-2 hover:text-[#0c4a3e] transition">
              {property.title}
            </h3>
          </Link>

          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#0c4a3e] shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </p>

          {/* Quick Specifications */}
          <div className="mt-3 py-2 border-y border-[#f1f4f2] grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Property Type</span>
              <span className="font-semibold text-slate-800 truncate block">
                {property.propertyType.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Approval Status</span>
              <span className="font-semibold text-slate-800 truncate block">
                {property.approvalStatus || "Seller Declared"}
              </span>
            </div>
          </div>

          {/* Seller Information */}
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-[#0c4a3e]" />
              <span className="font-medium truncate max-w-[140px]">{property.sellerName}</span>
            </div>
            <span className="text-[10px] font-bold text-[#0c4a3e] bg-emerald-50 px-2 py-0.5 rounded">
              {property.sellerType}
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 pt-3 border-t border-[#f1f4f2] flex items-center gap-2">
          <Link
            href={`/properties/${property.slug}`}
            className="flex-1 bg-[#0c4a3e] hover:bg-[#072e27] text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/properties/${property.slug}#enquire`}
            className="border border-[#0c4a3e] text-[#0c4a3e] hover:bg-emerald-50 py-2 px-3 rounded-xl text-xs font-bold transition"
          >
            Enquire
          </Link>
        </div>
      </div>
    </div>
  );
}
