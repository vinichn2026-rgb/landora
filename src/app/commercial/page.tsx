import { Suspense } from "react";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CommercialPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <LoadingSpinner size="lg" text="Loading Commercial Real Estate..." />
        </div>
      }
    >
      <PropertySearchExperience
        pageTitle="Commercial Real Estate, Plots & Industrial Sheds"
        pageSubtitle="Discover prime highway commercial plots, retail showrooms, office spaces, and industrial factory sheds for sale and lease."
        initialCategories={["COMMERCIAL_PLOT", "COMMERCIAL_BUILDING", "INDUSTRIAL"]}
        baseRoute="/commercial"
      />
    </Suspense>
  );
}
