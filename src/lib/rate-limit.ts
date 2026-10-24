import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

declare global {
  var __landora_rate_limits: Map<string, RateLimitRecord> | undefined;
}

if (!globalThis.__landora_rate_limits) {
  globalThis.__landora_rate_limits = new Map();
}

/**
 * In-memory sliding window rate limiter
 * Clean, safe, zero-dependency rate limiting for Next.js API routes.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const store = globalThis.__landora_rate_limits!;
  const now = Date.now();
  const record = store.get(key);

  // Clean expired record or initialize new window
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = { count: 1, resetAt: now + windowMs };
    store.set(key, newRecord);
    return { allowed: true, remaining: limit - 1, resetAt: newRecord.resetAt };
  }

  // Increment within window
  record.count += 1;
  store.set(key, record);

  const allowed = record.count <= limit;
  const remaining = Math.max(0, limit - record.count);

  return { allowed, remaining, resetAt: record.resetAt };
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

/**
 * Middleware helper for API route handlers
 * Returns NextResponse (429) if rate limited, or null if allowed.
 */
export function applyRateLimit(
  request: NextRequest,
  actionKey: string,
  limit: number = 20,
  windowMs: number = 60000 // 1 minute
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${actionKey}:${ip}`;

  const { allowed, remaining, resetAt } = checkRateLimit(key, limit, windowMs);

  if (!allowed) {
    const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: `Too many requests for this operation. Please wait ${retryAfterSeconds} seconds before retrying.`,
        retryAfter: retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetAt),
        },
      }
    );
  }

  return null;
}
