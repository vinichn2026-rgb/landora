import { MetadataRoute } from "next";
import { DataAccess } from "@/lib/data-access";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://landora.in";
  const now = new Date();

  // Core Platform Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/buy`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/rent`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/plots`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/commercial`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/post-property`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/listing-guidelines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Location Hub Pages
  const locationHubs = [
    "coimbatore",
    "chennai",
    "bengaluru",
    "madurai",
    "tiruppur",
    "hyderabad",
  ].map((city) => ({
    url: `${baseUrl}/locations/${city}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Dynamic Property Listing Pages
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const result = await DataAccess.getProperties({ limit: 100 });
    propertyRoutes = (result.data || []).map((p) => ({
      url: `${baseUrl}/properties/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.publishedAt || now),
      changeFrequency: "weekly" as const,
      priority: p.isFeatured ? 0.85 : 0.75,
    }));
  } catch (err) {
    console.warn("[SITEMAP WARNING] Failed to dynamically query properties for sitemap:", err);
  }

  return [...staticRoutes, ...locationHubs, ...propertyRoutes];
}
