# Landora — Phase Prompts & Roadmap Documentation

This document tracks and records all user phase prompts submitted for the **Landora** Indian Real Estate Marketplace project.

---

## Prompt 1: Master Prompt (Initial System Specification)

```markdown
# MASTER PROMPT: BUILD A COMPLETE REAL ESTATE & LAND-SELLING WEBSITE

## 1. Project Overview
Build a complete, modern, responsive Indian real estate marketplace inspired by the functionality and user experience of 99acres.com.
Project name: Landora.
Target market: India, starting with Tamil Nadu and Coimbatore.
Target users: Property buyers, landowners and property sellers, real estate agents and brokers, builders and developers, property administrators.
Original brand identity, layout, copy, and visual design.

## 2. Technology Stack
- Next.js with App Router
- TypeScript
- React
- Tailwind CSS
- Lucide React icons
- PostgreSQL database
- Prisma ORM
- Secure authentication with Auth.js or equivalent
- Zod for form validation
- React Hook Form for complex forms
- Map provider for location selection and maps
- Indian payment gateway (Razorpay) for paid listing packages
- Email notification service

## 3. Design and Branding
- White and warm off-white backgrounds
- Deep forest green or dark teal as primary brand colour
- Subtle gold or muted green accents
- Professional typography, clean property cards, realistic Indian property imagery
- Original logo and favicon

## 4. Required Pages and Workflows
- Public pages: /, /properties, /properties/[slug], /buy, /rent, /plots, /commercial, /projects, /locations/[city], /post-property, /about, /contact, /help, /privacy, /terms, /listing-guidelines, /report-listing
- Authentication: /login, /register, /forgot-password, /reset-password, /verify-email
- User/Seller Dashboard: /dashboard, /dashboard/profile, /dashboard/saved, /dashboard/enquiries, /dashboard/seller, /dashboard/packages, /dashboard/notifications
- Administration: /admin/dashboard, /admin/users, /admin/properties, /admin/enquiries, /admin/reports, /admin/packages, /admin/audit-logs
```

---

## Prompt 2: Phase 1 (Foundational Setup & Design System) — COMPLETED

```markdown
Build Phase 1 of my Landora real estate and land-selling website, inspired by the functionality of 99acres.com.

TECH STACK:
- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Lucide React
- PostgreSQL and Prisma for the planned backend

TASKS:
1. Inspect existing project before making changes.
2. Configure project structure using src directory and App Router.
3. Set up Tailwind CSS, TypeScript, ESLint, and Lucide React.
4. Create a reusable design system with consistent colours, typography, spacing, buttons, inputs, cards, borders, and shadows.
5. Use a premium Indian real estate design: white backgrounds, deep forest green or dark teal, subtle gold accents, professional typography, and realistic property imagery.
6. Create reusable components for buttons, form fields, property cards, page containers, loading states, empty states, and error messages.
7. Create the initial global layout, responsive container, and shared styles.
8. Prepare a clean folder structure for public pages, dashboard pages, admin pages, components, libraries, types, and database code.
9. Create a README with installation and development instructions.
10. Ensure the application starts successfully and has no TypeScript or build errors.
```

---

## Prompt 3: Phase 2 (Complete Responsive Homepage) — COMPLETED

```markdown
Continue the existing Landora project from Phase 1. Preserve all existing working code and design tokens.

Build the complete responsive homepage for an Indian real estate marketplace inspired by 99acres.com, with original branding and layout.

SECTIONS IN THIS ORDER:
1. Responsive navbar with logo, Home, Buy, Rent, Plots/Land, Commercial, New Projects, Post Property, Login/Profile, and mobile menu.
2. Hero section with the headline “Find the Right Property. Build Your Future.”
3. Search panel with tabs for Buy, Rent, Plots/Land, and Commercial.
4. Search fields for city/locality, property type, budget, and area.
5. Popular property categories with relevant photographs.
6. Featured properties.
7. Recently added properties.
8. Popular cities and localities, starting with Coimbatore, Peelamedu, Saravanampatti, Chennai, Madurai, and Tiruppur.
9. How it works for buyers and sellers.
10. Why choose Landora.
11. Post Property call-to-action section.
12. Complete footer with functional navigation links.
```

---

## Prompt 4: Phase 3 (Property Search & Filter Engine) — COMPLETED

```markdown
Continue the existing Landora project. Build a complete property search and results experience.

Create these routes:
- /properties
- /buy
- /rent
- /plots
- /commercial
- /locations/[city]

PROPERTY CATEGORIES:
- Residential plots, Agricultural land, Independent houses, Apartments, Villas, Commercial plots, Shops and offices, Industrial properties

SEARCH FILTERS:
- City and locality, Listing type (sale/rent), Property category, Budget range, Area range (sqft, cent, acre, sqyd), Seller type, Bedrooms, Furnishing.

SORTING: Recommended, Newest first, Price low to high, Price high to low, Largest area first.
UI: Responsive cards, active filter chips, pagination, mobile drawer, list/map views.
```

---

## Prompt 5: Phase 4 (Property Details & Enquiry Workflow) — COMPLETED

```markdown
Continue the existing Landora project. Implement complete property detail pages and the buyer enquiry workflow.

ROUTE: /properties/[slug]

DETAILS PAGE: Title, interactive photo gallery, INR pricing, price per unit, plot dimensions, survey number, land classification, road width, legal document status, amenities, similar properties, report listing form.

ENQUIRY WORKFLOW:
1. Validate fields (Name, Phone, Email, Message).
2. Prevent spam & duplicate submissions.
3. Save enquiry and dispatch notification.
4. Confirmation modal & error handling.
```

---

## Prompt 6: Phase 5 (PostgreSQL Database Integration with Prisma ORM) — COMPLETED

```markdown
Continue the existing Landora project and connect it to a real PostgreSQL database using Prisma ORM.

Do not rebuild the frontend. Preserve all existing routes and components.

DATABASE MODELS (14 models):
- User, UserProfile, Agency, AgencyMember, Property, PropertyImage, PropertyAmenity, SavedProperty, Enquiry, ListingPackage, Payment, PropertyReport, VerificationRecord, Notification, AuditLog.

REQUIREMENTS:
1. Complete Prisma schema with relations, indexes, constraints, and cascade rules.
2. Database migrations (DDL SQL).
3. Development seed script (prisma/seed.ts).
4. Image storage reference manager (Cloudinary/S3 metadata).
5. Central database client with PostgreSQL adapter (@prisma/adapter-pg).
6. Secure data-access layer (src/lib/data-access.ts).
7. Safe server-side filters, pagination, and dynamic reflection tests.
```

---

## Prompt 7: Banner & Merged/Fixed Scroll Navbar Enhancement — COMPLETED

```markdown
banner section - should be view like this and fixed navbar only fix while scroll and before that use concept like navbar and banner section should be meged..
```

**Key Objectives:**
1. Merged Navbar & Banner: At scroll = 0, transparent navbar visually merges with the panoramic banner.
2. Fixed on Scroll: Navbar transitions smoothly into a solid fixed navigation bar when scrolling down.
3. 99acres-Style Panoramic Showcase: Partner branding, 3 BHK typography, starting price, luxury architectural render, RERA details, and SVG QR code.
4. Floating Overlapping Search Card: Overlaps the bottom of the banner with tabs (Buy, Rent, New Launch, Commercial, Plots, Projects), category dropdown, autocomplete, GPS, and voice mic buttons.

---

## Prompt 8: Pleasant Daylight Banner View Enhancement — COMPLETED

```markdown
banner background should be pleasent view not dark theme
```

**Key Objectives:**
1. Pleasant Daylight Atmosphere: Shift banner from dark theme to a bright, airy, sunlit green real estate panoramic view.
2. Natural Ambiance: Soft daylight sky, sunlit modern villa architecture with lush landscaping.
3. High-Contrast Typography: Dark slate (`text-slate-900`), deep forest teal (`text-[#0c4a3e]`), and warm gold accents for 100% legibility.
4. Harmonious Navbar: Translucent frosted glass at top, transitioning to solid white on scroll.

---

## Prompt 9: Clean Header Alignment & Shortened Nav Links — COMPLETED

```markdown
enaku olunga short pani neat ah venum ipdi alignment ilama varakudathu -
```

**Key Objectives:**
1. Zero Text Wrapping: Strictly enforce `whitespace-nowrap` and `shrink-0` across all navigation elements so text never breaks into multiple lines.
2. Concise & Shortened Labels:
   - "For Buyers" → "Buyers ⌵"
   - "For Tenants" → "Tenants ⌵"
   - "For Owners" → "Owners ⌵"
   - "For Dealers / Builders" → "Builders ⌵"
   - "Insights" with compact NEW badge
3. Streamlined Padding & Fixed Height (`h-12`): Compact baseline alignment across logo, city selector, nav links, Post Property button, support icon, saved count, and user avatar.

---

## Prompt 10: Phase 6 (Secure Authentication & Buyer/User Dashboard) — COMPLETED

```markdown
Continue the existing Landora project. Implement secure authentication and the buyer/user dashboard without breaking the existing property marketplace.

AUTHENTICATION:
- Registration
- Login
- Logout
- Email verification
- Forgot password
- Password reset
- Secure sessions
- Optional phone OTP only if a provider is configured

ROUTES:
- /login
- /register
- /forgot-password
- /reset-password
- /verify-email
- /dashboard
- /dashboard/profile
- /dashboard/saved
- /dashboard/enquiries
- /dashboard/notifications

USER ROLES:
- Buyer
- Seller
- Agent
- Builder
- Administrator

DASHBOARD:
- User profile
- Saved properties
- Submitted enquiries
- Notification preferences
- Account settings
- Listing management links for authorised sellers

SAVED PROPERTIES:
- Save and unsave a property.
- Persist favourites in PostgreSQL.
- Prevent duplicate records.
- Display saved properties on the user's dashboard.

SECURITY:
- Use a maintained authentication library compatible with the current stack.
- Hash passwords securely when password authentication is used.
- Validate all inputs.
- Protect routes on the server.
- Enforce record ownership in backend operations.
- Do not rely on hidden buttons or frontend role values for security.
- Never store passwords or authentication secrets in plain text.

Create functional loading, validation, and error states. Test registration, login, logout, password reset, saved properties, and unauthorised access. Do not claim email or OTP verification works unless the required provider is configured. Wait for approval before continuing.
```

---

## Prompt 11: Phase 7 (Post Property and Seller Dashboard) — COMPLETED

```markdown
Phase 7 — Post property and seller dashboard
Continue the existing Landora project. Implement a complete property publishing workflow for owners, agents, and builders.

ROUTES:
- /post-property
- /dashboard/seller
- /dashboard/seller/listings
- /dashboard/seller/listings/new
- /dashboard/seller/listings/[id]/edit
- /dashboard/seller/enquiries

MULTI-STEP PROPERTY FORM:
1. Select sale, rent, or supported lease type.
2. Select property category.
3. Enter title, description, price, and property details.
4. Enter address, city, locality, state, and PIN code.
5. Add area, dimensions, and applicable land-specific details.
6. Upload multiple property images.
7. Enter seller contact details.
8. Preview the listing.
9. Submit for moderation.

IMAGE UPLOADS:
- Use configured cloud image storage.
- Validate file type and size.
- Show image previews and upload progress.
- Allow removal and reordering.
- Handle upload failures safely.
- Prevent unauthorised image replacement or deletion.

LISTING STATUS:
- Draft
- Pending review
- Published
- Rejected
- Expired
- Deactivated

SELLER DASHBOARD:
- Total listings
- Active listings
- Pending listings
- Rejected listings
- Recent enquiries
- Edit and deactivate listing
- View listing status and rejection reason
- Respond to enquiries

REQUIREMENTS:
- Users may edit only their own listings unless authorised through agency permissions.
- Validate data on both client and server.
- Do not automatically publish listings when moderation is enabled.
- Save drafts when supported.
- Create an actual database record for every successful submission.
- Prevent duplicate submissions.
- Do not use local files as permanent production image storage.

Test the full owner registration-to-property-publication workflow and verify that listings appear in the correct search results after approval. Preserve all previous work and wait for approval.
```

---

## Prompt 12: Phase 8 (Admin Dashboard) — COMPLETED

```markdown
Phase 8 — Admin dashboard
Continue the existing Landora project. Build a complete, secure administrator dashboard.

ROUTES:
- /admin/dashboard
- /admin/users
- /admin/properties
- /admin/enquiries
- /admin/reports
- /admin/locations
- /admin/packages
- /admin/payments
- /admin/content
- /admin/audit-logs

ACCESS CONTROL:
- Only authorised administrators can access these routes.
- Enforce permissions in server-side code and database operations.
- Do not allow users to become administrators by editing browser values or request payloads.

DASHBOARD OVERVIEW:
- Total users
- Active listings
- Pending approvals
- Rejected listings
- Reported listings
- Recent enquiries
- Payment totals where real payment data exists

PROPERTY MODERATION:
- View all listings
- Search and filter listings
- View property details and seller information
- Approve listings
- Reject listings with a reason
- Deactivate or expire listings
- Review reported listings
- Record moderation history

USER MANAGEMENT:
- Search and view users
- Suspend and reactivate accounts
- Manage authorised roles
- Review abuse reports

OTHER MODULES:
- Location management
- Homepage featured property management
- Basic content management
- Listing package configuration
- Payment record viewing
- Audit logs

Implement confirmation dialogs for destructive actions, pagination, loading states, validation, and clear success/error messages.

All changes must persist in PostgreSQL. Record important administrative actions in audit logs. Test admin permissions and verify that non-admin users cannot access protected operations.

Do not create fake analytics or pretend that payment processing is active if it has not been configured. Preserve previous features and wait for approval.
```

### Implementation Summary:
1. **Strict Server-Side Access Control**:
   - `requireAdminSession()` in `src/lib/auth.ts` verifies signed HTTP-only JWT session cookie and asserts `role === 'ADMIN'`.
   - All `/api/admin/*` endpoints strictly return `403 Forbidden` for unauthenticated or non-admin users.
   - Non-admin client-side shield in `src/app/admin/layout.tsx` blocks unauthorized visits and displays direct link to admin sign-in.
2. **Dashboard Overview (`/admin/dashboard`)**:
   - Real-time KPI summary (Total Users, Active Listings, Pending Approvals, Rejected, Reports, Enquiries, Payment Volume).
   - Priority moderation queue with 1-click approvals and links to inspect listings.
   - Chronological administrative activity preview.
3. **Property Moderation Desk (`/admin/properties`)**:
   - Multi-status filter tabs (All, Pending Review, Active, Rejected, Expired, Deactivated).
   - Search by title, locality, seller name, or ID.
   - Detailed property inspection drawer with owner contact, price, area, approvals, and documents.
   - Moderation actions: Approve (sets status `ACTIVE`, marks `INFO_REVIEWED`), Reject with custom reason modal (sets `REJECTED` and records reason), Deactivate, Expire, and Homepage Featured toggle.
4. **User Governance & Role Management (`/admin/users`)**:
   - Search users by name, email, phone, city, or ID.
   - Role badge filter (BUYER, SELLER, AGENT, BUILDER, ADMIN).
   - Change user role modal with live audit logging.
   - Account suspension & reactivation toggle with instant enforcement.
5. **Platform Enquiries Oversight (`/admin/enquiries`)**:
   - Platform-wide buyer enquiries table with buyer and seller metadata, message preview, and status tracking.
6. **Reported Listings & Compliance (`/admin/reports`)**:
   - Review user abuse reports (misleading pricing, fraud, sold out, encroachments).
   - Update report status (OPEN, INVESTIGATING, RESOLVED, DISMISSED) with resolution notes.
7. **Location Hubs Management (`/admin/locations`)**:
   - Manage primary city hubs and popular localities (Coimbatore, Chennai, Bengaluru, Madurai, Tiruppur, Hyderabad, etc.).
   - Add new locations, edit active status, update localities, delete location hubs.
8. **Homepage & Basic Content Copy (`/admin/content`)**:
   - Manage promotional headlines, marketing copy, and CTAs (`hero_headline`, `post_property_banner`, `announcement_bar`).
9. **Listing Package Configuration (`/admin/packages`)**:
   - Configure pricing tiers (Free, Featured Plot Boost, Builder Pro Pack).
   - Modify quotas, duration validity, featured flags, and features list.
10. **Payment Ledger & Honest Gateway Disclosure (`/admin/payments`)**:
    - Discloses Sandbox / Test Mode status honestly without fabricating transaction statistics.
    - Transaction ledger with IDs, customer email, package name, INR amount, settlement status, and gateway reference.
11. **System Audit Logs (`/admin/audit-logs`)**:
    - Immutable administrative activity audit log recording timestamp, administrator identity, action type, target entity, and notes.
    - Full inspection modal for each log record.

---

## Prompt 13: Phase 9 (Payments, Listing Packages, and Notifications) — COMPLETED

```markdown
Phase 9 — Payments, listing packages, and notifications
Continue the existing Landora project. Implement optional paid property listing packages and notifications.

LISTING PACKAGES:
- Basic
- Featured
- Agent/Builder
Package features, prices, durations, listing limits, and benefits must be configurable by an administrator.

PAYMENTS:
- Integrate Razorpay or another supported payment gateway.
- Create payment orders on the server.
- Verify payment signatures on the server.
- Validate webhook authenticity.
- Make webhook processing idempotent.
- Save payment attempts and confirmed transactions in PostgreSQL.
- Activate paid benefits only after verified payment.
- Handle payment failures, duplicate events, and refunds safely.
- Never trust a browser-only payment success response.

EMAIL NOTIFICATIONS:
- Registration verification
- Password reset
- Listing submitted
- Listing approved or rejected
- New property enquiry
- Enquiry confirmation
- Listing expiry reminder
- Payment confirmation or failure

IN-APP NOTIFICATIONS:
- Unread notification count
- Notification list
- Mark as read
- Appropriate navigation links

Add optional SMS or WhatsApp notifications only if a supported provider and required credentials are configured.
Provide a free/basic listing flow that continues to work if paid features are disabled.
Use environment variables for credentials. Implement sandbox testing before enabling live payments. Do not store card details. Do not report successful payments or sent emails unless confirmed by the relevant provider.
Test payment failures, retries, webhook validation, notifications, and access control. Document setup and remaining limitations, then wait for approval.
```

### Implementation Summary:
1. **Configurable Listing Packages**:
   - `Basic`: Standard Free Listing (₹0, 45 days, 1 active property, direct phone leads). Free tier remains 100% operational.
   - `Featured`: Featured Plot Package (₹1,499, 60 days, 3 listings, featured badge, top search ranking).
   - `Agent/Builder`: Agent & Builder Pro (₹4,999, 90 days, 15 listings, priority review, CRM tools).
   - Fully configurable by administrators at `/admin/packages` and served dynamically via `/api/packages`.
2. **Server-Side Payments & Security**:
   - Server-side order creation (`POST /api/payments/create-order`) with conversion to paise and initial `PENDING` transaction record.
   - Server-side cryptographic HMAC SHA256 signature verification (`POST /api/payments/verify`) using `order_id + "|" + payment_id`. Never trusts browser-only assertions.
   - Webhook endpoint (`POST /api/payments/webhook`) validating `x-razorpay-signature` and providing idempotent processing for `payment.captured`, `payment.failed`, and `refund.processed`.
   - Paid benefits (featured badges, priority placement) are activated ONLY after verified payment confirmation.
   - Card details are NEVER collected or stored on Landora servers.
3. **Email Notification Service (`src/lib/email.ts`)**:
   - Supported 8 events with branded responsive HTML templates:
     1. Registration verification (`sendRegistrationVerificationEmail`)
     2. Password reset (`sendPasswordResetEmail`)
     3. Listing submitted for review (`sendListingSubmittedEmail`)
     4. Listing approved or rejected (`sendListingModerationEmail`)
     5. New property enquiry to seller (`sendNewEnquiryEmail`)
     6. Enquiry confirmation to buyer (`sendEnquiryConfirmationEmail`)
     7. Listing expiry reminder (`sendListingExpiryReminderEmail`)
     8. Payment confirmation or failure (`sendPaymentStatusEmail`)
   - Strict honesty enforcement: returns `providerConfigured: false` when live credentials are not configured, never claiming delivery unless confirmed by provider.
4. **In-App Notification Center**:
   - Interactive notification bell in Header with real-time unread badge counter (`GET /api/user/notifications`).
   - Quick notification dropdown and dedicated notification desk at `/dashboard/notifications`.
   - Single mark-as-read, mark-all-read (`PUT /api/user/notifications`), and deep navigation links (`/properties/[slug]`, `/dashboard/seller/enquiries`, `/dashboard/packages`).
5. **Optional SMS & WhatsApp (`src/lib/sms.ts`)**:
   - Dispatches Twilio SMS/WhatsApp messages only when credentials (`TWILIO_ACCOUNT_SID`, etc.) are configured in environment.
6. **Setup & Environment Configuration**:
   - `RAZORPAY_KEY_ID`: Razorpay public/client key
   - `RAZORPAY_KEY_SECRET`: Razorpay secret key
   - `RAZORPAY_WEBHOOK_SECRET`: Webhook verification secret
   - `RESEND_API_KEY` or `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`: Email provider credentials
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: Optional SMS provider
7. **Remaining Limitations**:
   - Production payments operate in Sandbox / Test simulation mode until production Razorpay API keys are added to `.env`.
   - Live external email dispatch requires configuring `RESEND_API_KEY` or SMTP host in `.env`.

---

## Prompt 14: Phase 10 (Testing, Security, and Deployment) — COMPLETED

```markdown
Phase 10 — Testing, security, and deployment
Complete the existing Landora real estate marketplace for production readiness. Do not redesign or rebuild the entire project unnecessarily.

FUNCTIONAL TESTING
Test:
- Homepage navigation
- Property search and filters
- Sorting and pagination
- Property detail pages
- Registration and login
- Saved properties
- Enquiry submission
- Property posting and editing
- Image uploads
- Seller dashboard
- Admin moderation
- Listing packages
- Payment webhooks
- Notifications

SECURITY
Review:
- Authentication and authorisation
- Record ownership checks
- Input validation
- Secure session cookies
- Password reset flows
- File upload restrictions
- Rate limiting
- SQL injection protection
- Cross-site scripting risks
- CSRF protection where applicable
- Security headers
- Secret management
- Admin audit logging
- Protection of private user and land documents

PERFORMANCE
Implement and test:
- Responsive image optimisation
- Pagination
- Database indexes
- Appropriate server-side rendering
- Efficient database queries
- Loading skeletons
- Error boundaries
- Empty states
- Caching only where safe and appropriate

SEO
Implement:
- Page-specific metadata
- Canonical URLs
- Sitemap
- robots.txt
- Appropriate structured data
- Open Graph metadata
- Descriptive image alt text
- Indexing controls for private routes and unsuitable listing pages

DEPLOYMENT
Prepare the application for a suitable hosting provider such as Vercel with managed PostgreSQL.
Provide:
- Production environment variable checklist
- Database migration instructions
- Database backup and recovery guidance
- Image storage configuration
- Authentication provider setup
- Email provider setup
- Payment gateway sandbox and production setup
- Deployment instructions
- Custom domain and HTTPS checklist
- Logging and error monitoring recommendations

FINAL VERIFICATION
Run linting, type checks, automated tests, and a production build.
Fix all critical errors. Do not hide failed tests or ignore broken workflows.
Provide a final report showing:
- Completed features
- Features requiring external credentials
- Known bugs
- Security limitations
- Deployment status
- Exact commands to run locally and deploy
Do not claim the site is production-ready until critical functionality and security checks have actually passed.
```

### Implementation Summary:
1. **Automated Verification & Test Suites (198/198 Passed)**:
   - Built comprehensive automated production readiness test suite `scripts/test-phase10-production.ts` covering 13 critical areas (43 assertions).
   - Verified 100% pass across all regression test suites:
     - Phase 10: 43/43 tests passed
     - Phase 9 (Payments & Notifications): 41/41 tests passed
     - Phase 8 (Admin Dashboard): 36/36 tests passed
     - Phase 7 (Publishing & Moderation): 29/29 tests passed
     - Phase 6 (Auth & User Dashboard): 49/49 tests passed
2. **Security Hardening**:
   - `next.config.ts`: Enforced strict HTTP security headers:
     - Content Security Policy (`CSP`) restricting scripts, styles, objects, and framing
     - `X-Frame-Options: SAMEORIGIN` (clickjacking protection)
     - `X-Content-Type-Options: nosniff` (MIME-sniffing protection)
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
     - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `src/lib/rate-limit.ts`: Implemented in-memory sliding-window rate limiter with client IP extraction (`x-forwarded-for`). Applied rate limiting on:
     - `/api/auth/login` (10 req/min)
     - `/api/auth/register` (10 req/10 min)
     - `/api/auth/forgot-password` (5 req/15 min)
     - `/api/enquiries` (10 req/5 min)
     - `/api/payments/create-order` (15 req/5 min)
   - Strict session cookies (`httpOnly: true`, `secure: true`, `sameSite: "lax"`, 7 days expiry).
   - Strict backend record ownership enforcement on listing updates, deletion, enquiries, and uploads.
3. **SEO & Crawling Controls**:
   - Schema.org `RealEstateListing` JSON-LD structured data in `src/app/properties/[slug]/page.tsx`.
   - Dynamic sitemap generator `src/app/sitemap.ts` (`/sitemap.xml`) indexing core pages, city location hubs, and active property listings.
   - Dynamic `src/app/robots.ts` (`/robots.txt`) with strict `Disallow` rules for `/admin/`, `/dashboard/`, `/api/`, `/reset-password`, `/verify-email`.
   - Search engine indexing prevention (`noindex, nofollow`) for private administrator and dashboard pages.
   - Comprehensive OpenGraph and Twitter card metadata in `src/app/layout.tsx`.
4. **Reliability & UX Performance**:
   - Global Next.js error boundary `src/app/error.tsx` with error recovery and reference reporting.
   - Responsive loading skeletons `src/app/loading.tsx`.
   - Custom 404 page `src/app/not-found.tsx`.
   - Image optimization configured in `next.config.ts` for Unsplash and Cloudinary remote patterns.
5. **Deployment Package**:
   - Comprehensive `doc/DEPLOYMENT_GUIDE.md` covering Vercel + managed PostgreSQL deployment, Prisma migration commands, backup & recovery (`pg_dump`/`pg_restore`), Cloudinary storage setup, Razorpay sandbox to live transition, custom domain setup, and monitoring.
   - Complete `.env.example` documenting all configuration keys.
6. **Zero TypeScript Errors & Clean Production Build**:
   - `npx tsc --noEmit`: 0 errors.
   - `npm run build`: 84 routes generated successfully with 0 errors.








