import { UserRole } from "@/lib/constants";
export type { UserRole };

export type ListingType = "SALE" | "RENT" | "LEASE";

export type PropertyCategoryType = 
  | "RESIDENTIAL_PLOT" 
  | "AGRICULTURAL_LAND" 
  | "HOUSE" 
  | "APARTMENT" 
  | "VILLA" 
  | "COMMERCIAL_PLOT" 
  | "COMMERCIAL_BUILDING" 
  | "INDUSTRIAL";

export type VerificationLevel = 
  | "UNREVIEWED" 
  | "CONTACT_VERIFIED" 
  | "INFO_REVIEWED" 
  | "DOCS_SUBMITTED" 
  | "INDEPENDENTLY_VERIFIED";

export type PropertyStatus = 
  | "DRAFT" 
  | "SUBMITTED"
  | "PENDING_VERIFICATION"
  | "NEEDS_MORE_INFORMATION"
  | "APPROVED"
  | "PUBLISHED"
  | "PENDING" 
  | "ACTIVE" 
  | "REJECTED" 
  | "EXPIRED" 
  | "SOLD" 
  | "RENTED"
  | "DEACTIVATED";

export interface PropertyImageItem {
  id: string;
  url: string;
  caption?: string;
  isPrimary?: boolean;
  order?: number;
}

export type FurnishingStatus = "Unfurnished" | "Semi-Furnished" | "Fully-Furnished";

export interface PropertyItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyCategoryType;
  price: number;
  pricePerUnit: string;
  area: number;
  areaUnit: string;
  builtUpArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: FurnishingStatus;
  facing?: "North" | "South" | "East" | "West" | "North-East" | "North-West" | "South-East" | "South-West";
  roadWidthFt?: number;
  plotDimensions?: string;
  surveyNumber?: string;
  landClassification?: string;
  documentStatus?: string;
  utilities?: string[];
  approvalStatus: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
  latitude?: number;
  longitude?: number;
  referenceNumber?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  idempotencyKey?: string;
  status: PropertyStatus;
  isFeatured: boolean;
  verificationStatus: VerificationLevel;
  sellerId: string;
  sellerName: string;
  sellerType: "OWNER" | "AGENT" | "BUILDER";
  sellerPhone: string;
  sellerEmail: string;
  sellerWhatsapp?: string;
  rejectionReason?: string;
  packageId?: string;
  amenities: string[];
  images: PropertyImageItem[];
  viewsCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface EnquiryItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  buyerId?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  sellerId: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "CLOSED";
  sellerReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyReportItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterName: string;
  reporterEmail?: string;
  reason: string;
  details: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export interface ListingPackageItem {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  listingLimit: number;
  isFeatured: boolean;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  createdAt: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  passwordHash?: string | null;
  role: UserRole;
  isSuspended?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    bio?: string | null;
    companyName?: string | null;
    taxId?: string | null;
    reraRegistration?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pinCode?: string | null;
    isPhoneVerified?: boolean;
    isEmailVerified?: boolean;
  } | null;
}

export interface LoginActivityItem {
  id: string;
  userId?: string | null;
  userName?: string | null;
  email: string;
  role?: string | null;
  eventType: string; // "LOGIN_OTP" | "LOGIN_PASSWORD" | "REGISTER_INITIAL"
  status: "SUCCESS" | "FAILED";
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface LocationItem {
  id: string;
  city: string;
  state: string;
  popularLocalities: string[];
  count: number;
  isActive: boolean;
}

export interface ContentBannerItem {
  id: string;
  key: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  updatedAt: string;
}

export interface PaymentRecordItem {
  id: string;
  orderId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId?: string;
  packageName?: string;
  propertyId?: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED";
  gateway: string;
  gatewayPaymentId?: string;
  signature?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface SearchFilters {
  city?: string;
  locality?: string;
  propertyType?: string;
  categories?: PropertyCategoryType[];
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  bedrooms?: number;
  furnishing?: FurnishingStatus | "all";
  sellerType?: "OWNER" | "AGENT" | "BUILDER" | "all" | string;
  verifiedOnly?: boolean;
  sortBy?: "recommended" | "newest" | "price_asc" | "price_desc" | "area_desc" | "price-asc" | "price-desc" | "area-desc";
  page?: number;
  limit?: number;
}
