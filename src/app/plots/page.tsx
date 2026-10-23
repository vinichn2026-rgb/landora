import { Suspense } from "react";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PlotsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <LoadingSpinner size="lg" text="Loading Plots & Land Parcels..." />
        </div>
      }
    >
      <PropertySearchExperience
        pageTitle="Plots & Land for Sale in India"
        pageSubtitle="Discover DTCP/CMDA approved layout plots, farmland acreage, gated community parcels, and commercial highway land."
        initialCategories={["RESIDENTIAL_PLOT", "AGRICULTURAL_LAND", "COMMERCIAL_PLOT"]}
        initialListingType="SALE"
        baseRoute="/plots"
      />
    </Suspense>
  );
}
