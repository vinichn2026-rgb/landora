export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Landora";
export const APP_TAGLINE = "Find the Right Property. Build Your Future.";
export const APP_SUBTITLE = "Discover land, plots, homes and commercial properties across India.";
export const APP_PRIMARY_CITY = "Coimbatore";

// Initial Authorised Administrator & Auth Settings
export const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || "vinichn2026@gmail.com";
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

export const PROPERTY_CATEGORIES = [
  { id: "residential-plot", label: "Residential Plots", slug: "residential-plots", type: "RESIDENTIAL_PLOT", icon: "Compass" },
  { id: "agricultural-land", label: "Agricultural Land", slug: "agricultural-land", type: "AGRICULTURAL_LAND", icon: "Trees" },
  { id: "independent-house", label: "Independent Houses", slug: "independent-houses", type: "HOUSE", icon: "Home" },
  { id: "apartment", label: "Apartments", slug: "apartments", type: "APARTMENT", icon: "Building2" },
  { id: "villa", label: "Villas", slug: "villas", type: "VILLA", icon: "Castle" },
  { id: "commercial-plot", label: "Commercial Plots", slug: "commercial-plots", type: "COMMERCIAL_PLOT", icon: "Briefcase" },
  { id: "shop-office", label: "Shops and Offices", slug: "shops-and-offices", type: "COMMERCIAL_BUILDING", icon: "Store" },
  { id: "industrial-land", label: "Industrial Land", slug: "industrial-land", type: "INDUSTRIAL", icon: "Factory" },
] as const;

export const POPULAR_LOCATIONS = [
  { city: "Coimbatore", state: "Tamil Nadu", popularLocalities: ["Peelamedu", "Saravanampatti", "Gandhipuram", "RS Puram", "Vadavalli", "Pollachi Road"], count: 1420 },
  { city: "Chennai", state: "Tamil Nadu", popularLocalities: ["OMR IT Corridor", "Avadi", "GST Road", "Guduvanchery", "Velachery", "Tambaram"], count: 3850 },
  { city: "Bengaluru", state: "Karnataka", popularLocalities: ["Whitefield", "Sarjapur Road", "Electronic City", "Hebbal", "Devenahalli"], count: 4200 },
  { city: "Madurai", state: "Tamil Nadu", popularLocalities: ["Othakadai Ring Road", "K.K. Nagar", "Mattuthavani", "Thirunagar"], count: 980 },
  { city: "Tiruppur", state: "Tamil Nadu", popularLocalities: ["Avinashi", "Palladam Road", "Kangeyam Road", "Uthukuli"], count: 650 },
  { city: "Hyderabad", state: "Telangana", popularLocalities: ["Gachibowli", "Hitec City", "Shamshabad", "Kompally"], count: 3100 },
] as const;

export const AREA_UNITS = [
  { value: "sqft", label: "Square Feet (sq.ft)", multiplierToSqft: 1 },
  { value: "cent", label: "Cents (435.6 sq.ft)", multiplierToSqft: 435.6 },
  { value: "sqyd", label: "Square Yards (9 sq.ft)", multiplierToSqft: 9 },
  { value: "acre", label: "Acres (43,560 sq.ft)", multiplierToSqft: 43560 },
] as const;

export const FURNISHING_OPTIONS = [
  { value: "all", label: "Any Furnishing" },
  { value: "Unfurnished", label: "Unfurnished" },
  { value: "Semi-Furnished", label: "Semi-Furnished" },
  { value: "Fully-Furnished", label: "Fully-Furnished" },
] as const;

export const BEDROOM_OPTIONS = [
  { value: "all", label: "Any BHK" },
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5", label: "5+ BHK" },
] as const;

export const SELLER_TYPE_OPTIONS = [
  { value: "all", label: "All Sellers" },
  { value: "OWNER", label: "Owner Only" },
  { value: "AGENT", label: "Agent" },
  { value: "BUILDER", label: "Builder / Promoter" },
] as const;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_desc", label: "Largest Area First" },
] as const;

export function normalizeAreaToSqft(area: number, unit: string): number {
  if (!area || isNaN(area)) return 0;
  const u = (unit || "sqft").toLowerCase().trim();
  if (u === "cent" || u === "cents") return area * 435.6;
  if (u === "acre" || u === "acres") return area * 43560;
  if (u === "sqyd" || u === "sqyds" || u === "sq.yd" || u === "sq.yards") return area * 9;
  if (u === "ground" || u === "grounds") return area * 2400;
  return area; // sqft
}

export const VERIFICATION_STATUSES = {
  UNREVIEWED: { label: "Unreviewed", badgeColor: "bg-slate-100 text-slate-700", description: "Listing has not undergone administrative review." },
  CONTACT_VERIFIED: { label: "Contact Verified", badgeColor: "bg-blue-50 text-blue-700 border-blue-200", description: "Seller mobile phone and email have been OTP-verified." },
  INFO_REVIEWED: { label: "Listing Info Reviewed", badgeColor: "bg-teal-50 text-teal-800 border-teal-200", description: "Property details, pricing and photographs reviewed by moderation team." },
  DOCS_SUBMITTED: { label: "Documents Submitted", badgeColor: "bg-amber-50 text-amber-800 border-amber-200", description: "Seller has uploaded Patta/EC/Approval documents awaiting formal review." },
  INDEPENDENTLY_VERIFIED: { label: "Independently Verified", badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300", description: "Land revenue records (Patta/Chitta/EC) independently verified against government records." }
} as const;

export const USER_ROLES = ["BUYER", "SELLER", "AGENT", "BUILDER", "ADMIN"] as const;
export type UserRole = typeof USER_ROLES[number];

export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, "")} Cr`;
  }
  if (amount >= 100000) {
    const l = (amount / 100000).toFixed(2);
    return `₹${l.replace(/\.00$/, "")} Lac`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
