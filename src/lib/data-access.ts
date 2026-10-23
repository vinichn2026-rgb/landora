// =============================================================================
// Landora Real Estate & Land-Selling Marketplace
// Centralized, Secure Data-Access Layer (PostgreSQL via Prisma ORM)
// =============================================================================

import prisma from "./prisma";
import { PropertyItem, SearchFilters, PropertyStatus, VerificationLevel, ListingType, PropertyCategoryType, UserItem, NotificationItem, UserRole } from "@/types";
import { PropertyStore, EnquiryStore, ReportStore, SavedPropertyStore, UserStore, NotificationStore } from "./store";
import { normalizeAreaToSqft } from "./constants";

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

  // Get featured properties for homepage (Section C)
  async getFeaturedProperties(limit = 6): Promise<PropertyItem[]> {
    const result = await this.getProperties({ limit });
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

          return { success: true, enquiryId: enq.id };
        }
      } catch (err) {
        console.warn("[DATA-ACCESS WARNING] PostgreSQL createEnquiry error, falling back to in-memory store:", err);
      }
    }

    const inMem = EnquiryStore.create(data as any);
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
  async findUserByEmail(email: string): Promise<UserItem | null> {
    if (process.env.DATABASE_URL) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
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
    return UserStore.findByEmail(email);
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
    passwordHash: string;
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
            passwordHash: data.passwordHash,
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
      passwordHash: data.passwordHash,
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
};
