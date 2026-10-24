import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { PropertyCategoryType, ListingType } from "@/types";
import { sendListingSubmittedEmail, sendAdminNewPropertyNotificationEmail } from "@/lib/email";
import { INITIAL_ADMIN_EMAIL } from "@/lib/constants";

// GET /api/seller/listings - Retrieve all listings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let listings = await DataAccess.getSellerProperties(user.id);

    if (statusFilter && statusFilter !== "ALL" && statusFilter !== "all") {
      listings = listings.filter(l => l.status === statusFilter.toUpperCase());
    }

    return NextResponse.json({
      success: true,
      listings,
      count: listings.length,
    });
  } catch (error: any) {
    console.error("[API ERROR] GET /api/seller/listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch seller listings." },
      { status: 500 }
    );
  }
}

// POST /api/seller/listings - Create a new property listing (Multi-step form submission)
export async function POST(request: NextRequest) {
  try {
    const user = await getServerSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in to publish a property." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      listingType,
      propertyType,
      title,
      description,
      price,
      pricePerUnit,
      area,
      areaUnit,
      builtUpArea,
      bedrooms,
      bathrooms,
      furnishing,
      facing,
      roadWidthFt,
      plotDimensions,
      surveyNumber,
      landClassification,
      documentStatus,
      approvalStatus,
      address,
      locality,
      city,
      state,
      pinCode,
      images,
      amenities,
      sellerType,
      sellerName,
      sellerPhone,
      sellerEmail,
      sellerWhatsapp,
      isDraft,
    } = body;

    // --- Server-side Validation ---
    if (!isDraft) {
      if (!title || title.trim().length < 5) {
        return NextResponse.json(
          { success: false, error: "Please enter a descriptive property title (at least 5 characters)." },
          { status: 400 }
        );
      }
      if (!description || description.trim().length < 15) {
        return NextResponse.json(
          { success: false, error: "Please provide a detailed property description (at least 15 characters)." },
          { status: 400 }
        );
      }
      if (!price || Number(price) <= 0) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid price in INR." },
          { status: 400 }
        );
      }
      if (!area || Number(area) <= 0) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid plot / built-up area." },
          { status: 400 }
        );
      }
      if (!city || city.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Please specify the property city." },
          { status: 400 }
        );
      }
      if (!locality || locality.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Please specify the locality / landmark." },
          { status: 400 }
        );
      }
      if (!pinCode || pinCode.replace(/\D/g, "").length !== 6) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid 6-digit Indian PIN code." },
          { status: 400 }
        );
      }
      if (!images || !Array.isArray(images) || images.length === 0) {
        return NextResponse.json(
          { success: false, error: "Please upload at least one photograph of the property." },
          { status: 400 }
        );
      }
    }

    // Determine seller role & contact defaults
    const effectiveSellerType = sellerType || (user.role === "AGENT" ? "AGENT" : user.role === "BUILDER" ? "BUILDER" : "OWNER");
    const effectiveSellerName = sellerName?.trim() || user.name;
    const effectiveSellerPhone = sellerPhone?.trim() || user.phoneNumber || "+91 94433 12345";
    const effectiveSellerEmail = sellerEmail?.trim() || user.email;

    // Listing status:
    // "Do not automatically publish listings when moderation is enabled. Save drafts when supported."
    const status = isDraft ? "DRAFT" : "PENDING";

    // Format price per unit helper if omitted
    let computedPricePerUnit = pricePerUnit;
    if (!computedPricePerUnit && price && area) {
      const u = areaUnit || "sqft";
      const rate = Math.round(Number(price) / Number(area));
      computedPricePerUnit = `₹${rate.toLocaleString("en-IN")}/${u}`;
    }

    // Create record via DataAccess layer
    const createdProperty = await DataAccess.createSellerProperty({
      title: (title || "Untitled Property Draft").trim(),
      description: (description || "Draft listing pending details.").trim(),
      listingType: (listingType as ListingType) || "SALE",
      propertyType: (propertyType as PropertyCategoryType) || "RESIDENTIAL_PLOT",
      price: Number(price) || 0,
      pricePerUnit: computedPricePerUnit || "Contact for rate",
      area: Number(area) || 0,
      areaUnit: areaUnit || "sqft",
      builtUpArea: builtUpArea ? Number(builtUpArea) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      furnishing: furnishing || undefined,
      facing: facing || undefined,
      roadWidthFt: roadWidthFt ? Number(roadWidthFt) : undefined,
      plotDimensions: plotDimensions ? String(plotDimensions).trim() : undefined,
      surveyNumber: surveyNumber ? String(surveyNumber).trim() : undefined,
      landClassification: landClassification ? String(landClassification).trim() : undefined,
      documentStatus: documentStatus ? String(documentStatus).trim() : undefined,
      approvalStatus: approvalStatus || "Seller Declared",
      address: (address || locality || city).trim(),
      locality: (locality || city).trim(),
      city: city ? city.trim() : "Coimbatore",
      state: state || "Tamil Nadu",
      pinCode: pinCode ? String(pinCode).trim() : "641004",
      status,
      isFeatured: false,
      verificationStatus: "UNREVIEWED",
      sellerId: user.id,
      sellerName: effectiveSellerName,
      sellerType: effectiveSellerType,
      sellerPhone: effectiveSellerPhone,
      sellerEmail: effectiveSellerEmail,
      sellerWhatsapp: sellerWhatsapp ? String(sellerWhatsapp).trim() : undefined,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) && images.length > 0 
        ? images.map((img: any, idx: number) => ({
            id: img.id || `img-${idx}`,
            url: img.url,
            caption: img.caption || undefined,
            isPrimary: img.isPrimary ?? (idx === 0),
            order: idx,
          }))
        : [{ id: "placeholder", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop", isPrimary: true }],
    });

    // Phase 9: If submitted for review (not draft), dispatch notification and email
    if (!isDraft) {
      await DataAccess.createNotification({
        userId: user.id,
        title: "Listing Under Review",
        message: `Your property "${createdProperty.title}" was submitted for review. Our moderation team will verify documentation within 24 hours.`,
        type: "LISTING_SUBMITTED",
        link: "/dashboard/seller/listings",
        entityType: "PROPERTY",
        entityId: createdProperty.id,
      });

      if (effectiveSellerEmail) {
        await sendListingSubmittedEmail(
          effectiveSellerEmail,
          effectiveSellerName,
          createdProperty.title,
          createdProperty.id
        );
      }

      // Phase 6 Action-Auth: Notify Administrator of new property submission
      const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || INITIAL_ADMIN_EMAIL).toLowerCase().trim();
      const adminUser = await DataAccess.findUserByEmail(adminEmail);
      if (adminUser) {
        await DataAccess.createNotification({
          userId: adminUser.id,
          title: "New Property Submitted for Moderation",
          message: `${effectiveSellerName} submitted "${createdProperty.title}" in ${createdProperty.city} for review.`,
          type: "ADMIN_MODERATION_PENDING",
          link: "/admin/properties",
          entityType: "PROPERTY",
          entityId: createdProperty.id,
        });
      }

      await sendAdminNewPropertyNotificationEmail(
        adminEmail,
        createdProperty.title,
        effectiveSellerName,
        effectiveSellerEmail,
        createdProperty.city,
        Number(createdProperty.price),
        createdProperty.id
      );
    }

    return NextResponse.json({
      success: true,
      message: isDraft 
        ? "Listing draft saved successfully." 
        : "Property submitted successfully! Our moderation desk will review and publish it within 24 hours.",
      listing: createdProperty,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/seller/listings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit property listing." },
      { status: 500 }
    );
  }
}
