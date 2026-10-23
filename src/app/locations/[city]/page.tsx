import { Suspense } from "react";
import PropertySearchExperience from "@/components/search/PropertySearchExperience";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default async function LocationCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
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
