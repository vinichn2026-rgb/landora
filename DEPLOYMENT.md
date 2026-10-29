# Landora Real Estate Platform — Production Deployment & Operations Manual

This guide outlines the complete operational procedures for deploying, configuring, monitoring, and maintaining the **Landora Real Estate Marketplace** in production environments (Vercel, AWS, Coolify, or Docker/Self-Hosted VPS).

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |   Cloudflare / DNS & CDN    |
                      |   (SSL, WAF, Edge Caching)  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Next.js 16 (App Router)   |
                      |   Node.js 20+ Server Runtime|
                      +--------------+--------------+
                                     |
       +-----------------------------+-----------------------------+
       |                             |                             |
       v                             v                             v
+--------------+              +--------------+              +--------------+
|  PostgreSQL  |              |  Cloudinary  |              |   Razorpay   |
|  (Neon/RDS)  |              | Image CDN    |              | Payment GW   |
+--------------+              +--------------+              +--------------+
       |                             |                             |
       v                             v                             v
+--------------+              +--------------+              +--------------+
| Resend/SMTP  |              | Fast2SMS /   |              | WhatsApp API |
| Transactional|              | Twilio SMS   |              | Business GW  |
+--------------+              +--------------+              +--------------+
```

---

## 2. Production Environment Variables Checklist

Store these in your hosting platform's Secrets Manager (e.g., Vercel Project Settings > Environment Variables, or Docker `.env.production`).

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables optimized runtime & security guards |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://landora.in` | Canonical URL prefix for sitemaps, emails, redirects |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-host.neon.tech/landora?sslmode=require` | PostgreSQL connection string |
| `AUTH_SECRET` | **Yes** | `32+ char random base64 string` | JWT session signature key (`openssl rand -base64 32`) |
| `INITIAL_ADMIN_EMAIL` | **Yes** | `admin@landora.in` | Designated bootstrap administrator email |
| `RAZORPAY_KEY_ID` | **Yes** | `rzp_live_...` | Razorpay Live API key |
| `RAZORPAY_KEY_SECRET` | **Yes** | `...` | Razorpay Live API secret |
| `RAZORPAY_WEBHOOK_SECRET`| **Yes**| `...` | Webhook verification HMAC SHA256 secret |
| `RESEND_API_KEY` | Recommended | `re_...` | Transactional email provider API key |
| `EMAIL_FROM` | Optional | `Landora <notifications@landora.in>`| Verified sender email address |
| `SMS_PROVIDER_API_KEY` | Optional | `...` | Fast2SMS / 2Factor / Twilio SMS gateway API key |
| `ADMIN_ALERT_PHONE` | Optional | `+919842200001` | Mobile number for admin submission SMS alerts |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | `landora-cloud` | Cloudinary storage bucket |
| `CLOUDINARY_API_KEY` | Optional | `...` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Optional | `...` | Cloudinary API Secret |

---

## 3. Database Setup & Migration

Landora uses **Prisma ORM** with PostgreSQL.

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Run Database Migrations in Production
To apply pending schema migrations without prompting:
```bash
npx prisma migrate deploy
```
*(Alternatively, for direct schema push on managed instances like Neon: `npx prisma db push --skip-generate`)*

### Step 3: Verify Schema Sync
```bash
npx prisma db pull --print
```

---

## 4. Backup & Disaster Recovery Procedures

Regular automated database snapshots are mandatory for high data integrity.

### Taking an Immediate PostgreSQL Backup
```bash
pg_dump "$DATABASE_URL" -Fc -f "landora_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Restoring from a Backup
```bash
# Caution: This will replace current database state
pg_restore -d "$DATABASE_URL" --clean --no-owner --no-privileges "landora_backup_YYYYMMDD_HHMMSS.dump"
```

### Automated Backup Recommendation
- **Neon / AWS RDS / Supabase**: Enable Daily Automated Snapshots with point-in-time recovery (PITR) set to 7-30 days.

---

## 5. Domain, DNS & SSL Configuration

1. **DNS Records**:
   - `A` Record: `@` pointing to server IP (or CNAME `cname.vercel-dns.com` for Vercel).
   - `CNAME` Record: `www` pointing to `landora.in`.
2. **SSL / TLS**:
   - Minimum TLS Version: `TLS 1.2` (TLS 1.3 recommended).
   - Enable HSTS (`Strict-Transport-Security`) at CDN level if not terminating at application layer.
3. **HTTP to HTTPS**:
   - Strict 301 redirection of all port 80 traffic to HTTPS.

---

## 6. Image Optimization & Storage Architecture

- **Supported Upload Formats**: JPEG, PNG, WebP.
- **Server Guard**: Image uploads validate binary magic byte headers (`FF D8 FF`, `89 50 4E 47`, `RIFF...WEBP`) preventing masked executables or scripts.
- **Client Processing**: Camera and gallery photos are previewed and resized before transfer.
- **Cloud Delivery**: For production scale, upload to Cloudinary or AWS S3 and serve via CloudFront / Fastly.

---

## 7. Security Hardening Checklist

- [x] **CSRF / Origin Check**: Webhooks verify HMAC-SHA256 signatures before processing payments.
- [x] **Rate Limiting**: Sliding window rate limits protect:
  - `/api/auth/login` (5 attempts / 60s)
  - `/api/auth/otp/send` (3 attempts / 300s)
  - `/api/auth/reset-password` (5 attempts / 300s)
  - `/api/upload` (30 requests / 60s)
- [x] **Strict Tenant Isolation**: Record modification and deletion verify that `property.sellerId === session.userId` or `session.role === "ADMIN"`.
- [x] **Indexing Controls**: Private, unapproved, draft, or sold properties dynamically return `noindex, nofollow` to prevent crawling by search engines.
- [x] **Sanitized Outputs**: XSS protection headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`) enabled in `next.config.ts`.
- [x] **Permissions Policy**: `camera=(self), microphone=(), geolocation=(self)` configured for mobile photo capture while blocking microphone surveillance.

---

## 8. Monitoring, Logging & Health Checks

- **Health Check Route**: `GET /api/health` returns status of the database and memory store.
- **Error Tracking**: Integrate Sentry (`@sentry/nextjs`) by configuring `NEXT_PUBLIC_SENTRY_DSN`.
- **Audit Logs**: All administrative approvals, status overrides, and user changes are recorded in the `AdminAuditLog` table.
- **Notification Queues**: Monitor delivery failures via the Admin Dashboard (`/dashboard/admin/notifications`) where automatic and manual retry buttons are accessible.
