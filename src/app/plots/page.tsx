import { Suspense } from "react";
import { Metadata } from "next";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Plots & Land for Sale in Tamil Nadu | DTCP Approved",
  description: "Explore verified residential layout plots, agricultural farmlands, and gated community land across Coimbatore, Chennai, and Tamil Nadu. 0% Brokerage.",
  alternates: {
    canonical: "/plots",
  },
  openGraph: {
    title: `Plots & Land for Sale in Tamil Nadu | ${APP_NAME}`,
    description: "Discover DTCP/CMDA approved layout plots, farmland acreage, and gated community land.",
    url: "https://landora.in/plots",
    siteName: APP_NAME,
  },
};

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
