import { 
  PropertyItem, 
  EnquiryItem, 
  PropertyReportItem, 
  ListingPackageItem, 
  AuditLogItem, 
  SearchFilters, 
  UserItem, 
  NotificationItem,
  LocationItem,
  ContentBannerItem,
  PaymentRecordItem,
  UserRole,
  LoginActivityItem
} from "@/types";
import { INITIAL_SEED_PROPERTIES, INITIAL_PACKAGES } from "./seed-data";
import { normalizeAreaToSqft, POPULAR_LOCATIONS } from "./constants";

// Temporary Demo / In-Memory Data Store (Easy drop-in replacement for Prisma ORM client)
declare global {
  var __landora_properties: PropertyItem[] | undefined;
  var __landora_enquiries: EnquiryItem[] | undefined;
  var __landora_reports: PropertyReportItem[] | undefined;
  var __landora_packages: ListingPackageItem[] | undefined;
  var __landora_saved: Record<string, string[]> | undefined; // userId -> propertyIds[]
  var __landora_audit_logs: AuditLogItem[] | undefined;
  var __landora_users: UserItem[] | undefined;
  var __landora_notifications: NotificationItem[] | undefined;
  var __landora_locations: LocationItem[] | undefined;
  var __landora_content: ContentBannerItem[] | undefined;
  var __landora_payments: PaymentRecordItem[] | undefined;
  var __landora_login_activities: LoginActivityItem[] | undefined;
}

// Ensure in-memory store always has latest seed dataset
globalThis.__landora_properties = [...INITIAL_SEED_PROPERTIES];
if (!globalThis.__landora_enquiries) {
  globalThis.__landora_enquiries = [
    {
      id: "enq-001",
      propertyId: "land-cbe-001",
      propertyTitle: "1,800 Sq.Ft DTCP Approved Villa Plot in Peelamedu",
      propertyLocation: "Peelamedu, Coimbatore",
      propertyPrice: 4800000,
      buyerId: "user-buyer-01",
      buyerName: "M. Rajesh Kumar",
      buyerEmail: "rajesh.kumar@gmail.com",
      buyerPhone: "+91 98421 99887",
      message: "I am interested in this Peelamedu villa plot. Please share the layout approval copy, survey number, and convenient time for a site visit this Saturday.",
      sellerId: "user-seller-01",
      status: "NEW",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "enq-002",
      propertyId: "land-cbe-003",
      propertyTitle: "4.5 Acres Fertile Coconut Farmland with Canal Water & Free EB",
      propertyLocation: "Pollachi, Coimbatore",
      propertyPrice: 15500000,
      buyerId: "user-buyer-02",
      buyerName: "S. Balasubramaniam",
      buyerEmail: "bala.agro@yahoo.com",
      buyerPhone: "+91 94430 44556",
      message: "Are the coconut trees currently yielding? Also confirm whether the free EB agricultural connection is transferable.",
      sellerId: "user-seller-02",
      status: "CONTACTED",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    }
  ];
}
if (!globalThis.__landora_reports) {
  globalThis.__landora_reports = [];
}
if (!globalThis.__landora_packages) {
  globalThis.__landora_packages = [...INITIAL_PACKAGES];
}
if (!globalThis.__landora_saved) {
  globalThis.__landora_saved = {
    "user-demo": ["land-cbe-001", "land-cbe-004"]
  };
}
if (!globalThis.__landora_audit_logs) {
  globalThis.__landora_audit_logs = [
    {
      id: "log-1",
      userId: "admin-01",
      userName: "Landora Admin",
      action: "APPROVE_LISTING",
      entityType: "PROPERTY",
      entityId: "land-cbe-001",
      details: "Approved listing after DTCP layout number verification",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];
}

export const PropertyStore = {
  // Query all active properties with filters
  getAll(filters?: SearchFilters): { properties: PropertyItem[]; total: number; page: number; totalPages: number } {
    // Only published active properties appear in public searches
    let list = [...(globalThis.__landora_properties || [])].filter(p => !p.status || p.status === "ACTIVE");

    // Filter by city
    if (filters?.city && filters.city !== "All" && filters.city !== "all") {
      const qCity = filters.city.toLowerCase().trim();
      list = list.filter(p => p.city.toLowerCase().includes(qCity) || p.locality.toLowerCase().includes(qCity));
    }

    // Filter by locality
    if (filters?.locality && filters.locality !== "All" && filters.locality !== "all") {
      const qLoc = filters.locality.toLowerCase().trim();
      list = list.filter(p => p.locality.toLowerCase().includes(qLoc));
    }

    // Filter by single property type
    if (filters?.propertyType && filters.propertyType !== "all" && filters.propertyType !== "ALL") {
      list = list.filter(p => p.propertyType === filters.propertyType);
    }

    // Filter by multiple categories (for plots/commercial umbrella routes)
    if (filters?.categories && filters.categories.length > 0) {
      list = list.filter(p => filters.categories!.includes(p.propertyType));
    }

    // Filter by listing type
    if (filters?.listingType) {
      list = list.filter(p => p.listingType === filters.listingType);
    }

    // Price filters
    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      list = list.filter(p => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
      list = list.filter(p => p.price <= filters.maxPrice!);
    }

    // Area filters with unit normalization
    if ((filters?.minArea !== undefined && filters.minArea > 0) || (filters?.maxArea !== undefined && filters.maxArea > 0)) {
      const reqUnit = filters.areaUnit || "sqft";
      const normalizedMin = filters.minArea ? normalizeAreaToSqft(filters.minArea, reqUnit) : 0;
      const normalizedMax = filters.maxArea ? normalizeAreaToSqft(filters.maxArea, reqUnit) : Infinity;

      list = list.filter(p => {
        const pAreaSqft = normalizeAreaToSqft(p.area, p.areaUnit);
        return pAreaSqft >= normalizedMin && pAreaSqft <= normalizedMax;
      });
    }

    // Bedrooms filter (for residential properties: house, apartment, villa)
    if (filters?.bedrooms !== undefined && filters.bedrooms > 0) {
      list = list.filter(p => {
        if (!p.bedrooms) return false;
        if (filters.bedrooms === 5) {
          return p.bedrooms >= 5;
        }
        return p.bedrooms === filters.bedrooms;
      });
    }

    // Furnishing status filter
    if (filters?.furnishing && filters.furnishing !== "all") {
      list = list.filter(p => p.furnishing === filters.furnishing);
    }

    // Seller type
    if (filters?.sellerType && filters.sellerType !== "all") {
      list = list.filter(p => p.sellerType === filters.sellerType);
    }

    // Verified only filter
    if (filters?.verifiedOnly) {
      list = list.filter(p => p.verificationStatus === "INDEPENDENTLY_VERIFIED" || p.verificationStatus === "INFO_REVIEWED");
    }

    // Sorting (Plot is our #1 priority)
    const isPlotCategory = (type: string) => 
      type === "RESIDENTIAL_PLOT" || type === "AGRICULTURAL_LAND" || type === "COMMERCIAL_PLOT" || type === "INDUSTRIAL";

    const sortBy = filters?.sortBy || "recommended";
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "area_desc") {
      list.sort((a, b) => normalizeAreaToSqft(b.area, b.areaUnit) - normalizeAreaToSqft(a.area, a.areaUnit));
    } else {
      // Recommended: Plots first (#1 priority), then Featured, then verified, then newest
      list.sort((a, b) => {
        const aIsPlot = isPlotCategory(a.propertyType) ? 1 : 0;
        const bIsPlot = isPlotCategory(b.propertyType) ? 1 : 0;
        if (aIsPlot !== bIsPlot) return bIsPlot - aIsPlot; // Plot listings come first!

        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    const total = list.length;
    const page = Math.max(1, filters?.page || 1);
    const limit = filters?.limit || 9;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginated = list.slice(startIdx, startIdx + limit);

    return { properties: paginated, total, page, totalPages };
  },

  // Admin query to view all listings across all lifecycle statuses
  getAllAdmin(filters?: { status?: string; query?: string; city?: string; page?: number; limit?: number }): { properties: PropertyItem[]; total: number; page: number; totalPages: number } {
    let list = [...(globalThis.__landora_properties || [])];
    if (filters?.status && filters.status !== "ALL" && filters.status !== "all") {
      list = list.filter(p => p.status === filters.status!.toUpperCase());
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.locality.toLowerCase().includes(q) || 
        p.city.toLowerCase().includes(q) || 
        p.sellerName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    if (filters?.city && filters.city !== "ALL" && filters.city !== "all") {
      list = list.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = Math.max(1, filters?.page || 1);
    const limit = filters?.limit || 20;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const paginated = list.slice(startIdx, startIdx + limit);
    return { properties: paginated, total, page, totalPages };
  },

  toggleFeatured(id: string, isFeatured: boolean): PropertyItem | null {
    return this.update(id, { isFeatured });
  },

  // Get single property by ID or slug
  getBySlug(slugOrId: string): PropertyItem | null {
    const properties = globalThis.__landora_properties || [];
    return properties.find(p => p.slug === slugOrId || p.id === slugOrId) || null;
  },

  // Get similar properties (same city or property type, excluding self)
  getSimilar(currentProperty: PropertyItem, limit = 3): PropertyItem[] {
    const properties = globalThis.__landora_properties || [];
    return properties
      .filter(p => p.id !== currentProperty.id && (p.city === currentProperty.city || p.propertyType === currentProperty.propertyType))
      .slice(0, limit);
  },

  // Create new property
  create(data: Omit<PropertyItem, "id" | "slug" | "viewsCount" | "publishedAt" | "createdAt" | "updatedAt">): PropertyItem {
    const id = `land-${Date.now()}`;
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${id.slice(-4)}`;

    const newProp: PropertyItem = {
      ...data,
      id,
      slug,
      viewsCount: 1,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    globalThis.__landora_properties = [newProp, ...(globalThis.__landora_properties || [])];
    return newProp;
  },

  // Update existing property
  update(id: string, updates: Partial<PropertyItem>): PropertyItem | null {
    const list = globalThis.__landora_properties || [];
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const updated: PropertyItem = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    return updated;
  },

  // Delete property
  delete(id: string): boolean {
    const list = globalThis.__landora_properties || [];
    const initialLen = list.length;
    globalThis.__landora_properties = list.filter(p => p.id !== id);
    return globalThis.__landora_properties.length < initialLen;
  },

  // Get properties by seller
  getBySeller(sellerId: string): PropertyItem[] {
    const list = globalThis.__landora_properties || [];
    return list.filter(p => p.sellerId === sellerId);
  }
};

export const SavedPropertyStore = {
  getUserSavedIds(userId: string): string[] {
    return globalThis.__landora_saved?.[userId] || [];
  },

  getUserSavedProperties(userId: string): PropertyItem[] {
    const ids = this.getUserSavedIds(userId);
    const all = globalThis.__landora_properties || [];
    return all.filter(p => ids.includes(p.id));
  },

  toggle(userId: string, propertyId: string): { isSaved: boolean; count: number } {
    if (!globalThis.__landora_saved) globalThis.__landora_saved = {};
    const current = globalThis.__landora_saved[userId] || [];
    let updated: string[];
    let isSaved: boolean;

    if (current.includes(propertyId)) {
      updated = current.filter(id => id !== propertyId);
      isSaved = false;
    } else {
      updated = [...current, propertyId];
      isSaved = true;
    }

    globalThis.__landora_saved[userId] = updated;
    return { isSaved, count: updated.length };
  }
};

export interface EnquirySubmissionResult {
  success: boolean;
  enquiry?: EnquiryItem;
  error?: string;
}

export interface ReportSubmissionResult {
  success: boolean;
  report?: PropertyReportItem;
  error?: string;
}

export const EnquiryStore = {
  create(enquiry: Omit<EnquiryItem, "id" | "status" | "createdAt" | "updatedAt">): EnquirySubmissionResult {
    // 1. Validation
    if (!enquiry.buyerName || enquiry.buyerName.trim().length < 2) {
      return { success: false, error: "Please enter your full name (minimum 2 characters)." };
    }

    const cleanPhone = enquiry.buyerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { success: false, error: "Please provide a valid 10-digit mobile number." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!enquiry.buyerEmail || !emailRegex.test(enquiry.buyerEmail.trim())) {
      return { success: false, error: "Please provide a valid email address." };
    }

    if (!enquiry.message || enquiry.message.trim().length < 8) {
      return { success: false, error: "Please write a message of at least 8 characters." };
    }

    // 2. Anti-spam & duplicate prevention (same contact & property within 5 mins)
    const existing = (globalThis.__landora_enquiries || []).find(e => 
      e.propertyId === enquiry.propertyId && 
      (e.buyerEmail.toLowerCase() === enquiry.buyerEmail.toLowerCase().trim() || e.buyerPhone.replace(/\D/g, "") === cleanPhone) &&
      (Date.now() - new Date(e.createdAt).getTime() < 300000)
    );

    if (existing) {
      return { 
        success: false, 
        error: "Duplicate submission detected: You have already sent an enquiry for this property recently. The seller has your contact details and will respond soon." 
      };
    }

    // 3. Save enquiry
    const newEnq: EnquiryItem = {
      ...enquiry,
      buyerName: enquiry.buyerName.trim(),
      buyerEmail: enquiry.buyerEmail.toLowerCase().trim(),
      buyerPhone: enquiry.buyerPhone.trim(),
      id: `enq-${Date.now()}`,
      status: "NEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    globalThis.__landora_enquiries = [newEnq, ...(globalThis.__landora_enquiries || [])];

    // 4. Dispatch seller notification (Configured Service Logger)
    if (typeof console !== "undefined") {
      console.log(`[LANDORA NOTIFICATION SERVICE] SMS/Email dispatched to seller: ${enquiry.sellerId} for property #${enquiry.propertyId} from ${newEnq.buyerName} (${newEnq.buyerPhone})`);
    }

    return { success: true, enquiry: newEnq };
  },

  getBySeller(sellerId: string): EnquiryItem[] {
    return (globalThis.__landora_enquiries || []).filter(e => e.sellerId === sellerId);
  },

  getByBuyer(buyerEmail: string): EnquiryItem[] {
    return (globalThis.__landora_enquiries || []).filter(e => e.buyerEmail === buyerEmail);
  },

  getAll(): EnquiryItem[] {
    return globalThis.__landora_enquiries || [];
  },

  updateStatus(id: string, status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "CLOSED"): EnquiryItem | null {
    const list = globalThis.__landora_enquiries || [];
    const item = list.find(e => e.id === id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    return item;
  }
};

export const ReportStore = {
  create(report: Omit<PropertyReportItem, "id" | "status" | "createdAt">): ReportSubmissionResult {
    if (!report.reason) {
      return { success: false, error: "Please select a reason for the report." };
    }
    if (!report.details || report.details.trim().length < 8) {
      return { success: false, error: "Please provide specific details explaining the issue." };
    }

    const newRep: PropertyReportItem = {
      ...report,
      id: `rep-${Date.now()}`,
      status: "OPEN",
      createdAt: new Date().toISOString()
    };
    globalThis.__landora_reports = [newRep, ...(globalThis.__landora_reports || [])];

    if (typeof console !== "undefined") {
      console.log(`[LANDORA MODERATION ALERT] Property #${report.propertyId} flagged for review: ${report.reason}`);
    }

    return { success: true, report: newRep };
  },

  getAll(): PropertyReportItem[] {
    return globalThis.__landora_reports || [];
  },

  updateStatus(id: string, status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED"): boolean {
    const list = globalThis.__landora_reports || [];
    const item = list.find(r => r.id === id);
    if (!item) return false;
    item.status = status;
    return true;
  }
};

export const PackageStore = {
  getAll(): ListingPackageItem[] {
    return globalThis.__landora_packages || [];
  },

  update(id: string, updates: Partial<ListingPackageItem>): ListingPackageItem | null {
    const list = globalThis.__landora_packages || [];
    const item = list.find(p => p.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  }
};

export const AuditStore = {
  log(action: string, entityType: string, entityId: string, details?: string, userName = "System Admin"): void {
    const logItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      userId: "admin-active",
      userName,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString()
    };
    globalThis.__landora_audit_logs = [logItem, ...(globalThis.__landora_audit_logs || [])];
  },

  getAll(): AuditLogItem[] {
    return globalThis.__landora_audit_logs || [];
  }
};

// Seed Demo Users if not present
if (!globalThis.__landora_users) {
  const DEFAULT_HASH = "$2b$10$4WxNgiVmoCXUcholxOIyPeBIeGkWPGNFqc7Nj3x2722jDrYACAS0K"; // Password@123
  globalThis.__landora_users = [
    {
      id: "user-seller-01",
      name: "K. R. Sivakumar",
      email: "seller@landora.in",
      phoneNumber: "+91 94433 12345",
      passwordHash: DEFAULT_HASH,
      role: "SELLER",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        bio: "Independent landowner and promoter in Peelamedu, Coimbatore.",
        city: "Coimbatore",
        state: "Tamil Nadu",
        companyName: "Sivakumar Real Estates",
        isPhoneVerified: true,
        isEmailVerified: true,
      }
    },
    {
      id: "user-buyer-01",
      name: "M. Rajesh Kumar",
      email: "buyer@landora.in",
      phoneNumber: "+91 98421 99887",
      passwordHash: DEFAULT_HASH,
      role: "BUYER",
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        bio: "IT Professional looking for DTCP approved residential villa plots in Coimbatore and OMR Chennai.",
        city: "Coimbatore",
        state: "Tamil Nadu",
        isPhoneVerified: true,
        isEmailVerified: true,
      }
    },
    {
      id: "user-agent-01",
      name: "Prime Realtors Coimbatore",
      email: "agent@landora.in",
      phoneNumber: "+91 98940 77889",
      passwordHash: DEFAULT_HASH,
      role: "AGENT",
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        companyName: "Prime Realtors Pvt Ltd",
        reraRegistration: "TN/AGENT/2026/0122",
        city: "Coimbatore",
        state: "Tamil Nadu",
        isPhoneVerified: true,
        isEmailVerified: true,
      }
    },
    {
      id: "user-builder-01",
      name: "Green Valley Developers",
      email: "builder@landora.in",
      phoneNumber: "+91 98400 11223",
      passwordHash: DEFAULT_HASH,
      role: "BUILDER",
      createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        companyName: "Green Valley Promoters & Townships",
        reraRegistration: "TN/BUILDER/2026/045",
        city: "Chennai",
        state: "Tamil Nadu",
        isPhoneVerified: true,
        isEmailVerified: true,
      }
    },
    {
      id: "user-admin-01",
      name: "Landora Platform Admin",
      email: "admin@landora.in",
      phoneNumber: "+91 422 2345678",
      passwordHash: DEFAULT_HASH,
      role: "ADMIN",
      createdAt: new Date(Date.now() - 100 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        city: "Coimbatore",
        state: "Tamil Nadu",
        isPhoneVerified: true,
        isEmailVerified: true,
      }
    },
    {
      id: "user-admin-vinitha",
      name: "Vinitha (Administrator)",
      email: "vinichn2026@gmail.com",
      phoneNumber: "+91 94433 00001",
      passwordHash: DEFAULT_HASH,
      role: "ADMIN",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        city: "Coimbatore",
        state: "Tamil Nadu",
        isPhoneVerified: true,
        isEmailVerified: true,
      }
    }
  ];
}

if (!globalThis.__landora_notifications) {
  globalThis.__landora_notifications = [
    {
      id: "notif-001",
      userId: "user-buyer-01",
      title: "New Price Update in Peelamedu",
      message: "A property in your saved shortlist has lowered its price by ₹2 Lakhs.",
      type: "PRICE_DROP",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "notif-002",
      userId: "user-buyer-01",
      title: "Enquiry Acknowledged",
      message: "Seller K. R. Sivakumar has acknowledged your site visit request for Peelamedu Villa Plot.",
      type: "ENQUIRY_UPDATE",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: "notif-003",
      userId: "user-seller-01",
      title: "New Buyer Enquiry Received",
      message: "M. Rajesh Kumar sent an enquiry requesting Patta copy and Saturday site visit.",
      type: "NEW_ENQUIRY",
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    }
  ];
}

export const UserStore = {
  findByEmail(email: string): UserItem | null {
    const list = globalThis.__landora_users || [];
    return list.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  findById(id: string): UserItem | null {
    const list = globalThis.__landora_users || [];
    return list.find(u => u.id === id) || null;
  },

  create(user: Omit<UserItem, "id" | "createdAt" | "updatedAt">): UserItem {
    const newUser: UserItem = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    globalThis.__landora_users = [newUser, ...(globalThis.__landora_users || [])];
    return newUser;
  },

  updateProfile(id: string, data: Partial<UserItem["profile"] & { name?: string; phoneNumber?: string }>): UserItem | null {
    const user = this.findById(id);
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    user.profile = {
      ...(user.profile || {}),
      ...data,
    };
    user.updatedAt = new Date().toISOString();
    return user;
  },

  updatePassword(id: string, passwordHash: string): boolean {
    const user = this.findById(id);
    if (!user) return false;
    user.passwordHash = passwordHash;
    user.updatedAt = new Date().toISOString();
    return true;
  },

  getAll(): UserItem[] {
    return globalThis.__landora_users || [];
  },

  updateRole(id: string, role: UserRole): UserItem | null {
    const user = this.findById(id);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date().toISOString();
    return user;
  },

  toggleSuspension(id: string, isSuspended: boolean): UserItem | null {
    const user = this.findById(id);
    if (!user) return null;
    user.isSuspended = isSuspended;
    user.updatedAt = new Date().toISOString();
    return user;
  },

  recordLogin(id: string): UserItem | null {
    const user = this.findById(id);
    if (!user) return null;
    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    return user;
  }
};

// Initial Locations Seed
if (!globalThis.__landora_locations) {
  globalThis.__landora_locations = POPULAR_LOCATIONS.map((loc, idx) => ({
    id: `loc-00${idx + 1}`,
    city: loc.city,
    state: loc.state,
    popularLocalities: [...loc.popularLocalities],
    count: loc.count,
    isActive: true,
  }));
}

export const LocationStore = {
  getAll(): LocationItem[] {
    return globalThis.__landora_locations || [];
  },
  create(data: Omit<LocationItem, "id">): LocationItem {
    const newItem: LocationItem = {
      ...data,
      id: `loc-${Date.now()}`,
    };
    globalThis.__landora_locations = [...(globalThis.__landora_locations || []), newItem];
    return newItem;
  },
  update(id: string, updates: Partial<LocationItem>): LocationItem | null {
    const list = globalThis.__landora_locations || [];
    const item = list.find(l => l.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  },
  delete(id: string): boolean {
    const list = globalThis.__landora_locations || [];
    const initialLen = list.length;
    globalThis.__landora_locations = list.filter(l => l.id !== id);
    return globalThis.__landora_locations.length < initialLen;
  }
};

// Initial Content Seed
if (!globalThis.__landora_content) {
  globalThis.__landora_content = [
    {
      id: "cnt-01",
      key: "hero_headline",
      title: "Find the Right Property. Build Your Future.",
      subtitle: "Discover DTCP & CMDA approved plots, agricultural farmland, and residential properties across Tamil Nadu.",
      ctaText: "Explore Properties",
      ctaLink: "/properties",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cnt-02",
      key: "post_property_banner",
      title: "Sell Land & Properties Faster on Landora",
      subtitle: "Direct buyer enquiries without brokerage commissions. 100% genuine verified landowners and buyers.",
      ctaText: "Post Property FREE",
      ctaLink: "/post-property",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cnt-03",
      key: "announcement_bar",
      title: "Coimbatore & TN Real Estate Report 2026",
      subtitle: "Guideline value updates and smart city infrastructure growth insights.",
      ctaText: "Read Insights",
      ctaLink: "/about",
      updatedAt: new Date().toISOString(),
    }
  ];
}

export const ContentStore = {
  getBanners(): ContentBannerItem[] {
    return globalThis.__landora_content || [];
  },
  updateBanner(key: string, updates: Partial<ContentBannerItem>): ContentBannerItem | null {
    const list = globalThis.__landora_content || [];
    const item = list.find(c => c.key === key);
    if (!item) return null;
    Object.assign(item, { ...updates, updatedAt: new Date().toISOString() });
    return item;
  }
};

// Initial Payment Seed
// Note: Per user prompt, we do not fake live processing when unconfigured.
// Real payment data notice is declared truthfully.
if (!globalThis.__landora_payments) {
  globalThis.__landora_payments = [
    {
      id: "pay-seed-01",
      userId: "user-seller-01",
      userName: "K. R. Sivakumar",
      userEmail: "seller@landora.in",
      packageId: "pkg-featured",
      packageName: "Featured Property Boost (30 Days)",
      amount: 2999,
      currency: "INR",
      status: "SUCCESS",
      gateway: "Razorpay (Test / Sandbox)",
      gatewayPaymentId: "pay_test_Rzp94829104",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "pay-seed-02",
      userId: "user-agent-01",
      userName: "Senthil Nathan",
      userEmail: "agent@landora.in",
      packageId: "pkg-agent-pro",
      packageName: "Agent Multi-Listing Pro Pack",
      amount: 6999,
      currency: "INR",
      status: "SUCCESS",
      gateway: "Razorpay (Test / Sandbox)",
      gatewayPaymentId: "pay_test_Rzp88421099",
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    }
  ];
}

export const PaymentStore = {
  getAll(): PaymentRecordItem[] {
    return globalThis.__landora_payments || [];
  },
  findById(id: string): PaymentRecordItem | null {
    const list = globalThis.__landora_payments || [];
    return list.find(p => p.id === id) || null;
  },
  findByOrderId(orderId: string): PaymentRecordItem | null {
    const list = globalThis.__landora_payments || [];
    return list.find(p => p.orderId === orderId) || null;
  },
  create(data: Omit<PaymentRecordItem, "id" | "createdAt">): PaymentRecordItem {
    const record: PaymentRecordItem = {
      ...data,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    globalThis.__landora_payments = [record, ...(globalThis.__landora_payments || [])];
    return record;
  },
  update(id: string, updates: Partial<PaymentRecordItem>): PaymentRecordItem | null {
    const list = globalThis.__landora_payments || [];
    const item = list.find(p => p.id === id);
    if (!item) return null;
    Object.assign(item, { ...updates, updatedAt: new Date().toISOString() });
    return item;
  },
  updateByOrderId(orderId: string, updates: Partial<PaymentRecordItem>): PaymentRecordItem | null {
    const list = globalThis.__landora_payments || [];
    const item = list.find(p => p.orderId === orderId);
    if (!item) return null;
    Object.assign(item, { ...updates, updatedAt: new Date().toISOString() });
    return item;
  },
  getMetrics() {
    const list = globalThis.__landora_payments || [];
    const totalAmount = list
      .filter(p => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);
    const hasLiveKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    return {
      totalTransactions: list.length,
      successfulTransactions: list.filter(p => p.status === "SUCCESS").length,
      totalAmount,
      currency: "INR",
      gatewayStatus: hasLiveKeys 
        ? "Razorpay Live Gateway Active" 
        : "Sandbox / Test Mode (Live payment keys not configured)",
    };
  }
};

export const NotificationStore = {
  getByUser(userId: string): NotificationItem[] {
    const list = globalThis.__landora_notifications || [];
    return list.filter(n => n.userId === userId);
  },

  getUnreadCount(userId: string): number {
    const list = globalThis.__landora_notifications || [];
    return list.filter(n => n.userId === userId && !n.isRead).length;
  },

  markRead(id: string, userId: string): boolean {
    const list = globalThis.__landora_notifications || [];
    const item = list.find(n => n.id === id && n.userId === userId);
    if (!item) return false;
    item.isRead = true;
    return true;
  },

  markAllRead(userId: string): void {
    const list = globalThis.__landora_notifications || [];
    list.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
  },

  create(data: Omit<NotificationItem, "id" | "createdAt"> | any): NotificationItem {
    const newNotif: NotificationItem = {
      isRead: false,
      ...data,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    globalThis.__landora_notifications = [newNotif, ...(globalThis.__landora_notifications || [])];
    return newNotif;
  }
};

export const LoginActivityStore = {
  create(data: Omit<LoginActivityItem, "id" | "createdAt">): LoginActivityItem {
    const item: LoginActivityItem = {
      ...data,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    globalThis.__landora_login_activities = [item, ...(globalThis.__landora_login_activities || [])];
    return item;
  },

  getAll(limit = 100): LoginActivityItem[] {
    const list = globalThis.__landora_login_activities || [];
    return list.slice(0, limit);
  },

  getByUser(userId: string): LoginActivityItem[] {
    const list = globalThis.__landora_login_activities || [];
    return list.filter(a => a.userId === userId);
  }
};
