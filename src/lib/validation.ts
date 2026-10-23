import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid 10-digit Indian phone number").optional(),
  role: z.enum(["BUYER", "SELLER", "AGENT", "BUILDER"]),
  companyName: z.string().optional()
});

export const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Please provide a message with at least 10 characters"),
  propertyId: z.string().min(1, "Property ID is required")
});

export const propertyPostSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  listingType: z.enum(["SALE", "RENT", "LEASE"]),
  propertyType: z.enum([
    "RESIDENTIAL_PLOT",
    "AGRICULTURAL_LAND",
    "HOUSE",
    "APARTMENT",
    "VILLA",
    "COMMERCIAL_PLOT",
    "COMMERCIAL_BUILDING",
    "INDUSTRIAL"
  ]),
  price: z.number().positive("Price must be a positive number"),
  area: z.number().positive("Area must be a positive number"),
  areaUnit: z.string().min(1, "Area unit is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  locality: z.string().min(2, "Locality is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pinCode: z.string().length(6, "PIN code must be exactly 6 digits"),
  sellerName: z.string().min(2, "Seller name is required"),
  sellerPhone: z.string().min(10, "Valid phone number is required"),
  sellerEmail: z.string().email("Valid email address is required"),
  sellerType: z.enum(["OWNER", "AGENT", "BUILDER"]),
  facing: z.string().optional(),
  roadWidthFt: z.number().optional(),
  approvalStatus: z.string().optional()
});

export const reportListingSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  reporterName: z.string().min(2, "Name is required"),
  reporterEmail: z.string().email().optional(),
  reason: z.string().min(5, "Please specify a reason"),
  details: z.string().min(10, "Please provide more details about the issue")
});
