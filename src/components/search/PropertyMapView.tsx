"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Navigation, ExternalLink, X, Compass, ShieldCheck } from "lucide-react";
import { PropertyItem } from "@/types";
import { formatIndianCurrency } from "@/lib/constants";

interface PropertyMapViewProps {
  properties: PropertyItem[];
  selectedCity?: string;
}

export default function PropertyMapView({
  properties,
  selectedCity,
}: PropertyMapViewProps) {
  const [activeProperty, setActiveProperty] = useState<PropertyItem | null>(
    properties[0] || null
  );

  // Focus clusters
  const clusters = [
    { name: "Coimbatore", count: properties.filter(p => p.city.toLowerCase().includes("coimbatore")).length },
    { name: "Chennai", count: properties.filter(p => p.city.toLowerCase().includes("chennai")).length },
    { name: "Madurai", count: properties.filter(p => p.city.toLowerCase().includes("madurai")).length },
    { name: "Tiruppur", count: properties.filter(p => p.city.toLowerCase().includes("tiruppur")).length },
    { name: "Bengaluru", count: properties.filter(p => p.city.toLowerCase().includes("bengaluru")).length },
  ].filter(c => c.count > 0);

  return (
    <div className="relative w-full h-[640px] bg-slate-900 rounded-2xl overflow-hidden border border-[#e2e8e4] shadow-sm flex flex-col">
      {/* Top Map Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 pointer-events-auto text-xs">
          <Navigation className="w-4 h-4 text-[#0c4a3e]" />
          <span className="font-bold text-slate-800">
            Interactive Property Radar ({properties.length} Mapped Listings)
          </span>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
          {clusters.map((c) => (
            <span
              key={c.name}
              className="bg-white/10 text-white font-medium px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1"
            >
              <span>{c.name}</span>
              <span className="bg-[#c59b27] text-slate-950 font-black rounded-full px-1 text-[9px]">{c.count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Styled Interactive Canvas / Map Representation */}
      <div className="relative flex-1 bg-gradient-to-b from-[#0f231e] via-[#091815] to-[#040e0c] overflow-hidden flex items-center justify-center p-6">
        {/* Geographic Grid Lines & Subtle Map Graphic */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#c59b27_1px,transparent_1px),linear-gradient(to_bottom,#c59b27_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,74,62,0.4)_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

        {/* Region Labels */}
        <div className="absolute top-16 left-12 text-[10px] font-black uppercase text-emerald-400/40 tracking-widest pointer-events-none">
          Karnataka / Bengaluru Corridor
        </div>
        <div className="absolute top-28 right-16 text-[10px] font-black uppercase text-emerald-400/40 tracking-widest pointer-events-none">
          Chennai & Northern Corridors
        </div>
        <div className="absolute bottom-20 left-16 text-[10px] font-black uppercase text-emerald-400/40 tracking-widest pointer-events-none">
          Coimbatore / Western Tamil Nadu
        </div>
        <div className="absolute bottom-14 right-24 text-[10px] font-black uppercase text-emerald-400/40 tracking-widest pointer-events-none">
          Madurai & Southern TN
        </div>

        {/* Property Pins Placed Proportionally */}
        <div className="relative w-full max-w-4xl h-[480px]">
          {properties.map((p, idx) => {
            // Position mapping based on city & locality
            let topPercent = 50;
            let leftPercent = 50;

            const cityLower = p.city.toLowerCase();
            const locLower = p.locality.toLowerCase();

            if (cityLower.includes("bengaluru")) {
              topPercent = 20 + (idx % 2) * 8;
              leftPercent = 24 + (idx % 3) * 6;
            } else if (cityLower.includes("chennai")) {
              topPercent = 24 + (idx % 3) * 6;
              leftPercent = 70 + (idx % 2) * 8;
            } else if (cityLower.includes("coimbatore")) {
              if (locLower.includes("peelamedu")) {
                topPercent = 60;
                leftPercent = 38;
              } else if (locLower.includes("saravanampatti")) {
                topPercent = 55;
                leftPercent = 40;
              } else if (locLower.includes("gandhipuram") || locLower.includes("rs puram")) {
                topPercent = 63;
                leftPercent = 35;
              } else if (locLower.includes("pollachi")) {
                topPercent = 74;
                leftPercent = 33;
              } else {
                topPercent = 62 + (idx % 3) * 4;
                leftPercent = 36 + (idx % 2) * 5;
              }
            } else if (cityLower.includes("tiruppur")) {
              topPercent = 61;
              leftPercent = 48;
            } else if (cityLower.includes("madurai")) {
              topPercent = 78 + (idx % 2) * 5;
              leftPercent = 65 + (idx % 2) * 6;
            } else {
              topPercent = 45 + (idx * 4) % 35;
              leftPercent = 30 + (idx * 5) % 40;
            }

            const isSelected = activeProperty?.id === p.id;

            return (
              <div
                key={p.id}
                style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-200"
              >
                <button
                  onClick={() => setActiveProperty(p)}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black shadow-lg transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#c59b27] text-slate-950 ring-4 ring-[#dfb33d]/40 scale-110 z-30"
                      : "bg-[#0c4a3e] text-white hover:bg-emerald-600 border border-emerald-400/40"
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? "text-slate-950" : "text-[#dfb33d]"}`} />
                  <span>{formatIndianCurrency(p.price)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Selected Property Card Drawer */}
      {activeProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {activeProperty.propertyType.replace(/_/g, " ")} • {activeProperty.listingType === "SALE" ? "For Sale" : "For Rent"}
            </span>
            <button
              onClick={() => setActiveProperty(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${activeProperty.images[0]?.url || ""}')` }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-base font-black text-[#0c4a3e]">
                {formatIndianCurrency(activeProperty.price)}
                {activeProperty.listingType === "RENT" && <span className="text-xs text-slate-500 font-normal"> / mo</span>}
              </div>
              <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5" title={activeProperty.title}>
                {activeProperty.title}
              </h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#c59b27] shrink-0" />
                <span className="truncate">{activeProperty.locality}, {activeProperty.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 text-xs">
            <div className="text-[11px] text-slate-600 font-medium">
              Area: <strong className="text-slate-900">{activeProperty.area} {activeProperty.areaUnit}</strong>
              {activeProperty.bedrooms && ` • ${activeProperty.bedrooms} BHK`}
            </div>

            <Link
              href={`/properties/${activeProperty.slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0c4a3e] hover:text-[#072e27] hover:underline"
            >
              <span>View Details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
