import { Suspense } from "react";
import { Metadata } from "next";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Properties for Sale in Tamil Nadu | Buy Plots & Homes",
  description: "Discover residential plots, independent houses, villas, and farmland available for outright purchase across Coimbatore, Chennai, and Tamil Nadu. 0% Brokerage.",
  alternates: {
    canonical: "/buy",
  },
  openGraph: {
    title: `Properties for Sale in Tamil Nadu | ${APP_NAME}`,
    description: "Discover verified plots, villas, and farmland for sale.",
    url: "https://landora.in/buy",
    siteName: APP_NAME,
  },
};

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
