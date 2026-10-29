import { Suspense } from "react";
import { Metadata } from "next";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Properties for Rent in Tamil Nadu | Houses & Commercial Spaces",
  description: "Explore independent homes, apartments, villas, and commercial spaces available for rent or lease across Coimbatore, Chennai, and Tamil Nadu.",
  alternates: {
    canonical: "/rent",
  },
  openGraph: {
    title: `Properties for Rent | ${APP_NAME}`,
    description: "Explore verified rental homes and commercial spaces.",
    url: "https://landora.in/rent",
    siteName: APP_NAME,
  },
};

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
