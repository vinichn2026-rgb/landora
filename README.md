# Landora (Phase 1)
> Premium Indian Real Estate & Land-Selling Marketplace inspired by 99acres.com

---

## 1. Project Overview

**Landora** is a modern, responsive Indian real estate marketplace designed for discovering, buying, selling, and enquiring about residential plots, agricultural farmlands, independent houses, villas, and commercial real estate.

* **Primary Market:** India, starting with Tamil Nadu (Coimbatore, Chennai, Madurai) and South India.
* **Target Audience:** Property buyers, landowners, promoters, real estate brokers, and builders.

---

## 2. Technology Stack

* **Framework:** Next.js (App Router, React 19)
* **Language:** TypeScript 5
* **Styling & Design System:** Tailwind CSS v4 with custom design tokens
* **Icons:** Lucide React
* **Planned Backend:** PostgreSQL with Prisma ORM
* **Form Validation:** Zod

---

## 3. Phase 1 Implementation Summary

Phase 1 focuses on building the foundational design system, core UI primitives, global layout, responsive container, brand components, and clean modular directory structure:

### A. Design System & Visual Tokens
* **Backgrounds:** Clean white (`#ffffff`) and warm off-white (`#fbfbfa`)
* **Primary Brand Colour:** Deep Forest Green (`#0c4a3e`, dark: `#072e27`, light: `#115e4f`, surface: `#f0f5f3`)
* **Accents:** Subtle Gold (`#c59b27`, hover: `#dfb33d`, surface: `#fdfaf2`)
* **Typography & Surfaces:** Forest Charcoal (`#132a24`), muted text (`#526b63`), subtle border (`#e2e8e4`)

### B. Reusable UI Components (`src/components/ui/`)
* **`Button`**: Primary, Secondary, Accent (Gold), Outline, Ghost, and Danger variants with sizes, loading spinner, and icon slots.
* **`Input`**: Accessible field with label, error message, helper text, and left/right icon support.
* **`Select`**: Accessible dropdown selector with chevron icon and validation states.
* **`Badge`**: Status indicators for verification (`verified`, `contact-verified`, `unreviewed`), property types, and featured tags.
* **`Card`**: Structured card container (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
* **`Container`**: Standard responsive container (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
* **`LoadingSpinner` & `Skeleton`**: Loading states and skeleton placeholders.
* **`EmptyState`**: Empty search/listing feedback block with icon and call-to-action button.
* **`ErrorMessage`**: User-friendly error alert with retry callback.

### C. Domain & Brand Components (`src/components/`)
* **`BrandLogo`**: Original Landora geometric monogram and typography.
* **`Header`**: Responsive navigation bar with location selector, navigation links, and "Post Property" CTA.
* **`Footer`**: Directory links, advisory desk contact, and statutory due-diligence disclaimer.
* **`PropertyCard`**: Card layout for Indian property types, price in INR, specs, and verification badges.
* **`SearchForm`**: Tabbed search widget (Plots/Land, Buy, Rent, Commercial).

---

## 4. Directory Structure

```text
src/
├── app/                  # Next.js App Router pages and global layouts
│   ├── globals.css       # Design tokens and Tailwind CSS rules
│   ├── layout.tsx        # Root HTML layout with metadata
│   └── page.tsx          # Homepage with all Phase 1 sections
├── components/           # Feature and layout components
│   ├── ui/               # Reusable atomic design system primitives
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Select.tsx
│   │   └── index.ts
│   ├── BrandLogo.tsx     # Original Landora brand monogram
│   ├── Header.tsx        # Responsive site header
│   ├── Footer.tsx        # Multi-column site footer
│   ├── PropertyCard.tsx  # Reusable property card
│   └── SearchForm.tsx    # Tabbed search component
├── lib/                  # Utilities, constants, and data services
│   ├── constants.ts      # Configurable app settings and category lists
│   ├── seed-data.ts      # Sample property records for development
│   ├── store.ts          # Repository layer
│   └── validation.ts     # Zod schemas
└── types/                # Shared TypeScript definitions
    └── index.ts
```

---

## 5. Getting Started & Development

### Prerequisites
* Node.js (v20+ recommended)
* npm or pnpm

### Installation
```bash
# Install dependencies
npm install
```

### Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_APP_NAME="Landora"
DATABASE_URL="postgresql://user:password@localhost:5432/landora?schema=public"
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Production Build
```bash
npm run build
npm run start
```
