import { Suspense } from "react";
import { Metadata } from "next";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Commercial Properties & Highway Plots in Tamil Nadu",
  description: "Discover prime highway commercial plots, retail showrooms, office spaces, and industrial factory sheds for sale and lease across Tamil Nadu.",
  alternates: {
    canonical: "/commercial",
  },
  openGraph: {
    title: `Commercial Real Estate & Plots | ${APP_NAME}`,
    description: "Discover prime commercial plots, showrooms, and warehouse spaces.",
    url: "https://landora.in/commercial",
    siteName: APP_NAME,
  },
};

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
