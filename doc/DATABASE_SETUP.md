# Landora — PostgreSQL & Prisma ORM Database Documentation

This document describes the complete PostgreSQL database architecture, Prisma ORM schema models, migration workflow, and deployment instructions for the **Landora** Indian Real Estate Marketplace.

---

## 1. Database Architecture & Models Overview

The database is built on **PostgreSQL** using **Prisma ORM (v7.10.0)**. It contains 14 normalized models with indexes, constraints, decimal types, and explicit deletion rules:

| Model | Purpose | Key Attributes |
|---|---|---|
| `User` | Core authentication & user accounts | Unique email & phone, role enum (`BUYER`, `SELLER`, `AGENT`, `BUILDER`, `ADMIN`). |
| `UserProfile` | User identity details | Tax ID / GST, RERA registration, avatar, contact verification booleans. Cascade on user delete. |
| `Agency` & `AgencyMember` | Brokerages & Real estate layout promoter firms | Firm name, city, RERA registration, staff membership mappings with roles. |
| `Property` | Property & Land listings | Unique slug, title, description, `Decimal(14,2)` price, `Decimal(12,2)` area, coordinates, land specs, road frontage, document status, seller relation. Indexed on city, locality, category, price, area, status. |
| `PropertyImage` | Photograph references | Cloudinary/S3 storage provider, public image URL, primary flag, display ordering. Cascade delete with property. |
| `PropertyAmenity` | Infrastructure & facilities | Tar road, underground drainage, EB power, borewell, gated security. Composite unique constraint `[propertyId, name]`. |
| `SavedProperty` | User shortlists | User to property M:N relation. Unique constraint `[userId, propertyId]`. |
| `Enquiry` | Direct buyer enquiries | Buyer name, phone, email, message, status (`NEW`, `CONTACTED`, `FOLLOW_UP`, `CLOSED`). Indexed on property and seller. |
| `ListingPackage` | Paid listing monetization tiers | Package pricing `Decimal(10,2)`, listing duration in days, features array, active status. |
| `Payment` | Razorpay billing transactions | Razorpay payment ID, order ID, amount `Decimal(10,2)`, status (`PENDING`, `SUCCESS`, `FAILED`). |
| `PropertyReport` | Moderation & trust flags | Reason, details, status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`). |
| `VerificationRecord` | Revenue title & audit records | Verification level, reviewer ID, document checked (`Patta`, `EC 30 Yrs`). |
| `Notification` | System & enquiry alerts | User relation, title, message, read status boolean. |
| `AuditLog` | Security & compliance audit trail | Action performed, entity type, entity ID, IP address, timestamp. |

---

## 2. Monetary & Area Precision Standards

- **Monetary Values (`price`, `amount`)**: Stored as `Decimal(14, 2)` or `Decimal(10, 2)` in PostgreSQL to prevent floating-point rounding errors in high-value Indian property transactions (up to ₹999 Crore with 2 decimal paisa precision).
- **Spatial Areas (`area`, `builtUpArea`)**: Stored as `Decimal(12, 2)` to support precise measurements across Cents (435.6 sq.ft), Acres, Square Yards, and Square Feet.
- **Geographic Coordinates (`latitude`, `longitude`)**: Stored as `Decimal(10, 7)` for sub-meter pin-point accuracy on Tamil Nadu regional maps.

---

## 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/landora?schema=public"
```

---

## 4. Migration & Schema Workflow Commands

### A. Generate Prisma Client
Generates the fully typed TypeScript client (`@prisma/client`):
```bash
npx prisma generate
```

### B. Run Migrations (Development)
Applies pending SQL migrations to the local database:
```bash
npx prisma migrate dev
```

### C. Run Migrations (Production Deployment)
Applies committed migrations safely on staging or production:
```bash
npx prisma migrate deploy
```

### D. Initial Migration Script
The initial migration file is located at:
`prisma/migrations/20261022000000_init/migration.sql`

To recreate or check diffs:
```bash
npx prisma migrate diff --from-empty --to-schema=prisma/schema.prisma --script -o prisma/migrations/20261022000000_init/migration.sql
```

### E. Seed Demo Database
Populates the database with demo users, packages, and 20+ realistic Tamil Nadu property listings:
```bash
npx tsx prisma/seed.ts
```

### F. Launch Prisma Studio
Opens the web GUI to inspect, search, and edit database records directly:
```bash
npx prisma studio
```

---

## 5. Resilient Central Data-Access Layer (`src/lib/data-access.ts`)

To guarantee seamless developer experience and zero crashes:
- When `DATABASE_URL` is configured and PostgreSQL is reachable, `DataAccess` executes native Prisma queries (`prisma.property.findMany`, `prisma.enquiry.create`, etc.).
- When `DATABASE_URL` is not yet configured on a developer's machine, `DataAccess` automatically falls back to the in-memory development store (`PropertyStore`).
- Live updates and newly created records are reflected instantaneously across homepage sections, search results, and detail pages.
