import { Suspense } from "react";
import { Metadata } from "next";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { APP_NAME } from "@/lib/constants";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const formattedCity = decodedCity.charAt(0).toUpperCase() + decodedCity.slice(1);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://landora.in";

  return {
    title: `Plots & Properties in ${formattedCity} | DTCP Approved | ${APP_NAME}`,
    description: `Browse verified residential plots, agricultural land, independent homes, and commercial properties in ${formattedCity}, Tamil Nadu. Clear titles, 0% brokerage.`,
    alternates: {
      canonical: `${baseUrl}/locations/${city.toLowerCase()}`,
    },
    openGraph: {
      title: `Properties & Land in ${formattedCity} | ${APP_NAME}`,
      description: `Find approved plots and properties across ${formattedCity}.`,
      url: `${baseUrl}/locations/${city.toLowerCase()}`,
    },
  };
}

export default async function LocationCityPage({ params }: PageProps) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const formattedCity = decodedCity.charAt(0).toUpperCase() + decodedCity.slice(1);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa]">
          <LoadingSpinner size="lg" text={`Loading Properties in ${formattedCity}...`} />
        </div>
      }
    >
      <PropertySearchExperience
        initialCity={formattedCity}
        pageTitle={`Real Estate, Plots & Homes in ${formattedCity}`}
        pageSubtitle={`Explore verified residential layouts, agricultural land, independent homes, and commercial spaces in ${formattedCity} and nearby growth corridors.`}
        baseRoute={`/locations/${city}`}
      />
    </Suspense>
  );
}
