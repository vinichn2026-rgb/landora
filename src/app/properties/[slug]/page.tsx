import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DataAccess } from "@/lib/data-access";
import { PropertyStore } from "@/lib/store";
import { APP_NAME } from "@/lib/constants";
import PropertyDetailClient from "./PropertyDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate Page-Specific SEO Metadata, OpenGraph & Indexing Controls
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let property = await DataAccess.getPropertyBySlug(slug);
  if (!property) {
    property = PropertyStore.getBySlug(slug);
  }

  if (!property) {
    return {
      title: "Property Not Found | Landora",
      description: "The requested property listing could not be found on Landora.",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://landora.in";
  const canonicalUrl = `${baseUrl}/properties/${property.slug}`;
  const primaryImage = property.images && property.images.length > 0
    ? property.images[0].url
    : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop";

  // Strict indexing controls: Only ACTIVE and PUBLISHED listings are allowed in search engine indexes
  const isIndexable = property.status === "ACTIVE" || property.status === "PUBLISHED";

  const formattedPrice = property.price >= 10000000 
    ? `₹${(property.price / 10000000).toFixed(2)} Cr` 
    : `₹${(property.price / 100000).toFixed(2)} Lac`;

  const metaTitle = `${property.title} in ${property.locality}, ${property.city} - ${formattedPrice} | ${APP_NAME}`;
  const metaDescription = `${property.propertyType} for ${property.listingType.toLowerCase()} in ${property.locality}, ${property.city}. Area: ${property.area} ${property.areaUnit}. Approval: ${property.approvalStatus || "DTCP Approved"}. 0% Brokerage. View photos and contact verified seller.`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isIndexable
      ? {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
        }
      : {
          index: false,
          follow: false,
          nocache: true,
        },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: APP_NAME,
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [primaryImage],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let property = await DataAccess.getPropertyBySlug(slug);
  if (!property) {
    property = PropertyStore.getBySlug(slug);
  }

  if (!property) {
    notFound();
  }

  const similarProperties = PropertyStore.getSimilar(property, 3);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://landora.in";

  // Schema.org RealEstateListing / LandParcel Structured Data
  const isLand = property.propertyType.toLowerCase().includes("plot") || property.propertyType.toLowerCase().includes("land");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isLand ? "LandParcel" : "SingleFamilyResidence",
    name: property.title,
    description: property.description,
    url: `${baseUrl}/properties/${property.slug}`,
    image: (property.images || []).map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: property.publishedAt || property.createdAt,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.locality,
      addressRegion: property.city,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      address: `${property.locality}, ${property.city}, Tamil Nadu, India`,
    },
  };

  // BreadcrumbList Structured Data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Properties",
        item: `${baseUrl}/properties`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.city,
        item: `${baseUrl}/locations/${property.city.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: property.title,
        item: `${baseUrl}/properties/${property.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Inject Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <PropertyDetailClient
        property={property}
        similarProperties={similarProperties}
      />
    </>
  );
}
