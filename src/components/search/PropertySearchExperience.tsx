"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  SlidersHorizontal, 
  Map, 
  LayoutGrid, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  Share2, 
  Check, 
  RotateCcw,
  X,
  Compass,
  AlertTriangle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import FilterSidebar, { FilterState } from "./FilterSidebar";
import ActiveFilterChips from "./ActiveFilterChips";
import PaginationControl from "./PaginationControl";
import PropertyMapView from "./PropertyMapView";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PropertyStore } from "@/lib/store";
import { SORT_OPTIONS, APP_NAME } from "@/lib/constants";
import { ListingType, PropertyCategoryType, PropertyItem } from "@/types";

interface PropertySearchExperienceProps {
  pageTitle?: string;
  pageSubtitle?: string;
  initialListingType?: ListingType;
  initialPropertyType?: string;
  initialCategories?: PropertyCategoryType[];
  initialCity?: string;
  baseRoute?: string;
}

export default function PropertySearchExperience({
  pageTitle,
  pageSubtitle,
  initialListingType,
  initialPropertyType,
  initialCategories,
  initialCity,
  baseRoute = "/properties",
}: PropertySearchExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial states from URL params or fallback to props
  const [filters, setFilters] = useState<FilterState>(() => {
    return {
      city: searchParams.get("city") || initialCity || "",
      propertyType: searchParams.get("propertyType") || initialPropertyType || "all",
      listingType: (searchParams.get("listingType") as ListingType) || initialListingType || "SALE",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minArea: searchParams.get("minArea") || "",
      maxArea: searchParams.get("maxArea") || "",
      areaUnit: searchParams.get("areaUnit") || "sqft",
      bedrooms: searchParams.get("bedrooms") || "all",
      furnishing: searchParams.get("furnishing") || "all",
      sellerType: searchParams.get("sellerType") || "all",
      verifiedOnly: searchParams.get("verifiedOnly") === "true",
    };
  });

  const [sortBy, setSortBy] = useState<"recommended" | "newest" | "price_asc" | "price_desc" | "area_desc">(
    (searchParams.get("sortBy") as any) || "recommended"
  );
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = searchParams.get("page");
    return p ? Math.max(1, parseInt(p, 10)) : 1;
  });
  const [viewMode, setViewMode] = useState<"grid" | "map">(
    searchParams.get("view") === "map" ? "map" : "grid"
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state to URL query parameters
  const syncParamsToUrl = useCallback(
    (newFilters: FilterState, newSort: string, newPage: number, newView: string) => {
      const params = new URLSearchParams();

      if (newFilters.city) params.set("city", newFilters.city);
      if (newFilters.propertyType && newFilters.propertyType !== "all") params.set("propertyType", newFilters.propertyType);
      if (newFilters.listingType) params.set("listingType", newFilters.listingType);
      if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
      if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
      if (newFilters.minArea) params.set("minArea", newFilters.minArea);
      if (newFilters.maxArea) params.set("maxArea", newFilters.maxArea);
      if (newFilters.areaUnit && newFilters.areaUnit !== "sqft") params.set("areaUnit", newFilters.areaUnit);
      if (newFilters.bedrooms && newFilters.bedrooms !== "all") params.set("bedrooms", newFilters.bedrooms);
      if (newFilters.furnishing && newFilters.furnishing !== "all") params.set("furnishing", newFilters.furnishing);
      if (newFilters.sellerType && newFilters.sellerType !== "all") params.set("sellerType", newFilters.sellerType);
      if (newFilters.verifiedOnly) params.set("verifiedOnly", "true");
      if (newSort && newSort !== "recommended") params.set("sortBy", newSort);
      if (newPage > 1) params.set("page", newPage.toString());
      if (newView === "map") params.set("view", "map");

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      
      // Update browser URL without full reloads
      window.history.replaceState(null, "", targetUrl);
    },
    [pathname]
  );

  // Query database/store
  const { properties, total, totalPages } = useMemo(() => {
    return PropertyStore.getAll({
      city: filters.city || undefined,
      propertyType: filters.propertyType !== "all" ? filters.propertyType : undefined,
      categories: initialCategories,
      listingType: filters.listingType,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minArea: filters.minArea ? Number(filters.minArea) : undefined,
      maxArea: filters.maxArea ? Number(filters.maxArea) : undefined,
      areaUnit: filters.areaUnit,
      bedrooms: filters.bedrooms && filters.bedrooms !== "all" ? Number(filters.bedrooms) : undefined,
      furnishing: filters.furnishing !== "all" ? (filters.furnishing as any) : undefined,
      sellerType: filters.sellerType !== "all" ? filters.sellerType : undefined,
      verifiedOnly: filters.verifiedOnly,
      sortBy,
      page: currentPage,
      limit: 9,
    });
  }, [filters, initialCategories, sortBy, currentPage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setIsLoading(true);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter change
    syncParamsToUrl(newFilters, sortBy, 1, viewMode);
    setTimeout(() => setIsLoading(false), 80);
  };

  const handleSortChange = (newSort: any) => {
    setSortBy(newSort);
    syncParamsToUrl(filters, newSort, currentPage, viewMode);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    syncParamsToUrl(filters, sortBy, newPage, viewMode);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleViewToggle = (mode: "grid" | "map") => {
    setViewMode(mode);
    syncParamsToUrl(filters, sortBy, currentPage, mode);
  };

  const handleClearAll = () => {
    const cleared: FilterState = {
      city: "",
      propertyType: initialPropertyType || "all",
      listingType: initialListingType || "SALE",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      areaUnit: "sqft",
      bedrooms: "all",
      furnishing: "all",
      sellerType: "all",
      verifiedOnly: false,
    };
    setFilters(cleared);
    setCurrentPage(1);
    setSortBy("recommended");
    syncParamsToUrl(cleared, "recommended", 1, viewMode);
  };

  const handleRemoveChip = (key: string) => {
    const updated = { ...filters };
    if (key === "city") updated.city = "";
    if (key === "propertyType") updated.propertyType = "all";
    if (key === "price") {
      updated.minPrice = "";
      updated.maxPrice = "";
    }
    if (key === "area") {
      updated.minArea = "";
      updated.maxArea = "";
    }
    if (key === "bedrooms") updated.bedrooms = "all";
    if (key === "furnishing") updated.furnishing = "all";
    if (key === "sellerType") updated.sellerType = "all";
    if (key === "verifiedOnly") updated.verifiedOnly = false;
    if (key === "listingType") updated.listingType = "SALE";

    handleFilterChange(updated);
  };

  const handleShareSearch = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Determine page heading
  const displayTitle =
    pageTitle ||
    (filters.city
      ? `Properties in ${filters.city}`
      : filters.listingType === "RENT"
      ? "Properties for Rent & Lease"
      : "Real Estate & Land Properties for Sale");

  const displaySubtitle =
    pageSubtitle ||
    `Browse verified residential plots, agricultural farmlands, homes, and commercial spaces across India.`;

  return (
    <div className="min-h-screen bg-[#fbfbfa] text-[#132a24] flex flex-col font-sans">
      <Header currentCity={filters.city || "Coimbatore"} />

      {/* Top Banner & Control Strip */}
      <section className="bg-white border-b border-[#e2e8e4] py-5 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title & Count */}
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#132a24] tracking-tight">
                  {displayTitle}
                </h1>
                <span className="bg-emerald-100 text-[#0c4a3e] border border-emerald-300 font-black text-xs px-2.5 py-0.5 rounded-full">
                  {total} {total === 1 ? "Result" : "Results"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {displaySubtitle}
              </p>
            </div>

            {/* Actions: View Mode, Sort, Share, Mobile Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Share Filtered Link Button */}
              <button
                onClick={handleShareSearch}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-[#e2e8e4] rounded-xl transition cursor-pointer shadow-2xs"
                title="Share or copy current search URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#0c4a3e]" />
                    <span>Share Search</span>
                  </>
                )}
              </button>

              {/* View Toggle: Grid vs Map */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleViewToggle("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-[#0c4a3e] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewToggle("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    viewMode === "map"
                      ? "bg-white text-[#0c4a3e] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  aria-label="Map View"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map View</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 text-xs bg-white border border-[#e2e8e4] px-3 py-1.5 rounded-xl shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-bold hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-[#132a24] font-semibold outline-none text-xs cursor-pointer focus:text-[#0c4a3e]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-[#0c4a3e] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          <ActiveFilterChips
            city={filters.city}
            propertyType={filters.propertyType}
            categories={initialCategories}
            listingType={filters.listingType}
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            minArea={filters.minArea}
            maxArea={filters.maxArea}
            areaUnit={filters.areaUnit}
            bedrooms={filters.bedrooms}
            furnishing={filters.furnishing}
            sellerType={filters.sellerType}
            verifiedOnly={filters.verifiedOnly}
            onRemove={handleRemoveChip}
            onClearAll={handleClearAll}
          />
        </div>
      </section>

      {/* Main Search Body */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-22">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearAll}
              totalResultsCount={total}
            />
          </aside>

          {/* Property Results Canvas (Grid or Map) */}
          <section className="lg:col-span-9 space-y-6">
            {isLoading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" text="Filtering properties across South India..." />
              </div>
            ) : viewMode === "map" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Interactive Map View — Click pins to inspect property cards</span>
                  <button
                    onClick={() => handleViewToggle("grid")}
                    className="text-[#0c4a3e] font-bold hover:underline"
                  >
                    Switch back to Grid
                  </button>
                </div>
                <PropertyMapView properties={properties} selectedCity={filters.city} />
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e2e8e4] p-12 text-center shadow-xs">
                <EmptyState
                  title="No Matching Properties Found"
                  description="We couldn't find any properties matching your selected filter criteria. Try adjusting your budget, removing the locality filter, or clearing filters."
                  actionLabel="Clear All Filters"
                  onAction={handleClearAll}
                />
              </div>
            ) : (
              <>
                {/* 3-Column Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination Controls */}
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={9}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto p-5 z-10 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#0c4a3e]" />
                  <h2 className="text-base font-black text-slate-900">Search Filters</h2>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
                  aria-label="Close Filter Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterSidebar
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearAll}
                isMobileDrawer={true}
                onCloseMobile={() => setMobileFilterOpen(false)}
                totalResultsCount={total}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
