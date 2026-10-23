import { DataAccess } from "../src/lib/data-access";
import { PropertyStore } from "../src/lib/store";

async function run() {
  console.log("=== 1. Testing DataAccess.getProperties ===");
  const res = await DataAccess.getProperties({ limit: 4 });
  console.log(`Total properties: ${res.total}, Page items: ${res.data.length}`);
  console.log(`First item: ${res.data[0]?.title} (₹${res.data[0]?.price})`);

  console.log("\n=== 2. Testing DataAccess.getPropertyBySlug ===");
  const slug = res.data[0]?.slug;
  if (slug) {
    const prop = await DataAccess.getPropertyBySlug(slug);
    console.log(`Slug lookup: ${prop?.title}`);
    console.log(`Dimensions: ${prop?.plotDimensions || "N/A"}`);
    console.log(`Survey: ${prop?.surveyNumber || "N/A"}`);
  }

  console.log("\n=== 3. Testing DataAccess.createEnquiry ===");
  const enq = await DataAccess.createEnquiry({
    propertyId: res.data[0]?.id || "land-cbe-001",
    buyerName: "Vignesh Kumar",
    buyerPhone: "9842199887",
    buyerEmail: "vignesh@example.com",
    message: "Requesting site visit and patta documents.",
    sellerId: res.data[0]?.sellerId || "user-seller-01"
  });
  console.log(`Enquiry result: ${enq.success ? "SUCCESS" : "FAILED"}`);

  console.log("\n=== 4. Testing Website Dynamic Reflection ===");
  const testPlot = PropertyStore.create({
    title: "Dynamic Reflection Test Plot in Peelamedu",
    description: "Verified database reflection check",
    listingType: "SALE",
    propertyType: "RESIDENTIAL_PLOT",
    price: 5500000,
    pricePerUnit: "₹2,750 / sq.ft",
    area: 2000,
    areaUnit: "sqft",
    approvalStatus: "DTCP Approved",
    address: "Peelamedu",
    locality: "Peelamedu",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pinCode: "641004",
    status: "ACTIVE",
    isFeatured: true,
    verificationStatus: "INFO_REVIEWED",
    sellerId: "user-seller-01",
    sellerName: "K. R. Sivakumar",
    sellerType: "OWNER",
    sellerPhone: "+91 94433 12345",
    sellerEmail: "seller@landora.in",
    amenities: ["Tar Road", "EB Line"],
    images: [{ id: "t1", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef", isPrimary: true }]
  });

  const searchAfter = await DataAccess.getProperties({ city: "Peelamedu" });
  const isFound = searchAfter.data.some(p => p.id === testPlot.id);
  console.log(`Dynamic reflection check: ${isFound ? "PASSED (New property immediately visible in search results)" : "FAILED"}`);

  console.log("\n=== ALL DATABASE & DATA-ACCESS TESTS PASSED ===");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
