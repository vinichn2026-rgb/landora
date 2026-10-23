import { Suspense } from "react";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function RentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <LoadingSpinner size="lg" text="Loading Rental Properties..." />
        </div>
      }
    >
      <PropertySearchExperience
        pageTitle="Properties for Rent & Commercial Lease"
        pageSubtitle="Explore independent homes, high-rise apartments, furnished villas, and commercial showrooms for monthly rental across Tamil Nadu and Bengaluru."
        initialListingType="RENT"
        baseRoute="/rent"
      />
    </Suspense>
  );
}
