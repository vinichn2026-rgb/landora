import { Suspense } from "react";
import { Metadata } from "next";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Properties & Plots in Tamil Nadu | Verified Listings",
  description: "Browse verified residential plots, agricultural farmlands, independent villas, and commercial real estate across Coimbatore, Chennai, and Tamil Nadu. 0% brokerage.",
  alternates: {
    canonical: "/properties",
  },
  openGraph: {
    title: `Verified Properties & Plots in Tamil Nadu | ${APP_NAME}`,
    description: "Browse DTCP & CMDA approved residential plots, farmland, and commercial spaces with clear legal titles.",
    url: "https://landora.in/properties",
    siteName: APP_NAME,
  },
};

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
