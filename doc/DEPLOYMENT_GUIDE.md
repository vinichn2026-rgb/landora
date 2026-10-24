# Landora Real Estate Marketplace — Production Deployment Guide

This guide provides end-to-end instructions for deploying **Landora** to production on **Vercel** with a managed **PostgreSQL** database (such as Neon, Supabase, or AWS RDS).

---

## 1. Production Environment Variables Checklist

Ensure the following environment variables are set in your deployment dashboard (e.g., Vercel Project Settings > Environment Variables):

| Variable | Required? | Description | Example / Recommendations |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Connection string for PostgreSQL | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | **Yes** | 32+ char secret for session token signing | Generate via `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public canonical URL | `https://landora.in` |
| `NODE_ENV` | **Yes** | Node environment | `production` |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Key ID | `rzp_live_...` (or test key for sandbox) |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay Secret Key | Confidential webhook & HMAC secret |
| `RAZORPAY_WEBHOOK_SECRET`| Optional | Razorpay Webhook Secret | Matches secret set in Razorpay Dashboard |
| `RESEND_API_KEY` | Optional | Transactional email provider | `re_...` |
| `EMAIL_FROM` | Optional | Outgoing email address | `Landora <notifications@landora.in>` |
| `CLOUDINARY_URL` | Optional | Cloud image storage | `cloudinary://api_key:secret@cloud_name` |
| `TWILIO_ACCOUNT_SID` | Optional | SMS/WhatsApp gateway SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Optional | SMS/WhatsApp gateway token | Token string |

---

## 2. Database Setup & Migration Instructions

### A. Initializing Schema
Landora uses **Prisma ORM** with standard PostgreSQL schemas defined in [`prisma/schema.prisma`](../prisma/schema.prisma).

1. To apply the schema to a clean production database:
   ```bash
   npx prisma db push
   ```
2. Or generate and apply explicit versioned migrations:
   ```bash
   npx prisma migrate deploy
   ```

### B. Seeding Initial Data
To seed initial administrative accounts, location hubs, and sample packages:
```bash
npm run prisma:seed
```

### C. Database Indexes
The production schema already includes optimized B-tree indexes for all major query paths:
- `Property`: Indexes on `[city]`, `[locality]`, `[propertyType]`, `[listingType]`, `[price]`, `[area]`, `[status]`, `[isFeatured]`, and `[createdAt]`
- `PropertyImage`: Indexes on `[propertyId]` and `[isPrimary]`
- `Enquiry`: Indexes on `[propertyId]`, `[sellerId]`, and `[status]`
- `SavedProperty`: Unique index on `[userId, propertyId]`
- `AuditLog`: Chronological indexing on administrative actions

---

## 3. Database Backup & Disaster Recovery

### A. Automated Daily Backups
- If using **Neon** or **Supabase**, enable automated daily backups and Point-In-Time-Recovery (PITR).
- If self-hosting PostgreSQL on AWS EC2 or RDS, configure automated daily snapshot policies.

### B. Manual Backup Script (`pg_dump`)
```bash
pg_dump "$DATABASE_URL" -Fc -f "landora_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### C. Restoration Command (`pg_restore`)
```bash
pg_restore --clean --no-owner --dbname="$DATABASE_URL" landora_backup_20261024_000000.dump
```

---

## 4. Cloud Image Storage Configuration

1. Create a free/production account on **Cloudinary** (https://cloudinary.com).
2. Create an upload preset configured for auto-format (WebP/AVIF) and quality optimization.
3. Configure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
4. Next.js image optimizer in `next.config.ts` is pre-configured with `res.cloudinary.com` and `images.unsplash.com`.

---

## 5. Authentication Provider Setup

- Landora uses cryptographic bcrypt password hashing and signed HTTP-only JWT sessions.
- In production, session cookies are configured with:
  - `httpOnly: true` (prevents client-side JavaScript access)
  - `secure: true` (transmitted only over HTTPS)
  - `sameSite: "lax"` (mitigates CSRF)
  - `maxAge: 7 * 24 * 60 * 60` (7-day validity)
- Session tokens are verified cryptographically via `JWT_SECRET`. Ensure `JWT_SECRET` is never committed to Git.

---

## 6. Email Provider Setup

Landora supports two production email transport drivers:

### Option 1: Resend (Recommended)
1. Sign up at https://resend.com and verify your domain (e.g. `landora.in`).
2. Add DNS records (DKIM, SPF, and DMARC) at your domain registrar.
3. Generate an API Key and set:
   ```env
   RESEND_API_KEY="re_..."
   EMAIL_FROM="Landora Marketplace <notifications@landora.in>"
   ```

### Option 2: SMTP (AWS SES, Mailgun, SendGrid)
Set the standard SMTP environment variables:
```env
SMTP_HOST="email-smtp.ap-south-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="AKIA..."
SMTP_PASS="B..."
```

---

## 7. Payment Gateway Setup (Razorpay)

### A. Sandbox Testing
1. Visit https://dashboard.razorpay.com and toggle into **Test Mode**.
2. Navigate to **Account & Settings > API Keys** and generate Test Key and Secret.
3. Set:
   ```env
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   ```
4. Test payments using standard Razorpay test cards or test UPI handles.

### B. Production Activation
1. Complete KYC and business verification on Razorpay.
2. Toggle to **Live Mode** and generate Live Keys.
3. Update environment variables in Vercel to use `rzp_live_...`.
4. Webhook Setup:
   - In Razorpay Dashboard > Webhooks, add endpoint: `https://landora.in/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`, `refund.processed`
   - Copy the secret and set `RAZORPAY_WEBHOOK_SECRET` in Vercel.

---

## 8. Deployment to Vercel

### Step 1: Connect Git Repository
1. Push repository to GitHub or GitLab.
2. In Vercel, click **Add New > Project** and import the `land` repository.

### Step 2: Configure Build Command & Output
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Step 3: Add Environment Variables
Paste the checklist from Section 1 into Vercel Project Settings.

### Step 4: Deploy
Click **Deploy**. Vercel will build all static and dynamic pages and deploy to global Edge Network.

---

## 9. Custom Domain & HTTPS Checklist

1. In Vercel Dashboard, navigate to **Settings > Domains**.
2. Add your custom domain (e.g. `landora.in` and `www.landora.in`).
3. Update DNS records at your registrar:
   - For Apex (`landora.in`): Add `A` record pointing to `76.76.21.21`
   - For Subdomain (`www`): Add `CNAME` record pointing to `cname.vercel-dns.com`
4. Vercel automatically provisions and renews Let's Encrypt SSL/TLS certificates.
5. In `next.config.ts`, `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` is active to enforce HTTPS.

---

## 10. Logging, Monitoring & Observability

- **Application Performance & Error Tracking**: Connect Sentry (`@sentry/nextjs`) by supplying `NEXT_PUBLIC_SENTRY_DSN`.
- **Runtime Log Drains**: Use Vercel Log Drains to forward structured JSON logs to Datadog, Axiom, or Better Stack.
- **Audit Logs**: Administrative actions (moderation, role modifications, suspensions, hubs, copy changes) are permanently stored in the `AuditLog` table and can be viewed anytime at `/admin/audit-logs`.
