-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'AGENT', 'BUILDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('OWNER', 'AGENT', 'BUILDER');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT', 'LEASE');

-- CreateEnum
CREATE TYPE "PropertyCategoryType" AS ENUM ('RESIDENTIAL_PLOT', 'AGRICULTURAL_LAND', 'HOUSE', 'APARTMENT', 'VILLA', 'COMMERCIAL_PLOT', 'COMMERCIAL_BUILDING', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED', 'EXPIRED', 'SOLD');

-- CreateEnum
CREATE TYPE "VerificationLevel" AS ENUM ('UNREVIEWED', 'CONTACT_VERIFIED', 'INFO_REVIEWED', 'DOCS_SUBMITTED', 'INDEPENDENTLY_VERIFIED');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('Unfurnished', 'Semi-Furnished', 'Fully-Furnished');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "companyName" TEXT,
    "taxId" TEXT,
    "reraRegistration" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT DEFAULT 'Tamil Nadu',
    "pinCode" TEXT,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "reraNumber" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyMember" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "listingType" "ListingType" NOT NULL DEFAULT 'SALE',
    "propertyType" "PropertyCategoryType" NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "pricePerUnit" TEXT,
    "area" DECIMAL(12,2) NOT NULL,
    "areaUnit" TEXT NOT NULL DEFAULT 'sqft',
    "builtUpArea" DECIMAL(12,2),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "furnishing" "FurnishingStatus",
    "facing" TEXT,
    "roadWidthFt" DECIMAL(6,2),
    "plotDimensions" TEXT,
    "surveyNumber" TEXT,
    "landClassification" TEXT,
    "documentStatus" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'Seller Declared',
    "address" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "pinCode" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
    "verificationStatus" "VerificationLevel" NOT NULL DEFAULT 'UNREVIEWED',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "sellerType" "SellerType" NOT NULL DEFAULT 'OWNER',
    "packageId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "storageProvider" TEXT NOT NULL DEFAULT 'cloudinary',
    "storageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyAmenity" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedProperty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "buyerId" TEXT,
    "sellerId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerPhone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "listingLimit" INTEGER NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "features" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "gateway" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "gatewayPaymentId" TEXT,
    "gatewayOrderId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyReport" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT,
    "reporterName" TEXT NOT NULL,
    "reporterEmail" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRecord" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "verifierId" TEXT,
    "level" "VerificationLevel" NOT NULL,
    "notes" TEXT,
    "documentChecked" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ENQUIRY',
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE INDEX "Agency_city_idx" ON "Agency"("city");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyMember_agencyId_userId_key" ON "AgencyMember"("agencyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");

-- CreateIndex
CREATE INDEX "Property_locality_idx" ON "Property"("locality");

-- CreateIndex
CREATE INDEX "Property_propertyType_idx" ON "Property"("propertyType");

-- CreateIndex
CREATE INDEX "Property_listingType_idx" ON "Property"("listingType");

-- CreateIndex
CREATE INDEX "Property_price_idx" ON "Property"("price");

-- CreateIndex
CREATE INDEX "Property_area_idx" ON "Property"("area");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE INDEX "Property_isFeatured_idx" ON "Property"("isFeatured");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "Property"("createdAt");

-- CreateIndex
CREATE INDEX "PropertyImage_propertyId_idx" ON "PropertyImage"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyImage_isPrimary_idx" ON "PropertyImage"("isPrimary");

-- CreateIndex
CREATE INDEX "PropertyAmenity_propertyId_idx" ON "PropertyAmenity"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAmenity_propertyId_name_key" ON "PropertyAmenity"("propertyId", "name");

-- CreateIndex
CREATE INDEX "SavedProperty_userId_idx" ON "SavedProperty"("userId");

-- CreateIndex
CREATE INDEX "SavedProperty_propertyId_idx" ON "SavedProperty"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedProperty_userId_propertyId_key" ON "SavedProperty"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "Enquiry_propertyId_idx" ON "Enquiry"("propertyId");

-- CreateIndex
CREATE INDEX "Enquiry_sellerId_idx" ON "Enquiry"("sellerId");

-- CreateIndex
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_status_idx" ON "Enquiry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ListingPackage_slug_key" ON "ListingPackage"("slug");

-- CreateIndex
CREATE INDEX "ListingPackage_isActive_idx" ON "ListingPackage"("isActive");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_gatewayOrderId_idx" ON "Payment"("gatewayOrderId");

-- CreateIndex
CREATE INDEX "PropertyReport_propertyId_idx" ON "PropertyReport"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyReport_status_idx" ON "PropertyReport"("status");

-- CreateIndex
CREATE INDEX "VerificationRecord_propertyId_idx" ON "VerificationRecord"("propertyId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyMember" ADD CONSTRAINT "AgencyMember_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyMember" ADD CONSTRAINT "AgencyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ListingPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyAmenity" ADD CONSTRAINT "PropertyAmenity_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedProperty" ADD CONSTRAINT "SavedProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedProperty" ADD CONSTRAINT "SavedProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ListingPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyReport" ADD CONSTRAINT "PropertyReport_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyReport" ADD CONSTRAINT "PropertyReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRecord" ADD CONSTRAINT "VerificationRecord_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
