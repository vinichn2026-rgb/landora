import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { DataAccess } from "@/lib/data-access";
import { PropertyCategoryType, ListingType } from "@/types";
import { sendListingSubmittedEmail, sendAdminNewPropertyNotificationEmail } from "@/lib/email";
import { NotificationService } from "@/lib/notification-service";
import { NotificationQueue } from "@/lib/notification-queue";
import { INITIAL_ADMIN_EMAIL } from "@/lib/constants";

// GET /api/seller/listings - Retrieve all listings owned by the authenticated user
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

    // Retrieve strictly authenticated user's properties
    const allListings = await DataAccess.getSellerProperties(user.id, user.phoneNumber || undefined, user.email || undefined);

    // Compute category counts for tab badges
    const counts = {
      ALL: allListings.length,
      DRAFT: allListings.filter(l => l.status === "DRAFT").length,
      SUBMITTED: allListings.filter(l => l.status === "SUBMITTED").length,
      PENDING_VERIFICATION: allListings.filter(l => l.status === "PENDING_VERIFICATION" || l.status === "PENDING").length,
      NEEDS_MORE_INFORMATION: allListings.filter(l => l.status === "NEEDS_MORE_INFORMATION").length,
      PUBLISHED: allListings.filter(l => l.status === "PUBLISHED" || l.status === "ACTIVE").length,
      REJECTED: allListings.filter(l => l.status === "REJECTED").length,
      SOLD_RENTED: allListings.filter(l => l.status === "SOLD" || l.status === "RENTED" || l.status === "DEACTIVATED").length,
    };

    let filteredListings = [...allListings];

    if (statusFilter && statusFilter !== "ALL" && statusFilter !== "all") {
      const upper = statusFilter.toUpperCase();
      if (upper === "SOLD_RENTED") {
        filteredListings = filteredListings.filter(l => l.status === "SOLD" || l.status === "RENTED" || l.status === "DEACTIVATED");
      } else if (upper === "PENDING_VERIFICATION") {
        filteredListings = filteredListings.filter(l => l.status === "PENDING_VERIFICATION" || l.status === "PENDING");
      } else if (upper === "PUBLISHED") {
        filteredListings = filteredListings.filter(l => l.status === "PUBLISHED" || l.status === "ACTIVE");
      } else {
        filteredListings = filteredListings.filter(l => l.status === upper);
      }
    }

    return NextResponse.json({
      success: true,
      listings: filteredListings,
      count: filteredListings.length,
      counts,
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
    let user = await getServerSessionUser();
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
      photosViaWhatsApp,
      amenities,
      sellerType,
      sellerName,
      sellerPhone,
      sellerEmail,
      sellerWhatsapp,
      isDraft,
      idempotencyKey,
      referenceNumber,
    } = body;

    // If user is not yet logged in with cookie, resolve or create account from seller contact details
    if (!user) {
      if (sellerEmail) {
        const cleanEmail = String(sellerEmail).toLowerCase().trim();
        user = await DataAccess.findUserByEmail(cleanEmail);
        if (!user) {
          user = await DataAccess.createUser({
            name: sellerName?.trim() || "Landora Seller",
            email: cleanEmail,
            phoneNumber: sellerPhone?.trim() || undefined,
            role: sellerType === "AGENT" ? "AGENT" : sellerType === "BUILDER" ? "BUILDER" : "SELLER",
          });
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Please enter your name, email, and phone number to publish your property." },
        { status: 401 }
      );
    }

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
      // If user chose to share photos on WhatsApp later, allow proceeding without photos
      if (!photosViaWhatsApp && (!images || !Array.isArray(images) || images.length === 0)) {
        return NextResponse.json(
          { success: false, error: "Please upload at least one photograph of the property or select the option to share photos on WhatsApp later." },
          { status: 400 }
        );
      }
    }

    // Determine seller role & contact defaults
    const effectiveSellerType = sellerType || (user.role === "AGENT" ? "AGENT" : user.role === "BUILDER" ? "BUILDER" : "OWNER");
    const effectiveSellerName = sellerName?.trim() || user.name;
    const effectiveSellerPhone = sellerPhone?.trim() || user.phoneNumber || "+91 94433 12345";
    const effectiveSellerEmail = sellerEmail?.trim() || user.email;

    // Listing status: Phase 5 Workflow (DRAFT, SUBMITTED, PENDING_VERIFICATION, etc.)
    const status = isDraft ? "DRAFT" : "SUBMITTED";

    // Format price per unit helper if omitted
    let computedPricePerUnit = pricePerUnit;
    if (!computedPricePerUnit && price && area) {
      const u = areaUnit || "sqft";
      const rate = Math.round(Number(price) / Number(area));
      computedPricePerUnit = `₹${rate.toLocaleString("en-IN")}/${u}`;
    }

    // Create record via DataAccess layer (Safe database persistence)
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
      status: status as any,
      isFeatured: false,
      verificationStatus: "UNREVIEWED",
      referenceNumber: referenceNumber || undefined,
      idempotencyKey: idempotencyKey || undefined,
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
        : [{ 
            id: "placeholder-wa", 
            url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop", 
            caption: photosViaWhatsApp ? "Photos to be shared via WhatsApp" : "Main Property Image",
            isPrimary: true 
          }],
    });

    // Phase 4: Save Communication Consent & Preferences (TRAI DLT & DPDP compliant)
    const { communicationConsent } = body;
    if (effectiveSellerPhone) {
      await DataAccess.saveCommunicationConsent({
        userId: user.id,
        phoneNumber: effectiveSellerPhone,
        transactionalSms: communicationConsent?.transactionalSms !== undefined ? Boolean(communicationConsent.transactionalSms) : true,
        transactionalWhatsapp: communicationConsent?.transactionalWhatsapp !== undefined ? Boolean(communicationConsent.transactionalWhatsapp) : true,
        promotionalOffers: Boolean(communicationConsent?.promotionalOffers), // strictly not auto-opted
        consentSource: "POST_PROPERTY_FORM",
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      });
    }

    // Phase 9: Reliable Event-Driven Notification & Admin Automation
    // Notification processing is decoupled from database persistence.
    // External notification provider latency or downtime will never block or fail property submission.
    if (!isDraft) {
      NotificationQueue.handleNewPropertySubmitted({
        property: createdProperty,
        sellerUser: {
          id: user.id,
          name: effectiveSellerName,
          email: effectiveSellerEmail,
          phoneNumber: effectiveSellerPhone,
        },
      });
    }

    return NextResponse.json({
      success: true,
      referenceId: createdProperty.referenceNumber || createdProperty.id,
      referenceNumber: createdProperty.referenceNumber || createdProperty.id,
      message: isDraft 
        ? "Listing draft saved successfully." 
        : `Property submitted successfully with Reference #${createdProperty.referenceNumber || createdProperty.id}! Our moderation desk will review and publish it within 24 hours.`,
      listing: createdProperty,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[API ERROR] POST /api/seller/listings:", error);
    return NextResponse.json(
      { 
        success: false, 
        retryable: true,
        error: error.message || "Failed to save property to the database. Your entered details are safe; please tap Retry to submit again." 
      },
      { status: 500 }
    );
  }
}
