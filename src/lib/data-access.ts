// =============================================================================
// Landora Real Estate & Land-Selling Marketplace
// Centralized, Secure Data-Access Layer (PostgreSQL via Prisma ORM)
// =============================================================================

import prisma from "./prisma";
import { 
  PropertyItem, 
  SearchFilters, 
  PropertyStatus, 
  VerificationLevel, 
  ListingType, 
  PropertyCategoryType, 
  UserItem, 
  NotificationItem, 
  UserRole,
  AuditLogItem,
  LocationItem,
  ContentBannerItem,
  PaymentRecordItem,
  ListingPackageItem,
  PropertyReportItem,
  LoginActivityItem
} from "@/types";
import { 
  PropertyStore, 
  EnquiryStore, 
  ReportStore, 
  SavedPropertyStore, 
  UserStore, 
  NotificationStore,
  PackageStore,
  AuditStore,
  LocationStore,
  ContentStore,
  PaymentStore,
  LoginActivityStore,
  CommunicationConsentStore,
  NotificationDeliveryLogStore
} from "./store";
import { normalizeAreaToSqft } from "./constants";
import { 
  sendListingModerationEmail, 
  sendNewEnquiryEmail, 
  sendEnquiryConfirmationEmail,
  sendListingExpiryReminderEmail,
  sendAdminUserLoginNotificationEmail
} from "./email";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// Convert a Prisma Property record (with Decimal types and relations) to frontend PropertyItem
export function mapPrismaPropertyToItem(record: any): PropertyItem {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    listingType: record.listingType as ListingType,
    propertyType: record.propertyType as PropertyCategoryType,
    price: Number(record.price),
    pricePerUnit: record.pricePerUnit || "",
    area: Number(record.area),
    areaUnit: record.areaUnit || "sqft",
    builtUpArea: record.builtUpArea ? Number(record.builtUpArea) : undefined,
    bedrooms: record.bedrooms ?? undefined,
    bathrooms: record.bathrooms ?? undefined,
    furnishing: record.furnishing ?? undefined,
    facing: record.facing ?? undefined,
    roadWidthFt: record.roadWidthFt ? Number(record.roadWidthFt) : undefined,
    plotDimensions: record.plotDimensions ?? undefined,
    surveyNumber: record.surveyNumber ?? undefined,
    landClassification: record.landClassification ?? undefined,
    documentStatus: record.documentStatus ?? undefined,
    approvalStatus: record.approvalStatus || "Seller Declared",
    address: record.address,
    locality: record.locality,
    city: record.city,
    state: record.state || "Tamil Nadu",
    pinCode: record.pinCode,
    latitude: record.latitude ? Number(record.latitude) : undefined,
    longitude: record.longitude ? Number(record.longitude) : undefined,
    status: record.status as PropertyStatus,
    isFeatured: record.isFeatured,
    verificationStatus: record.verificationStatus as VerificationLevel,
    sellerId: record.ownerId || "owner-01",
    sellerName: record.owner?.name || "Landowner",
    sellerType: record.sellerType || "OWNER",
    sellerPhone: record.owner?.phoneNumber || "+91 94433 12345",
    sellerEmail: record.owner?.email || "contact@landora.in",
    amenities: record.amenities ? record.amenities.map((a: any) => a.name) : [],
    images: record.images && record.images.length > 0 
      ? record.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
          isPrimary: img.isPrimary,
          order: img.order
        }))
      : [{ id: "fallback", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop", isPrimary: true }],
    viewsCount: record.viewsCount || 0,
    publishedAt: record.publishedAt ? new Date(record.publishedAt).toISOString() : new Date().toISOString(),
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export const DataAccess = {
  // Query properties with safe server-side filters, sorting & pagination
  async getProperties(filters?: SearchFilters): Promise<PaginatedResult<PropertyItem>> {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(50, filters?.limit || 9));
    const skip = (page - 1) * limit;

    // Check if database URL is configured
    if (process.env.DATABASE_URL) {
      try {
        const where: any = {
          status: "ACTIVE",
        };

        if (filters?.city && filters.city !== "All" && filters.city !== "all") {
          where.OR = [
            { city: { contains: filters.city, mode: "insensitive" } },
            { locality: { contains: filters.city, mode: "insensitive" } },
          ];
        }

        if (filters?.locality && filters.locality !== "All" && filters.locality !== "all") {
          where.locality = { contains: filters.locality, mode: "insensitive" };
        }

        if (filters?.propertyType && filters.propertyType !== "all" && filters.propertyType !== "ALL") {
          where.propertyType = filters.propertyType;
        }

        if (filters?.categories && filters.categories.length > 0) {
          where.propertyType = { in: filters.categories };
        }

        if (filters?.listingType) {
          where.listingType = filters.listingType;
        }

        if (filters?.minPrice || filters?.maxPrice) {
          where.price = {};
          if (filters.minPrice) where.price.gte = filters.minPrice;
          if (filters.maxPrice) where.price.lte = filters.maxPrice;
        }

        if (filters?.bedrooms && filters.bedrooms > 0) {
          where.bedrooms = filters.bedrooms >= 5 ? { gte: 5 } : filters.bedrooms;
        }

        if (filters?.furnishing && filters.furnishing !== "all") {
          where.furnishing = filters.furnishing === "Semi-Furnished" ? "Semi_Furnished" : filters.furnishing === "Fully-Furnished" ? "Fully_Furnished" : "Unfurnished";
        }

        if (filters?.sellerType && filters.sellerType !== "all") {
          where.sellerType = filters.sellerType;
        }

        if (filters?.verifiedOnly) {
          where.verificationStatus = { in: ["INDEPENDENTLY_VERIFIED", "INFO_REVIEWED"] };
        }

        // Sorting
        let orderBy: any = [{ isFeatured: "desc" }, { createdAt: "desc" }];
        if (filters?.sortBy === "newest") {
          orderBy = [{ createdAt: "desc" }];
        } else if (filters?.sortBy === "price_asc") {
          orderBy = [{ price: "asc" }];
        } else if (filters?.sortBy === "price_desc") {
          orderBy = [{ price: "desc" }];
        } else if (filters?.sortBy === "area_desc") {
          orderBy = [{ area: "desc" }];
        }

        const [records, total] = await Promise.all([
          prisma.property.findMany({
            where,
            include: {
              images: { orderBy: { order: "asc" } },
              amenities: true,
              owner: {
                select: { id: true, name: true, phoneNumber: true, email: true },
              },
            },
            orderBy,
            skip,
            take: limit,
          }),
          prisma.property.count({ where }),
        ]);

        if (records.length > 0) {
          const data = records.map(mapPrismaPropertyToItem);
          const totalPages = Math.ceil(total / limit) || 1;
          return { data, total, page, totalPages, limit };
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL query error, falling back to in-memory store:", err);
      }
    }

    // In-Memory store fallback
    const result = PropertyStore.getAll(filters);
    return {
      data: result.properties,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit,
    };
  },

  // Get single property by unique slug or ID
  async getPropertyBySlug(slugOrId: string): Promise<PropertyItem | null> {
    if (process.env.DATABASE_URL) {
      try {
        const record = await prisma.property.findFirst({
          where: {
            OR: [{ slug: slugOrId }, { id: slugOrId }],
          },
          include: {
            images: { orderBy: { order: "asc" } },
            amenities: true,
            owner: {
              select: { id: true, name: true, phoneNumber: true, email: true },
            },
          },
        });

        if (record) {
          return mapPrismaPropertyToItem(record);
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getPropertyBySlug error, falling back to in-memory store:", err);
      }
    }

    return PropertyStore.getBySlug(slugOrId);
  },

  // Get featured properties for homepage (Plots prioritized as #1)
  async getFeaturedProperties(limit = 6): Promise<PropertyItem[]> {
    const result = await this.getProperties({ limit: 20 });
    const isPlotCategory = (type: string) => 
      type === "RESIDENTIAL_PLOT" || type === "AGRICULTURAL_LAND" || type === "COMMERCIAL_PLOT" || type === "INDUSTRIAL";
    const sorted = [...result.data].sort((a, b) => {
      const aIsPlot = isPlotCategory(a.propertyType) ? 1 : 0;
      const bIsPlot = isPlotCategory(b.propertyType) ? 1 : 0;
      if (aIsPlot !== bIsPlot) return bIsPlot - aIsPlot;
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted.slice(0, limit);
  },

  // Get prime plots specifically for dedicated plot spotlight
  async getFeaturedPlots(limit = 4): Promise<PropertyItem[]> {
    const result = await this.getProperties({
      categories: ["RESIDENTIAL_PLOT", "AGRICULTURAL_LAND", "COMMERCIAL_PLOT"],
      limit
    });
    return result.data.slice(0, limit);
  },

  // Get recently added properties for homepage (Section E)
  async getRecentProperties(limit = 4): Promise<PropertyItem[]> {
    const result = await this.getProperties({ sortBy: "newest", limit });
    return result.data.slice(0, limit);
  },

  // Create new enquiry
  async createEnquiry(data: {
    propertyId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    message: string;
    sellerId: string;
  }): Promise<{ success: boolean; enquiryId?: string; error?: string }> {
    // Validate inputs
    if (!data.buyerName || data.buyerName.trim().length < 2) {
      return { success: false, error: "Please provide a valid name." };
    }
    if (!data.buyerPhone || data.buyerPhone.replace(/\D/g, "").length < 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number." };
    }

    if (process.env.DATABASE_URL) {
      try {
        const prop = await prisma.property.findUnique({
          where: { id: data.propertyId },
          select: { id: true, title: true, locality: true, city: true, price: true, ownerId: true },
        });

        if (prop) {
          const enq = await prisma.enquiry.create({
            data: {
              propertyId: prop.id,
              sellerId: prop.ownerId,
              buyerName: data.buyerName.trim(),
              buyerEmail: data.buyerEmail.toLowerCase().trim(),
              buyerPhone: data.buyerPhone.trim(),
              message: data.message.trim(),
              status: "NEW",
            },
          });

          // Trigger notifications and emails
          await this.createNotification({
            userId: prop.ownerId,
            title: `New Lead: ${data.buyerName}`,
            message: `${data.buyerName} enquired about "${prop.title}". Mobile: ${data.buyerPhone}`,
            type: "NEW_ENQUIRY",
            link: "/dashboard/seller/enquiries",
            entityType: "ENQUIRY",
            entityId: enq.id,
          });

          await sendNewEnquiryEmail(
            "seller@landora.in",
            "Property Owner",
            prop.title,
            data.buyerName,
            data.buyerPhone,
            data.buyerEmail,
            data.message,
            enq.id
          );

          await sendEnquiryConfirmationEmail(
            data.buyerEmail,
            data.buyerName,
            prop.title,
            "Property Owner"
          );

          return { success: true, enquiryId: enq.id };
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL createEnquiry error, falling back to in-memory store:", err);
      }
    }

    const inMem = EnquiryStore.create(data as any);
    if (inMem.success && inMem.enquiry) {
      const property = await this.getPropertyById(data.propertyId);
      const propTitle = property?.title || "Property Listing";

      await this.createNotification({
        userId: data.sellerId || property?.sellerId || "user-seller-01",
        title: `New Lead: ${data.buyerName}`,
        message: `${data.buyerName} enquired about "${propTitle}". Mobile: ${data.buyerPhone}`,
        type: "NEW_ENQUIRY",
        link: "/dashboard/seller/enquiries",
        entityType: "ENQUIRY",
        entityId: inMem.enquiry.id,
      });

      await sendNewEnquiryEmail(
        property?.sellerEmail || "seller@landora.in",
        property?.sellerName || "Property Owner",
        propTitle,
        data.buyerName,
        data.buyerPhone,
        data.buyerEmail,
        data.message,
        inMem.enquiry.id
      );

      await sendEnquiryConfirmationEmail(
        data.buyerEmail,
        data.buyerName,
        propTitle,
        property?.sellerName || "Property Owner"
      );
    }

    return {
      success: inMem.success,
      enquiryId: inMem.enquiry?.id,
      error: inMem.error,
    };
  },

  // Create report
  async createReport(data: {
    propertyId: string;
    reporterName: string;
    reporterEmail?: string;
    reason: string;
    details: string;
  }): Promise<{ success: boolean; reportId?: string; error?: string }> {
    if (process.env.DATABASE_URL) {
      try {
        const rep = await prisma.propertyReport.create({
          data: {
            propertyId: data.propertyId,
            reporterName: data.reporterName,
            reporterEmail: data.reporterEmail,
            reason: data.reason,
            details: data.details,
            status: "OPEN",
          },
        });
        return { success: true, reportId: rep.id };
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL createReport error, falling back to in-memory store:", err);
      }
    }

    const inMem = ReportStore.create(data as any);
    return {
      success: inMem.success,
      reportId: inMem.report?.id,
      error: inMem.error,
    };
  },

  // ---------------------------------------------------------------------------
  // User Authentication & Profile
  // ---------------------------------------------------------------------------
  async ensureInitialAdminUser(): Promise<UserItem> {
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || "vinichn2026@gmail.com").toLowerCase().trim();
    if (process.env.DATABASE_URL) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: adminEmail },
          include: { profile: true },
        });
        if (existing) {
          if (existing.role !== "ADMIN") {
            await prisma.user.update({
              where: { id: existing.id },
              data: { role: "ADMIN" },
            });
          }
          return {
            id: existing.id,
            name: existing.name,
            email: existing.email,
            phoneNumber: existing.phoneNumber,
            passwordHash: existing.passwordHash,
            role: "ADMIN",
            createdAt: existing.createdAt.toISOString(),
            updatedAt: existing.updatedAt.toISOString(),
            profile: existing.profile ? {
              bio: existing.profile.bio,
              companyName: existing.profile.companyName,
              taxId: existing.profile.taxId,
              reraRegistration: existing.profile.reraRegistration,
              address: existing.profile.address,
              city: existing.profile.city,
              state: existing.profile.state,
              pinCode: existing.profile.pinCode,
              isPhoneVerified: existing.profile.isPhoneVerified,
              isEmailVerified: existing.profile.isEmailVerified,
            } : null,
          };
        }

        const created = await prisma.user.create({
          data: {
            id: "user-admin-vinitha",
            name: "Vinitha (Administrator)",
            email: adminEmail,
            phoneNumber: "+91 94433 00001",
            role: "ADMIN",
            profile: {
              create: {
                city: "Coimbatore",
                state: "Tamil Nadu",
                isPhoneVerified: true,
                isEmailVerified: true,
              },
            },
          },
          include: { profile: true },
        });

        return {
          id: created.id,
          name: created.name,
          email: created.email,
          phoneNumber: created.phoneNumber,
          passwordHash: created.passwordHash,
          role: "ADMIN",
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
          profile: created.profile ? {
            bio: created.profile.bio,
            companyName: created.profile.companyName,
            taxId: created.profile.taxId,
            reraRegistration: created.profile.reraRegistration,
            address: created.profile.address,
            city: created.profile.city,
            state: created.profile.state,
            pinCode: created.profile.pinCode,
            isPhoneVerified: created.profile.isPhoneVerified,
            isEmailVerified: created.profile.isEmailVerified,
          } : null,
        };
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL ensureInitialAdminUser error:", err);
      }
    }

    let memoryUser = UserStore.findByEmail(adminEmail);
    if (!memoryUser) {
      memoryUser = UserStore.create({
        name: "Vinitha (Administrator)",
        email: adminEmail,
        phoneNumber: "+91 94433 00001",
        role: "ADMIN",
        profile: {
          city: "Coimbatore",
          state: "Tamil Nadu",
          isPhoneVerified: true,
          isEmailVerified: true,
        },
      });
    } else if (memoryUser.role !== "ADMIN") {
      memoryUser.role = "ADMIN";
    }
    return memoryUser;
  },

  async findUserByEmail(email: string): Promise<UserItem | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || "vinichn2026@gmail.com").toLowerCase().trim();

    if (process.env.DATABASE_URL) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { profile: true },
        });
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            passwordHash: user.passwordHash,
            role: user.role as UserRole,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            profile: user.profile ? {
              bio: user.profile.bio,
              companyName: user.profile.companyName,
              taxId: user.profile.taxId,
              reraRegistration: user.profile.reraRegistration,
              address: user.profile.address,
              city: user.profile.city,
              state: user.profile.state,
              pinCode: user.profile.pinCode,
              isPhoneVerified: user.profile.isPhoneVerified,
              isEmailVerified: user.profile.isEmailVerified,
            } : null,
          };
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL findUserByEmail error:", err);
      }
    }

    const found = UserStore.findByEmail(normalizedEmail);
    if (!found && normalizedEmail === adminEmail) {
      return this.ensureInitialAdminUser();
    }
    return found;
  },

  async findUserByPhone(phone: string): Promise<UserItem | null> {
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (!digits || digits.length < 10) return null;

    if (process.env.DATABASE_URL) {
      try {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phoneNumber: phone },
              { phoneNumber: `+91${digits}` },
              { phoneNumber: digits },
            ],
          },
          include: { profile: true },
        });
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            passwordHash: user.passwordHash,
            role: user.role as UserRole,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            profile: user.profile ? {
              bio: user.profile.bio,
              companyName: user.profile.companyName,
              taxId: user.profile.taxId,
              reraRegistration: user.profile.reraRegistration,
              address: user.profile.address,
              city: user.profile.city,
              state: user.profile.state,
              pinCode: user.profile.pinCode,
              isPhoneVerified: user.profile.isPhoneVerified,
              isEmailVerified: user.profile.isEmailVerified,
            } : null,
          };
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL findUserByPhone error:", err);
      }
    }

    return UserStore.findByPhone(phone);
  },

  async markPhoneVerified(userId: string, phoneNumber: string): Promise<boolean> {
    if (process.env.DATABASE_URL) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            phoneNumber,
            profile: {
              upsert: {
                create: { isPhoneVerified: true },
                update: { isPhoneVerified: true },
              },
            },
          },
        });
        return true;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL markPhoneVerified error:", err);
      }
    }

    const user = UserStore.findById(userId);
    if (user) {
      user.phoneNumber = phoneNumber;
      if (!user.profile) {
        user.profile = {
          bio: null,
          companyName: null,
          taxId: null,
          reraRegistration: null,
          address: null,
          city: "Coimbatore",
          state: "Tamil Nadu",
          pinCode: null,
          isPhoneVerified: true,
          isEmailVerified: false,
        };
      } else {
        user.profile.isPhoneVerified = true;
      }
      return true;
    }
    return false;
  },

  async findUserById(id: string): Promise<UserItem | null> {
    if (process.env.DATABASE_URL) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
          include: { profile: true },
        });
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            passwordHash: user.passwordHash,
            role: user.role as UserRole,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            profile: user.profile ? {
              bio: user.profile.bio,
              companyName: user.profile.companyName,
              taxId: user.profile.taxId,
              reraRegistration: user.profile.reraRegistration,
              address: user.profile.address,
              city: user.profile.city,
              state: user.profile.state,
              pinCode: user.profile.pinCode,
              isPhoneVerified: user.profile.isPhoneVerified,
              isEmailVerified: user.profile.isEmailVerified,
            } : null,
          };
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL findUserById error:", err);
      }
    }
    return UserStore.findById(id);
  },

  async createUser(data: {
    name: string;
    email: string;
    phoneNumber?: string;
    passwordHash?: string | null;
    role: UserRole;
    city?: string;
    state?: string;
  }): Promise<UserItem> {
    if (process.env.DATABASE_URL) {
      try {
        const created = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase().trim(),
            phoneNumber: data.phoneNumber?.trim() || null,
            passwordHash: data.passwordHash || null,
            role: data.role as any,
            profile: {
              create: {
                city: data.city || "Coimbatore",
                state: data.state || "Tamil Nadu",
                isPhoneVerified: false,
                isEmailVerified: false,
              },
            },
          },
          include: { profile: true },
        });
        return {
          id: created.id,
          name: created.name,
          email: created.email,
          phoneNumber: created.phoneNumber,
          passwordHash: created.passwordHash,
          role: created.role as UserRole,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
          profile: created.profile ? {
            city: created.profile.city,
            state: created.profile.state,
            isPhoneVerified: created.profile.isPhoneVerified,
            isEmailVerified: created.profile.isEmailVerified,
          } : null,
        };
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL createUser error:", err);
      }
    }
    return UserStore.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phoneNumber: data.phoneNumber || null,
      passwordHash: data.passwordHash || null,
      role: data.role,
      profile: {
        city: data.city || "Coimbatore",
        state: data.state || "Tamil Nadu",
        isPhoneVerified: false,
        isEmailVerified: false,
      },
    });
  },

  async updateUserProfile(userId: string, data: {
    name?: string;
    phoneNumber?: string;
    bio?: string;
    companyName?: string;
    reraRegistration?: string;
    taxId?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  }): Promise<UserItem | null> {
    if (process.env.DATABASE_URL) {
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(data.name ? { name: data.name } : {}),
            ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
            profile: {
              upsert: {
                create: {
                  bio: data.bio,
                  companyName: data.companyName,
                  reraRegistration: data.reraRegistration,
                  taxId: data.taxId,
                  address: data.address,
                  city: data.city || "Coimbatore",
                  state: data.state || "Tamil Nadu",
                  pinCode: data.pinCode,
                },
                update: {
                  ...(data.bio !== undefined ? { bio: data.bio } : {}),
                  ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
                  ...(data.reraRegistration !== undefined ? { reraRegistration: data.reraRegistration } : {}),
                  ...(data.taxId !== undefined ? { taxId: data.taxId } : {}),
                  ...(data.address !== undefined ? { address: data.address } : {}),
                  ...(data.city ? { city: data.city } : {}),
                  ...(data.state ? { state: data.state } : {}),
                  ...(data.pinCode !== undefined ? { pinCode: data.pinCode } : {}),
                },
              },
            },
          },
          include: { profile: true },
        });

        return {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          phoneNumber: updated.phoneNumber,
          role: updated.role as UserRole,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
          profile: updated.profile ? {
            bio: updated.profile.bio,
            companyName: updated.profile.companyName,
            taxId: updated.profile.taxId,
            reraRegistration: updated.profile.reraRegistration,
            address: updated.profile.address,
            city: updated.profile.city,
            state: updated.profile.state,
            pinCode: updated.profile.pinCode,
            isPhoneVerified: updated.profile.isPhoneVerified,
            isEmailVerified: updated.profile.isEmailVerified,
          } : null,
        };
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL updateUserProfile error:", err);
      }
    }
    return UserStore.updateProfile(userId, data);
  },

  async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    if (process.env.DATABASE_URL) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash },
        });
        return true;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL updateUserPassword error:", err);
      }
    }
    return UserStore.updatePassword(userId, passwordHash);
  },

  // ---------------------------------------------------------------------------
  // Saved Properties
  // ---------------------------------------------------------------------------
  async getUserSavedProperties(userId: string): Promise<PropertyItem[]> {
    if (process.env.DATABASE_URL) {
      try {
        const saved = await prisma.savedProperty.findMany({
          where: { userId },
          include: {
            property: {
              include: {
                images: { orderBy: { order: "asc" } },
                amenities: true,
                owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return saved.map((s: any) => mapPrismaPropertyToItem(s.property));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getUserSavedProperties error:", err);
      }
    }
    return SavedPropertyStore.getUserSavedProperties(userId);
  },

  async getUserSavedIds(userId: string): Promise<string[]> {
    if (process.env.DATABASE_URL) {
      try {
        const saved = await prisma.savedProperty.findMany({
          where: { userId },
          select: { propertyId: true },
        });
        return saved.map((s: any) => s.propertyId);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getUserSavedIds error:", err);
      }
    }
    return SavedPropertyStore.getUserSavedIds(userId);
  },

  async toggleSavedProperty(userId: string, propertyId: string): Promise<{ isSaved: boolean; count: number }> {
    if (!userId || !userId.trim()) {
      throw new Error("Authentication required to save properties.");
    }
    if (process.env.DATABASE_URL) {
      try {
        const existing = await prisma.savedProperty.findUnique({
          where: {
            userId_propertyId: { userId, propertyId },
          },
        });

        if (existing) {
          await prisma.savedProperty.delete({
            where: {
              userId_propertyId: { userId, propertyId },
            },
          });
          const count = await prisma.savedProperty.count({ where: { userId } });
          return { isSaved: false, count };
        } else {
          await prisma.savedProperty.create({
            data: { userId, propertyId },
          });
          const count = await prisma.savedProperty.count({ where: { userId } });
          return { isSaved: true, count };
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL toggleSavedProperty error:", err);
      }
    }
    return SavedPropertyStore.toggle(userId, propertyId);
  },

  // ---------------------------------------------------------------------------
  // User Enquiries & Notifications
  // ---------------------------------------------------------------------------
  async getUserEnquiries(userId: string, email: string): Promise<any[]> {
    if (process.env.DATABASE_URL) {
      try {
        const enqs = await prisma.enquiry.findMany({
          where: {
            OR: [{ buyerId: userId }, { buyerEmail: email.toLowerCase().trim() }],
          },
          include: {
            property: {
              select: { id: true, slug: true, title: true, price: true, locality: true, city: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return enqs.map((e: any) => ({
          id: e.id,
          propertyId: e.propertyId,
          propertyTitle: e.property?.title || "Property Listing",
          propertyLocation: `${e.property?.locality || ""}, ${e.property?.city || ""}`,
          propertyPrice: e.property ? Number(e.property.price) : 0,
          propertySlug: e.property?.slug,
          message: e.message,
          status: e.status,
          createdAt: e.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getUserEnquiries error:", err);
      }
    }
    return EnquiryStore.getByBuyer(email);
  },

  async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    if (process.env.DATABASE_URL) {
      try {
        const notifs = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        return notifs.map((n: any) => ({
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          entityType: n.entityType,
          entityId: n.entityId,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getUserNotifications error:", err);
      }
    }
    return NotificationStore.getByUser(userId);
  },

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    if (process.env.DATABASE_URL) {
      try {
        await prisma.notification.updateMany({
          where: { id, userId },
          data: { isRead: true },
        });
        return true;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL markNotificationRead error:", err);
      }
    }
    return NotificationStore.markRead(id, userId);
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    if (process.env.DATABASE_URL) {
      try {
        await prisma.notification.updateMany({
          where: { userId },
          data: { isRead: true },
        });
        return;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL markAllNotificationsRead error:", err);
      }
    }
    NotificationStore.markAllRead(userId);
  },

  // ---------------------------------------------------------------------------
  // Seller Listing Management & Moderation
  // ---------------------------------------------------------------------------
  async getSellerProperties(sellerId: string): Promise<PropertyItem[]> {
    if (process.env.DATABASE_URL) {
      try {
        const records = await prisma.property.findMany({
          where: { ownerId: sellerId },
          include: {
            images: { orderBy: { order: "asc" } },
            amenities: true,
            owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        return records.map(mapPrismaPropertyToItem);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getSellerProperties error:", err);
      }
    }
    return PropertyStore.getBySeller(sellerId);
  },

  async getSellerMetrics(sellerId: string) {
    const properties = await this.getSellerProperties(sellerId);
    const enquiries = await this.getSellerEnquiries(sellerId);

    const total = properties.length;
    const active = properties.filter(p => p.status === "ACTIVE").length;
    const pending = properties.filter(p => p.status === "PENDING").length;
    const draft = properties.filter(p => p.status === "DRAFT").length;
    const rejected = properties.filter(p => p.status === "REJECTED").length;
    const deactivated = properties.filter(p => p.status === "DEACTIVATED" || p.status === "SOLD").length;
    const totalViews = properties.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

    return {
      total,
      active,
      pending,
      draft,
      rejected,
      deactivated,
      enquiriesCount: enquiries.length,
      totalViews,
    };
  },

  async getPropertyById(id: string): Promise<PropertyItem | null> {
    if (process.env.DATABASE_URL) {
      try {
        const record = await prisma.property.findUnique({
          where: { id },
          include: {
            images: { orderBy: { order: "asc" } },
            amenities: true,
            owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
          },
        });
        if (record) return mapPrismaPropertyToItem(record);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getPropertyById error:", err);
      }
    }
    const list = globalThis.__landora_properties || [];
    return list.find(p => p.id === id) || null;
  },

  async createSellerProperty(data: Omit<PropertyItem, "id" | "slug" | "viewsCount" | "publishedAt" | "createdAt" | "updatedAt">): Promise<PropertyItem> {
    // Prevent duplicate submissions within short period
    const existingProps = await this.getSellerProperties(data.sellerId);
    const duplicate = existingProps.find(p => 
      p.title.toLowerCase().trim() === data.title.toLowerCase().trim() &&
      p.city.toLowerCase().trim() === data.city.toLowerCase().trim() &&
      p.area === data.area &&
      p.price === data.price
    );
    if (duplicate) {
      throw new Error("Duplicate listing detected: A property with the same title, price, and location already exists in your account.");
    }

    if (process.env.DATABASE_URL) {
      try {
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;
        const record = await prisma.property.create({
          data: {
            slug,
            title: data.title,
            description: data.description,
            listingType: data.listingType,
            propertyType: data.propertyType,
            price: data.price,
            pricePerUnit: data.pricePerUnit,
            area: data.area,
            areaUnit: data.areaUnit,
            builtUpArea: data.builtUpArea,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            furnishing: data.furnishing === "Semi-Furnished" ? "Semi_Furnished" : data.furnishing === "Fully-Furnished" ? "Fully_Furnished" : data.furnishing === "Unfurnished" ? "Unfurnished" : undefined,
            facing: data.facing,
            roadWidthFt: data.roadWidthFt,
            plotDimensions: data.plotDimensions,
            surveyNumber: data.surveyNumber,
            landClassification: data.landClassification,
            documentStatus: data.documentStatus,
            approvalStatus: data.approvalStatus || "Seller Declared",
            address: data.address,
            locality: data.locality,
            city: data.city,
            state: data.state || "Tamil Nadu",
            pinCode: data.pinCode,
            status: data.status === "DRAFT" ? "PENDING" : data.status as any,
            ownerId: data.sellerId,
            sellerType: data.sellerType,
            images: {
              create: data.images.map((img, idx) => ({
                url: img.url,
                caption: img.caption,
                isPrimary: img.isPrimary ?? (idx === 0),
                order: idx,
              })),
            },
            amenities: {
              create: (data.amenities || []).map(name => ({ name })),
            },
          },
          include: {
            images: { orderBy: { order: "asc" } },
            amenities: true,
            owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
          },
        });
        return mapPrismaPropertyToItem(record);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL createSellerProperty error:", err);
      }
    }

    return PropertyStore.create(data);
  },

  async updateSellerProperty(id: string, userId: string, updates: Partial<PropertyItem>, userRole?: string): Promise<PropertyItem> {
    const existing = await this.getPropertyById(id);
    if (!existing) {
      throw new Error("Property not found.");
    }

    // Ownership check
    if (existing.sellerId !== userId && userRole !== "ADMIN") {
      throw new Error("Unauthorized: You do not have permission to modify this listing.");
    }

    if (process.env.DATABASE_URL) {
      try {
        const record = await prisma.property.update({
          where: { id },
          data: {
            ...(updates.title ? { title: updates.title } : {}),
            ...(updates.description ? { description: updates.description } : {}),
            ...(updates.price !== undefined ? { price: updates.price } : {}),
            ...(updates.pricePerUnit !== undefined ? { pricePerUnit: updates.pricePerUnit } : {}),
            ...(updates.area !== undefined ? { area: updates.area } : {}),
            ...(updates.areaUnit ? { areaUnit: updates.areaUnit } : {}),
            ...(updates.builtUpArea !== undefined ? { builtUpArea: updates.builtUpArea } : {}),
            ...(updates.bedrooms !== undefined ? { bedrooms: updates.bedrooms } : {}),
            ...(updates.bathrooms !== undefined ? { bathrooms: updates.bathrooms } : {}),
            ...(updates.furnishing ? { furnishing: updates.furnishing === "Semi-Furnished" ? "Semi_Furnished" : updates.furnishing === "Fully-Furnished" ? "Fully_Furnished" : "Unfurnished" } : {}),
            ...(updates.facing ? { facing: updates.facing } : {}),
            ...(updates.roadWidthFt !== undefined ? { roadWidthFt: updates.roadWidthFt } : {}),
            ...(updates.plotDimensions !== undefined ? { plotDimensions: updates.plotDimensions } : {}),
            ...(updates.surveyNumber !== undefined ? { surveyNumber: updates.surveyNumber } : {}),
            ...(updates.landClassification !== undefined ? { landClassification: updates.landClassification } : {}),
            ...(updates.documentStatus !== undefined ? { documentStatus: updates.documentStatus } : {}),
            ...(updates.address ? { address: updates.address } : {}),
            ...(updates.locality ? { locality: updates.locality } : {}),
            ...(updates.city ? { city: updates.city } : {}),
            ...(updates.pinCode ? { pinCode: updates.pinCode } : {}),
            ...(updates.status ? { status: updates.status as any } : {}),
          },
          include: {
            images: { orderBy: { order: "asc" } },
            amenities: true,
            owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
          },
        });
        return mapPrismaPropertyToItem(record);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL updateSellerProperty error:", err);
      }
    }

    const updated = PropertyStore.update(id, updates);
    if (!updated) throw new Error("Property update failed.");
    return updated;
  },

  async associatePropertyToUser(propertyId: string, userId: string, sellerPhone: string): Promise<boolean> {
    if (process.env.DATABASE_URL) {
      try {
        await prisma.property.update({
          where: { id: propertyId },
          data: {
            ownerId: userId,
          },
        });
        return true;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL associatePropertyToUser error:", err);
      }
    }
    const updated = PropertyStore.update(propertyId, {
      sellerId: userId,
      sellerPhone: sellerPhone,
    });
    return !!updated;
  },

  async setListingStatus(id: string, userId: string, status: PropertyStatus, userRole?: string, rejectionReason?: string): Promise<PropertyItem> {
    const existing = await this.getPropertyById(id);
    if (!existing) throw new Error("Property not found.");

    // Regular users can only deactivate/reactivate/draft their own listings. Only admins can approve/reject.
    if (status === "ACTIVE" || status === "REJECTED") {
      if (userRole !== "ADMIN") {
        throw new Error("Only an administrator can approve or reject property listings for public display.");
      }
    } else {
      if (existing.sellerId !== userId && userRole !== "ADMIN") {
        throw new Error("Unauthorized to change status of this listing.");
      }
    }

    return this.updateSellerProperty(id, userId, { 
      status, 
      ...(rejectionReason !== undefined ? { rejectionReason } : {}) 
    }, userRole);
  },

  async getSellerEnquiries(sellerId: string): Promise<any[]> {
    if (process.env.DATABASE_URL) {
      try {
        const enquiries = await prisma.enquiry.findMany({
          where: { sellerId },
          include: {
            property: {
              select: { id: true, title: true, slug: true, locality: true, city: true, price: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return enquiries.map((e: any) => ({
          id: e.id,
          propertyId: e.propertyId,
          propertyTitle: e.property?.title,
          propertySlug: e.property?.slug,
          propertyLocation: `${e.property?.locality}, ${e.property?.city}`,
          propertyPrice: Number(e.property?.price),
          buyerName: e.buyerName,
          buyerEmail: e.buyerEmail,
          buyerPhone: e.buyerPhone,
          message: e.message,
          status: e.status,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getSellerEnquiries error:", err);
      }
    }
    return EnquiryStore.getBySeller(sellerId);
  },

  async respondToSellerEnquiry(enquiryId: string, sellerId: string, reply: string, status: "CONTACTED" | "FOLLOW_UP" | "CLOSED" = "CONTACTED"): Promise<any> {
    const enquiries = await this.getSellerEnquiries(sellerId);
    const enq = enquiries.find(e => e.id === enquiryId);
    if (!enq) {
      throw new Error("Enquiry not found or does not belong to your properties.");
    }

    if (process.env.DATABASE_URL) {
      try {
        const updated = await prisma.enquiry.update({
          where: { id: enquiryId },
          data: { status: status as any },
        });
        return updated;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL respondToSellerEnquiry error:", err);
      }
    }

    const updated = EnquiryStore.updateStatus(enquiryId, status);
    if (updated) {
      updated.sellerReply = reply;
      updated.repliedAt = new Date().toISOString();
    }
    return updated;
  },

  // ---------------------------------------------------------------------------
  // Administrator Operations & Dashboard
  // ---------------------------------------------------------------------------
  async getAdminMetrics() {
    let totalUsers = 0;
    let activeListings = 0;
    let pendingApprovals = 0;
    let rejectedListings = 0;
    let reportedListings = 0;
    let recentEnquiries = 0;

    if (process.env.DATABASE_URL) {
      try {
        [
          totalUsers,
          activeListings,
          pendingApprovals,
          rejectedListings,
          reportedListings,
          recentEnquiries,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.property.count({ where: { status: "ACTIVE" } }),
          prisma.property.count({ where: { status: "PENDING" } }),
          prisma.property.count({ where: { status: "REJECTED" } }),
          prisma.propertyReport.count(),
          prisma.enquiry.count(),
        ]);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getAdminMetrics error:", err);
      }
    }

    if (!totalUsers) {
      const allProps = globalThis.__landora_properties || [];
      totalUsers = (globalThis.__landora_users || []).length;
      activeListings = allProps.filter(p => !p.status || p.status === "ACTIVE").length;
      pendingApprovals = allProps.filter(p => p.status === "PENDING").length;
      rejectedListings = allProps.filter(p => p.status === "REJECTED").length;
      reportedListings = (globalThis.__landora_reports || []).length;
      recentEnquiries = (globalThis.__landora_enquiries || []).length;
    }

    const paymentMetrics = PaymentStore.getMetrics();

    return {
      totalUsers,
      activeListings,
      pendingApprovals,
      rejectedListings,
      reportedListings,
      recentEnquiries,
      paymentMetrics,
    };
  },

  async getAdminProperties(filters?: { status?: string; query?: string; city?: string; page?: number; limit?: number }) {
    if (process.env.DATABASE_URL) {
      try {
        const page = Math.max(1, filters?.page || 1);
        const limit = Math.max(1, Math.min(100, filters?.limit || 20));
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters?.status && filters.status !== "ALL" && filters.status !== "all") {
          where.status = filters.status.toUpperCase();
        }
        if (filters?.city && filters.city !== "ALL" && filters.city !== "all") {
          where.city = { contains: filters.city, mode: "insensitive" };
        }
        if (filters?.query) {
          where.OR = [
            { title: { contains: filters.query, mode: "insensitive" } },
            { locality: { contains: filters.query, mode: "insensitive" } },
            { city: { contains: filters.query, mode: "insensitive" } },
            { id: { contains: filters.query, mode: "insensitive" } },
          ];
        }

        const [records, total] = await Promise.all([
          prisma.property.findMany({
            where,
            include: {
              images: { orderBy: { order: "asc" } },
              amenities: true,
              owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.property.count({ where }),
        ]);

        return {
          data: records.map(mapPrismaPropertyToItem),
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
          limit,
        };
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getAdminProperties error:", err);
      }
    }

    const res = PropertyStore.getAllAdmin(filters);
    return {
      data: res.properties,
      total: res.total,
      page: res.page,
      totalPages: res.totalPages,
      limit: filters?.limit || 20,
    };
  },

  async moderateProperty(propertyId: string, action: "APPROVE" | "REJECT" | "DEACTIVATE" | "EXPIRE", reason?: string, adminName = "Platform Administrator") {
    const statusMap: Record<string, PropertyStatus> = {
      APPROVE: "ACTIVE",
      REJECT: "REJECTED",
      DEACTIVATE: "DEACTIVATED",
      EXPIRE: "EXPIRED",
    };
    const newStatus = statusMap[action];

    let updated: PropertyItem | null = null;
    if (process.env.DATABASE_URL) {
      try {
        const record = await prisma.property.update({
          where: { id: propertyId },
          data: {
            status: newStatus as any,
            ...(action === "APPROVE" ? { verificationStatus: "INFO_REVIEWED" } : {}),
          },
          include: {
            images: { orderBy: { order: "asc" } },
            amenities: true,
            owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
          },
        });
        updated = mapPrismaPropertyToItem(record);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL moderateProperty error:", err);
      }
    }

    if (!updated) {
      updated = PropertyStore.update(propertyId, { 
        status: newStatus,
        ...(reason ? { rejectionReason: reason } : {}),
        ...(action === "APPROVE" ? { verificationStatus: "INFO_REVIEWED" } : {})
      });
    }

    // Phase 9: In-app notification & Moderation Email to Seller
    if (updated && (action === "APPROVE" || action === "REJECT")) {
      const isApproved = action === "APPROVE";
      await this.createNotification({
        userId: updated.sellerId,
        title: isApproved ? "Listing Approved & Live" : "Listing Review: Changes Needed",
        message: isApproved
          ? `Your property "${updated.title}" has been approved and is now live to buyers.`
          : `Your listing "${updated.title}" was not approved: ${reason || "Documentation update needed."}`,
        type: isApproved ? "LISTING_APPROVED" : "LISTING_REJECTED",
        link: isApproved ? `/properties/${updated.slug}` : `/dashboard/seller/listings`,
        entityType: "PROPERTY",
        entityId: updated.id,
      });

      if (updated.sellerEmail) {
        await sendListingModerationEmail(
          updated.sellerEmail,
          updated.sellerName,
          updated.title,
          isApproved ? "ACTIVE" : "REJECTED",
          updated.slug,
          reason
        );
      }
    }

    // Log to Audit Log
    AuditStore.log(
      `MODERATE_PROPERTY_${action}`,
      "PROPERTY",
      propertyId,
      `Action: ${action}. New Status: ${newStatus}.${reason ? ` Reason: ${reason}` : ""}`,
      adminName
    );

    return updated;
  },

  async togglePropertyFeatured(propertyId: string, isFeatured: boolean, adminName = "Platform Administrator") {
    let updated: PropertyItem | null = null;
    if (process.env.DATABASE_URL) {
      try {
        const record = await prisma.property.update({
          where: { id: propertyId },
          data: { isFeatured },
          include: {
            images: { orderBy: { order: "asc" } },
            amenities: true,
            owner: { select: { id: true, name: true, phoneNumber: true, email: true } },
          },
        });
        updated = mapPrismaPropertyToItem(record);
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL togglePropertyFeatured error:", err);
      }
    }

    if (!updated) {
      updated = PropertyStore.update(propertyId, { isFeatured });
    }

    AuditStore.log(
      isFeatured ? "FEATURE_PROPERTY" : "UNFEATURE_PROPERTY",
      "PROPERTY",
      propertyId,
      `Set isFeatured to ${isFeatured}`,
      adminName
    );

    return updated;
  },

  async getAdminUsers(filters?: { role?: string; query?: string }) {
    if (process.env.DATABASE_URL) {
      try {
        const where: any = {};
        if (filters?.role && filters.role !== "ALL" && filters.role !== "all") {
          where.role = filters.role.toUpperCase();
        }
        if (filters?.query) {
          where.OR = [
            { name: { contains: filters.query, mode: "insensitive" } },
            { email: { contains: filters.query, mode: "insensitive" } },
            { phoneNumber: { contains: filters.query, mode: "insensitive" } },
          ];
        }

        const users = await prisma.user.findMany({
          where,
          include: { profile: true },
          orderBy: { createdAt: "desc" },
        });

        return users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phoneNumber: u.phoneNumber,
          role: u.role as UserRole,
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
          profile: u.profile,
          passwordHash: undefined,
        }));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getAdminUsers error:", err);
      }
    }

    let list = UserStore.getAll().map(u => ({ ...u, passwordHash: undefined }));
    if (filters?.role && filters.role !== "ALL" && filters.role !== "all") {
      list = list.filter(u => u.role === filters.role!.toUpperCase());
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phoneNumber && u.phoneNumber.includes(q)));
    }
    return list;
  },

  async updateUserRole(userId: string, newRole: UserRole, adminName = "Platform Administrator") {
    let updated: any = null;
    if (process.env.DATABASE_URL) {
      try {
        updated = await prisma.user.update({
          where: { id: userId },
          data: { role: newRole as any },
        });
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL updateUserRole error:", err);
      }
    }
    if (!updated) {
      updated = UserStore.updateRole(userId, newRole);
    }

    AuditStore.log("CHANGE_USER_ROLE", "USER", userId, `Changed role to ${newRole}`, adminName);
    return updated;
  },

  async toggleUserSuspension(userId: string, isSuspended: boolean, adminName = "Platform Administrator") {
    const updated = UserStore.toggleSuspension(userId, isSuspended);

    AuditStore.log(
      isSuspended ? "SUSPEND_USER" : "REACTIVATE_USER",
      "USER",
      userId,
      `User account ${isSuspended ? "suspended" : "reactivated"}`,
      adminName
    );
    return updated;
  },

  async getAdminReports() {
    if (process.env.DATABASE_URL) {
      try {
        const reports = await prisma.propertyReport.findMany({
          include: {
            property: {
              select: { id: true, title: true, slug: true, locality: true, city: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return reports.map((r: any) => ({
          id: r.id,
          propertyId: r.propertyId,
          propertyTitle: r.property?.title || "Property Listing",
          propertySlug: r.property?.slug,
          reporterName: r.reporterName,
          reporterEmail: r.reporterEmail,
          reason: r.reason,
          details: r.details,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getAdminReports error:", err);
      }
    }
    return ReportStore.getAll();
  },

  async updateReportStatus(reportId: string, status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED", notes?: string, adminName = "Platform Administrator") {
    if (process.env.DATABASE_URL) {
      try {
        await prisma.propertyReport.update({
          where: { id: reportId },
          data: { status: status as any, resolutionNotes: notes },
        });
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL updateReportStatus error:", err);
      }
    }
    ReportStore.updateStatus(reportId, status);
    AuditStore.log("UPDATE_REPORT_STATUS", "PROPERTY_REPORT", reportId, `Status: ${status}.${notes ? ` Notes: ${notes}` : ""}`, adminName);
    return true;
  },

  async getAdminLocations() {
    return LocationStore.getAll();
  },

  async createAdminLocation(data: Omit<LocationItem, "id">, adminName = "Platform Administrator") {
    const loc = LocationStore.create(data);
    AuditStore.log("CREATE_LOCATION", "LOCATION", loc.id, `Created hub: ${data.city}, ${data.state}`, adminName);
    return loc;
  },

  async updateAdminLocation(id: string, updates: Partial<LocationItem>, adminName = "Platform Administrator") {
    const loc = LocationStore.update(id, updates);
    AuditStore.log("UPDATE_LOCATION", "LOCATION", id, `Updated location details for ${loc?.city}`, adminName);
    return loc;
  },

  async deleteAdminLocation(id: string, adminName = "Platform Administrator") {
    const deleted = LocationStore.delete(id);
    AuditStore.log("DELETE_LOCATION", "LOCATION", id, "Deleted location hub from registry", adminName);
    return deleted;
  },

  async getAdminPackages() {
    return PackageStore.getAll();
  },

  async updateAdminPackage(id: string, updates: Partial<ListingPackageItem>, adminName = "Platform Administrator") {
    const pkg = PackageStore.update(id, updates);
    AuditStore.log("UPDATE_PACKAGE", "LISTING_PACKAGE", id, `Updated package configuration for ${pkg?.name}`, adminName);
    return pkg;
  },

  async getAdminContent() {
    return ContentStore.getBanners();
  },

  async updateAdminContent(key: string, updates: Partial<ContentBannerItem>, adminName = "Platform Administrator") {
    const content = ContentStore.updateBanner(key, updates);
    AuditStore.log("UPDATE_CONTENT", "CONTENT_BANNER", key, `Updated banner headline/copy for ${key}`, adminName);
    return content;
  },

  async getAdminPayments() {
    return {
      payments: PaymentStore.getAll(),
      metrics: PaymentStore.getMetrics(),
    };
  },

  async getAdminAuditLogs() {
    return AuditStore.getAll();
  },

  // ---------------------------------------------------------------------------
  // User Login Monitoring & Activity
  // ---------------------------------------------------------------------------
  async recordSuccessfulLogin(params: {
    userId?: string | null;
    email: string;
    userName?: string | null;
    role?: string | null;
    eventType: string; // "LOGIN_OTP" | "LOGIN_PASSWORD" | "REGISTER_INITIAL"
    ipAddress?: string | null;
    userAgent?: string | null;
    details?: string | null;
  }): Promise<LoginActivityItem> {
    const timestamp = new Date().toISOString();
    let recordedActivity: LoginActivityItem | null = null;

    // 1. PostgreSQL Persistence via Prisma
    if (process.env.DATABASE_URL) {
      try {
        const prismaActivity = await prisma.loginActivity.create({
          data: {
            userId: params.userId || undefined,
            email: params.email.toLowerCase().trim(),
            userName: params.userName || undefined,
            role: params.role || undefined,
            eventType: params.eventType,
            status: "SUCCESS",
            ipAddress: params.ipAddress || undefined,
            userAgent: params.userAgent ? params.userAgent.slice(0, 255) : undefined,
            details: params.details || undefined,
          },
        });

        // Update user's lastLoginAt timestamp in database
        if (params.userId) {
          await prisma.user.update({
            where: { id: params.userId },
            data: { lastLoginAt: new Date() },
          }).catch(() => {});
        }

        recordedActivity = {
          id: prismaActivity.id,
          userId: prismaActivity.userId,
          userName: prismaActivity.userName,
          email: prismaActivity.email,
          role: prismaActivity.role,
          eventType: prismaActivity.eventType,
          status: "SUCCESS",
          ipAddress: prismaActivity.ipAddress,
          userAgent: prismaActivity.userAgent,
          details: prismaActivity.details,
          createdAt: prismaActivity.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL recordSuccessfulLogin error:", err);
      }
    }

    // 2. In-Memory Store Persistence (Offline & Local Resilience)
    if (!recordedActivity) {
      recordedActivity = LoginActivityStore.create({
        userId: params.userId,
        userName: params.userName,
        email: params.email.toLowerCase().trim(),
        role: params.role,
        eventType: params.eventType,
        status: "SUCCESS",
        ipAddress: params.ipAddress,
        userAgent: params.userAgent ? params.userAgent.slice(0, 255) : undefined,
        details: params.details,
      });
    }

    // Update in-memory user lastLoginAt
    if (params.userId) {
      UserStore.recordLogin(params.userId);
    }

    // 3. System Audit Trail Logging
    AuditStore.log(
      params.eventType,
      "USER",
      params.userId || params.email,
      `User ${params.email} successfully logged in via ${params.eventType}.`,
      params.userName || params.email
    );

    // 4. Optional & Configurable Administrator Notification on Login
    // Controlled by NOTIFY_ADMIN_ON_LOGIN env variable (default is false)
    if (process.env.NOTIFY_ADMIN_ON_LOGIN === "true") {
      const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || "vinichn2026@gmail.com").toLowerCase().trim();
      sendAdminUserLoginNotificationEmail(adminEmail, {
        email: params.email,
        userName: params.userName || undefined,
        role: params.role || undefined,
        eventType: params.eventType,
        ipAddress: params.ipAddress,
        timestamp,
      }).catch(err => console.error("[DATA-ACCESS] sendAdminUserLoginNotificationEmail error:", err));
    }

    return recordedActivity;
  },

  async getAdminLoginActivities(limit = 50): Promise<LoginActivityItem[]> {
    if (process.env.DATABASE_URL) {
      try {
        const records = await prisma.loginActivity.findMany({
          take: limit,
          orderBy: { createdAt: "desc" },
        });

        return records.map((r: any) => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          email: r.email,
          role: r.role,
          eventType: r.eventType,
          status: "SUCCESS" as const,
          ipAddress: r.ipAddress,
          userAgent: r.userAgent,
          details: r.details,
          createdAt: r.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getAdminLoginActivities error:", err);
      }
    }

    return LoginActivityStore.getAll(limit);
  },

  async getAllEnquiriesPlatform() {
    if (process.env.DATABASE_URL) {
      try {
        const records = await prisma.enquiry.findMany({
          include: {
            property: {
              select: { id: true, title: true, slug: true, locality: true, city: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return records.map((e: any) => ({
          id: e.id,
          propertyId: e.propertyId,
          propertyTitle: e.property?.title,
          propertySlug: e.property?.slug,
          propertyLocation: `${e.property?.locality}, ${e.property?.city}`,
          propertyPrice: Number(e.property?.price),
          buyerName: e.buyerName,
          buyerEmail: e.buyerEmail,
          buyerPhone: e.buyerPhone,
          message: e.message,
          sellerId: e.sellerId,
          status: e.status,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getAllEnquiriesPlatform error:", err);
      }
    }
    return EnquiryStore.getAll();
  },

  // ---------------------------------------------------------------------------
  // PHASE 9: PAYMENTS & IN-APP NOTIFICATIONS
  // ---------------------------------------------------------------------------

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    entityType?: string;
    entityId?: string;
  }): Promise<NotificationItem> {
    if (process.env.DATABASE_URL) {
      try {
        const notif = await prisma.notification.create({
          data: {
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            entityType: data.entityType || null,
            entityId: data.entityId || null,
            isRead: false,
          },
        });
        return {
          id: notif.id,
          userId: notif.userId,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          link: data.link,
          entityType: notif.entityType,
          entityId: notif.entityId,
          isRead: notif.isRead,
          createdAt: notif.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL createNotification error:", err);
      }
    }
    return NotificationStore.create(data);
  },

  async createPaymentAttempt(data: {
    userId: string;
    userName: string;
    userEmail: string;
    packageId: string;
    packageName: string;
    amount: number;
    currency: string;
    orderId: string;
    propertyId?: string;
  }): Promise<PaymentRecordItem> {
    const attempt = PaymentStore.create({
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      packageId: data.packageId,
      packageName: data.packageName,
      amount: data.amount,
      currency: data.currency,
      orderId: data.orderId,
      propertyId: data.propertyId,
      status: "PENDING",
      gateway: "Razorpay",
    });

    AuditStore.log(
      "PAYMENT_ORDER_CREATED",
      "PAYMENT",
      attempt.id,
      `Created payment order ${data.orderId} for package ${data.packageName} (₹${data.amount})`,
      data.userName
    );

    return attempt;
  },

  async getPaymentByOrderId(orderId: string): Promise<PaymentRecordItem | null> {
    return PaymentStore.findByOrderId(orderId);
  },

  async completePayment(
    orderId: string,
    gatewayPaymentId: string,
    signature: string
  ): Promise<{ payment: PaymentRecordItem; alreadyProcessed: boolean }> {
    const existing = PaymentStore.findByOrderId(orderId);
    if (!existing) {
      throw new Error(`Payment order not found: ${orderId}`);
    }

    // Idempotency check: if already processed as SUCCESS, return immediately
    if (existing.status === "SUCCESS") {
      return { payment: existing, alreadyProcessed: true };
    }

    // Update payment record to SUCCESS
    const updated = PaymentStore.updateByOrderId(orderId, {
      status: "SUCCESS",
      gatewayPaymentId,
      signature,
    })!;

    // Activate paid benefits
    if (updated.propertyId) {
      await this.togglePropertyFeatured(updated.propertyId, true, "Landora Payments");
      PropertyStore.update(updated.propertyId, {
        packageId: updated.packageId,
        isFeatured: true,
      });
    }

    // Dispatch In-App Notification
    await this.createNotification({
      userId: updated.userId,
      title: "Payment Confirmed: Package Activated",
      message: `Your payment of ₹${updated.amount.toLocaleString("en-IN")} for ${updated.packageName || "Listing Package"} was confirmed. Benefits are now active!`,
      type: "PAYMENT_SUCCESS",
      link: updated.propertyId ? `/properties` : `/dashboard/packages`,
      entityType: "PAYMENT",
      entityId: updated.id,
    });

    // Audit log
    AuditStore.log(
      "PAYMENT_COMPLETED",
      "PAYMENT",
      updated.id,
      `Payment verified & confirmed for ${updated.packageName} (₹${updated.amount}). TxID: ${gatewayPaymentId}`,
      updated.userName
    );

    return { payment: updated, alreadyProcessed: false };
  },

  async failPayment(orderId: string, failureReason: string): Promise<PaymentRecordItem | null> {
    const existing = PaymentStore.findByOrderId(orderId);
    if (!existing) return null;

    if (existing.status === "SUCCESS") {
      // Do not overwrite a confirmed payment
      return existing;
    }

    const updated = PaymentStore.updateByOrderId(orderId, {
      status: "FAILED",
      failureReason,
    });

    if (updated) {
      await this.createNotification({
        userId: updated.userId,
        title: "Payment Incomplete",
        message: `Your payment for ${updated.packageName || "package"} could not be completed. Reason: ${failureReason}`,
        type: "PAYMENT_FAILED",
        link: `/dashboard/packages`,
        entityType: "PAYMENT",
        entityId: updated.id,
      });

      AuditStore.log(
        "PAYMENT_FAILED",
        "PAYMENT",
        updated.id,
        `Payment failed for order ${orderId}. Reason: ${failureReason}`,
        updated.userName
      );
    }

    return updated;
  },

  async refundPayment(orderId: string, reason = "Customer refund requested"): Promise<PaymentRecordItem | null> {
    const existing = PaymentStore.findByOrderId(orderId);
    if (!existing) return null;

    const updated = PaymentStore.updateByOrderId(orderId, {
      status: "REFUNDED",
      failureReason: reason,
    });

    if (updated) {
      if (updated.propertyId) {
        await this.togglePropertyFeatured(updated.propertyId, false, "Landora Payments Refund");
      }

      await this.createNotification({
        userId: updated.userId,
        title: "Payment Refund Processed",
        message: `Refund of ₹${updated.amount.toLocaleString("en-IN")} for ${updated.packageName} has been processed.`,
        type: "PAYMENT_REFUNDED",
        link: `/dashboard/packages`,
        entityType: "PAYMENT",
        entityId: updated.id,
      });

      AuditStore.log(
        "PAYMENT_REFUNDED",
        "PAYMENT",
        updated.id,
        `Payment refunded for order ${orderId}. Reason: ${reason}`,
        "System / Gateway Webhook"
      );
    }

    return updated;
  },

  async saveCommunicationConsent(data: {
    userId?: string | null;
    phoneNumber: string;
    transactionalSms?: boolean;
    transactionalWhatsapp?: boolean;
    promotionalOffers?: boolean;
    consentSource?: string;
    ipAddress?: string | null;
  }) {
    if (process.env.DATABASE_URL) {
      try {
        const existing = await prisma.communicationConsent.findFirst({
          where: { phoneNumber: data.phoneNumber },
        });
        if (existing) {
          return await prisma.communicationConsent.update({
            where: { id: existing.id },
            data: {
              userId: data.userId || existing.userId,
              transactionalSms: data.transactionalSms ?? existing.transactionalSms,
              transactionalWhatsapp: data.transactionalWhatsapp ?? existing.transactionalWhatsapp,
              promotionalOffers: data.promotionalOffers ?? existing.promotionalOffers,
              consentTimestamp: new Date(),
            },
          });
        }
        return await prisma.communicationConsent.create({
          data: {
            userId: data.userId || null,
            phoneNumber: data.phoneNumber,
            transactionalSms: data.transactionalSms ?? true,
            transactionalWhatsapp: data.transactionalWhatsapp ?? true,
            promotionalOffers: data.promotionalOffers ?? false,
            consentSource: data.consentSource || "POST_PROPERTY_FORM",
            ipAddress: data.ipAddress || null,
          },
        });
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL saveCommunicationConsent error:", err);
      }
    }
    return CommunicationConsentStore.save(data);
  },

  async getCommunicationConsent(phoneOrUserId: string) {
    if (process.env.DATABASE_URL) {
      try {
        const consent = await prisma.communicationConsent.findFirst({
          where: {
            OR: [
              { phoneNumber: phoneOrUserId },
              { userId: phoneOrUserId },
            ],
          },
        });
        if (consent) return consent;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getCommunicationConsent error:", err);
      }
    }
    return CommunicationConsentStore.findByPhone(phoneOrUserId) || CommunicationConsentStore.findByUserId(phoneOrUserId);
  },

  async logNotificationDelivery(data: {
    userId?: string | null;
    recipientPhone: string;
    channel: "SMS" | "WHATSAPP" | "EMAIL";
    eventType: string;
    templateName?: string;
    messageBody: string;
    status: "PENDING" | "QUEUED" | "SENT" | "DELIVERED" | "FAILED";
    provider?: string;
    providerMessageId?: string;
    deliveryResult?: string;
    errorInfo?: string;
    sentAt?: Date;
    deliveredAt?: Date;
  }) {
    if (process.env.DATABASE_URL) {
      try {
        return await prisma.notificationDeliveryLog.create({
          data: {
            userId: data.userId || null,
            recipientPhone: data.recipientPhone,
            channel: data.channel,
            eventType: data.eventType,
            templateName: data.templateName || null,
            messageBody: data.messageBody,
            status: data.status,
            provider: data.provider || null,
            providerMessageId: data.providerMessageId || null,
            deliveryResult: data.deliveryResult || null,
            errorInfo: data.errorInfo || null,
            sentAt: data.sentAt || null,
            deliveredAt: data.deliveredAt || null,
          },
        });
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL logNotificationDelivery error:", err);
      }
    }
    return NotificationDeliveryLogStore.create({
      ...data,
      sentAt: data.sentAt ? data.sentAt.toISOString() : null,
      deliveredAt: data.deliveredAt ? data.deliveredAt.toISOString() : null,
    });
  },

  async withdrawCommunicationConsent(phoneOrUserId: string, reason = "User requested withdrawal of communication consent"): Promise<boolean> {
    const now = new Date();
    if (process.env.DATABASE_URL) {
      try {
        const isPhone = phoneOrUserId.startsWith("+") || /^\d{10,}$/.test(phoneOrUserId.replace(/\D/g, ""));
        if (isPhone) {
          const digits = phoneOrUserId.replace(/\D/g, "").slice(-10);
          await prisma.communicationConsent.updateMany({
            where: {
              OR: [
                { phoneNumber: phoneOrUserId },
                { phoneNumber: `+91${digits}` },
                { phoneNumber: digits },
              ],
            },
            data: {
              transactionalSms: false,
              transactionalWhatsapp: false,
              promotionalOffers: false,
              optOutTimestamp: now,
              optOutReason: reason,
            },
          });
        } else {
          await prisma.communicationConsent.updateMany({
            where: { userId: phoneOrUserId },
            data: {
              transactionalSms: false,
              transactionalWhatsapp: false,
              promotionalOffers: false,
              optOutTimestamp: now,
              optOutReason: reason,
            },
          });
        }
        return true;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL withdrawCommunicationConsent error:", err);
      }
    }
    return CommunicationConsentStore.optOut(phoneOrUserId, reason);
  },

  async updateNotificationDeliveryStatus(
    providerMessageId: string,
    status: "PENDING" | "QUEUED" | "SENT" | "DELIVERED" | "FAILED",
    options?: { deliveryResult?: string; errorInfo?: string; deliveredAt?: Date }
  ): Promise<boolean> {
    if (process.env.DATABASE_URL) {
      try {
        await prisma.notificationDeliveryLog.updateMany({
          where: { providerMessageId },
          data: {
            status,
            ...(options?.deliveryResult ? { deliveryResult: options.deliveryResult } : {}),
            ...(options?.errorInfo ? { errorInfo: options.errorInfo } : {}),
            ...(options?.deliveredAt ? { deliveredAt: options.deliveredAt } : {}),
          },
        });
        return true;
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL updateNotificationDeliveryStatus error:", err);
      }
    }
    const updated = NotificationDeliveryLogStore.updateStatusByProviderId(providerMessageId, status, {
      deliveryResult: options?.deliveryResult,
      errorInfo: options?.errorInfo,
      deliveredAt: options?.deliveredAt ? options.deliveredAt.toISOString() : null,
    });
    return !!updated;
  },

  async getNotificationDeliveryLogs(recipientPhone?: string, limit = 50) {
    if (process.env.DATABASE_URL) {
      try {
        const whereClause = recipientPhone ? { recipientPhone } : {};
        return await prisma.notificationDeliveryLog.findMany({
          where: whereClause,
          take: limit,
          orderBy: { createdAt: "desc" },
        });
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL getNotificationDeliveryLogs error:", err);
      }
    }
    return recipientPhone
      ? NotificationDeliveryLogStore.getByRecipient(recipientPhone)
      : NotificationDeliveryLogStore.getAll(limit);
  },
};
