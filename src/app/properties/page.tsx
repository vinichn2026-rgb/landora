import { Suspense } from "react";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <LoadingSpinner size="lg" text="Loading Landora Properties..." />
        </div>
      }
    >
      <PropertySearchExperience
        pageTitle="Properties & Plots for Sale and Rent"
        pageSubtitle="Discover verified residential plots, agricultural acreage, independent villas, and commercial properties across South India."
        baseRoute="/properties"
      />
    </Suspense>
  );
}
