import { NextRequest, NextResponse } from "next/server";
import { DataAccess } from "@/lib/data-access";
import { SearchFilters, ListingType, PropertyCategoryType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: SearchFilters = {
      city: searchParams.get("city") || undefined,
      locality: searchParams.get("locality") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      listingType: (searchParams.get("listingType") as ListingType) || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      minArea: searchParams.get("minArea") ? Number(searchParams.get("minArea")) : undefined,
      maxArea: searchParams.get("maxArea") ? Number(searchParams.get("maxArea")) : undefined,
      areaUnit: searchParams.get("areaUnit") || undefined,
      bedrooms: searchParams.get("bedrooms") && searchParams.get("bedrooms") !== "all" ? Number(searchParams.get("bedrooms")) : undefined,
      furnishing: searchParams.get("furnishing") as any,
      sellerType: searchParams.get("sellerType") || undefined,
      verifiedOnly: searchParams.get("verifiedOnly") === "true",
      sortBy: searchParams.get("sortBy") as any,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 9,
    };

    const result = await DataAccess.getProperties(filters);

    return NextResponse.json({
      success: true,
      properties: result.data,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit: result.limit,
    });
  } catch (error) {
    console.error("[API ERROR] /api/properties:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error fetching properties" },
      { status: 500 }
    );
  }
}
