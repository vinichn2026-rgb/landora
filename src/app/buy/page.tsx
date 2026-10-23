import { Suspense } from "react";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function BuyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <LoadingSpinner size="lg" text="Loading Properties for Sale..." />
        </div>
      }
    >
      <PropertySearchExperience
        pageTitle="Properties for Sale in India"
        pageSubtitle="Discover residential plots, independent houses, apartments, villas, and commercial real estate available for outright purchase."
        initialListingType="SALE"
        baseRoute="/buy"
      />
    </Suspense>
  );
}
