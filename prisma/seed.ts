import "dotenv/config";
import { UserRole, SellerType, ListingType, PropertyCategoryType, PropertyStatus, VerificationLevel, FurnishingStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting Landora Database Seeding [DEMO CONTENT FOR DEVELOPMENT]...");

  // 1. Create Demo Users
  const seller1 = await prisma.user.upsert({
    where: { email: "seller@landora.in" },
    update: {},
    create: {
      id: "user-seller-01",
      name: "K. R. Sivakumar",
      email: "seller@landora.in",
      phoneNumber: "+91 94433 12345",
      role: UserRole.SELLER,
      profile: {
        create: {
          bio: "Independent landowner and promoter in Peelamedu, Coimbatore.",
          city: "Coimbatore",
          state: "Tamil Nadu",
          isPhoneVerified: true,
          isEmailVerified: true,
        },
      },
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: "contact@cbelands.in" },
    update: {},
    create: {
      id: "user-agent-01",
      name: "Coimbatore Lands & Properties",
      email: "contact@cbelands.in",
      phoneNumber: "+91 98940 77889",
      role: UserRole.AGENT,
      profile: {
        create: {
          companyName: "Coimbatore Lands & Properties",
          bio: "Licensed layout marketing firm specializing in Saravanampatti and Avinashi Road corridors.",
          city: "Coimbatore",
          state: "Tamil Nadu",
          reraRegistration: "TN/AGENT/0422/2024",
          isPhoneVerified: true,
          isEmailVerified: true,
        },
      },
    },
  });

  const builder1 = await prisma.user.upsert({
    where: { email: "sales@apexheritage.com" },
    update: {},
    create: {
      id: "user-builder-01",
      name: "Apex Heritage Homes",
      email: "sales@apexheritage.com",
      phoneNumber: "+91 98401 55443",
      role: UserRole.BUILDER,
      profile: {
        create: {
          companyName: "Apex Heritage Developers Pvt Ltd",
          city: "Coimbatore",
          state: "Tamil Nadu",
          reraRegistration: "TN/BUILDER/0842/2023",
          isPhoneVerified: true,
          isEmailVerified: true,
        },
      },
    },
  });

  console.log("✔ Users & Profiles seeded successfully.");

  // 2. Create Listing Packages
  await prisma.listingPackage.upsert({
    where: { slug: "standard-free" },
    update: {},
    create: {
      id: "pkg-basic",
      name: "Standard Free Listing",
      slug: "standard-free",
      price: 0,
      durationDays: 45,
      listingLimit: 1,
      isFeatured: false,
      description: "Ideal for individual owners looking to sell or rent a single land plot or house.",
      features: [
        "1 Active Property Listing",
        "Valid for 45 Days",
        "Direct Buyer Phone Enquiries",
        "Standard Search Placement",
        "Upload up to 5 Photographs"
      ],
      isActive: true,
    },
  });

  await prisma.listingPackage.upsert({
    where: { slug: "featured-plot" },
    update: {},
    create: {
      id: "pkg-featured",
      name: "Featured Plot Package",
      slug: "featured-plot",
      price: 1499,
      durationDays: 60,
      listingLimit: 3,
      isFeatured: true,
      description: "Maximum visibility for high-value land parcels with priority placement on homepage and search.",
      features: [
        "3 Active Property Listings",
        "Valid for 60 Days",
        "Top Priority in Search Results",
        "Featured Badge & Homepage Spotlight",
        "Instant WhatsApp & SMS Enquiry Alerts",
        "Upload up to 15 HD Photographs"
      ],
      isActive: true,
    },
  });

  console.log("✔ Listing Packages seeded.");

  // 3. Demo Properties
  const demoProperties = [
    {
      id: "land-cbe-001",
      slug: "dtcp-approved-villa-plot-peelamedu-coimbatore",
      title: "1,800 Sq.Ft DTCP Approved Villa Plot in Peelamedu",
      description: "North-facing residential corner plot located in a peaceful, fully developed gated layout in Peelamedu, Coimbatore. Just 5 minutes from Avinashi Road and 10 minutes from Coimbatore Airport. 30 feet blacktop road, underground drainage, clear title with single-owner patta, and immediate house construction readiness.",
      listingType: ListingType.SALE,
      propertyType: PropertyCategoryType.RESIDENTIAL_PLOT,
      price: 4800000,
      pricePerUnit: "₹2,667 / sq.ft",
      area: 1800,
      areaUnit: "sqft",
      facing: "North",
      roadWidthFt: 30,
      plotDimensions: "40 x 45 Ft (Corner)",
      surveyNumber: "S.F. No. 142/3B",
      landClassification: "Residential Layout (DTCP Regularized)",
      documentStatus: "Clean Single-Owner Patta, 30-Year Nil EC, Non-Agricultural Conversion Certified",
      approvalStatus: "DTCP & Local Panchayat Approved",
      address: "Layout No. 14, PSG Tech Extension, Peelamedu",
      locality: "Peelamedu",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pinCode: "641004",
      latitude: 11.0264,
      longitude: 77.0142,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      verificationStatus: VerificationLevel.INDEPENDENTLY_VERIFIED,
      sellerType: SellerType.OWNER,
      ownerId: seller1.id,
      images: [
        { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop", caption: "Corner plot boundary view with fenced perimeter", isPrimary: true, order: 0 },
        { url: "https://images.unsplash.com/photo-1524813686514-a57563d77d61?q=80&w=1200&auto=format&fit=crop", caption: "30-feet wide approach road", isPrimary: false, order: 1 }
      ],
      amenities: ["30ft Tar Road", "Underground Drainage", "Street Lights", "Gated Security", "Borewell Point Available", "Compound Wall"]
    },
    {
      id: "land-cbe-002",
      slug: "gated-community-plot-saravanampatti-coimbatore",
      title: "2,400 Sq.Ft East-Facing Gated Community Plot near IT Corridor",
      description: "Prime residential plot (5.5 Cents) in a premium gated community at Saravanampatti, Coimbatore. Walking distance to leading IT parks (KCT Tech Park, Chil SEZ). 40-feet avenue road with park space, solar streetlights, 24/7 security guard, and DTCP sanction order.",
      listingType: ListingType.SALE,
      propertyType: PropertyCategoryType.RESIDENTIAL_PLOT,
      price: 6600000,
      pricePerUnit: "₹2,750 / sq.ft",
      area: 2400,
      areaUnit: "sqft",
      facing: "East",
      roadWidthFt: 40,
      plotDimensions: "40 x 60 Ft",
      surveyNumber: "Survey No. 38/2A",
      landClassification: "Residential Gated Community (DTCP/RERA)",
      documentStatus: "RERA Registered, Layout Sanction Copy in Hand, Mother Deed Traced for 40 Years",
      approvalStatus: "DTCP & RERA Approved",
      address: "Plot 38, Green Valley Avenue, Sathy Road, Saravanampatti",
      locality: "Saravanampatti",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pinCode: "641035",
      latitude: 11.0789,
      longitude: 76.9964,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      verificationStatus: VerificationLevel.INFO_REVIEWED,
      sellerType: SellerType.AGENT,
      ownerId: agent1.id,
      images: [
        { url: "https://images.unsplash.com/photo-1524813686514-a57563d77d61?q=80&w=1200&auto=format&fit=crop", caption: "Gated entry avenue with landscaped pathway", isPrimary: true, order: 0 }
      ],
      amenities: ["Park & Children Play Area", "40ft Wide Road", "Security Guard Cabin", "Solar Street Lighting", "Avenue Plantation"]
    },
    {
      id: "land-cbe-004",
      slug: "3bhk-luxury-independent-villa-gandhipuram-coimbatore",
      title: "3 BHK Modern Independent Villa near Cross Cut Road, Gandhipuram",
      description: "Newly constructed architect-designed independent house on a 4-cent plot with 2,600 sq.ft built-up area in central Coimbatore. Ground + 1 floor layout with covered car parking, modular kitchen, teak wood main doors, Siruvani water connection, and rooftop terrace pergola.",
      listingType: ListingType.SALE,
      propertyType: PropertyCategoryType.HOUSE,
      price: 13500000,
      pricePerUnit: "₹5,192 / sq.ft built-up",
      area: 1742,
      areaUnit: "sqft",
      builtUpArea: 2600,
      bedrooms: 3,
      bathrooms: 3,
      furnishing: FurnishingStatus.Semi_Furnished,
      facing: "East",
      roadWidthFt: 30,
      plotDimensions: "38 x 45.8 Ft",
      surveyNumber: "Ward 24, T.S. No. 12/1",
      landClassification: "Urban Residential (Corporation Zone)",
      documentStatus: "Corporation Building Sanction Order & Approved Plan, Completion Certificate, Clear Title",
      approvalStatus: "Coimbatore Corporation Building Plan Approved",
      address: "12, 7th Street Extension, Tatabad, Gandhipuram",
      locality: "Gandhipuram",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pinCode: "641012",
      latitude: 11.0183,
      longitude: 76.9696,
      status: PropertyStatus.ACTIVE,
      isFeatured: true,
      verificationStatus: VerificationLevel.INDEPENDENTLY_VERIFIED,
      sellerType: SellerType.BUILDER,
      ownerId: builder1.id,
      images: [
        { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop", caption: "Front elevation of 3 BHK independent house", isPrimary: true, order: 0 }
      ],
      amenities: ["Siruvani Water Connection", "Covered Car Parking (2 cars)", "Modular Kitchen", "Solar Water Heater", "Private Rooftop Garden"]
    }
  ];

  for (const p of demoProperties) {
    const { images, amenities, ...propData } = p;
    const createdProp = await prisma.property.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...propData,
        images: {
          create: images.map(img => ({
            url: img.url,
            caption: img.caption,
            isPrimary: img.isPrimary,
            order: img.order,
            storageProvider: "cloudinary"
          }))
        },
        amenities: {
          create: amenities.map(am => ({
            name: am,
            category: "FACILITY"
          }))
        }
      }
    });

    console.log(`✔ Property [${createdProp.title}] seeded.`);
  }

  console.log("✅ Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
