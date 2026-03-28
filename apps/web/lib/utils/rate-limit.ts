import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful degradation: if Upstash is not configured, all limits pass.
// Rate limiting failure must never block a legitimate user.

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

function createLimiter(
  requests: number,
  windowSeconds: number
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    analytics: false,
  });
}

// Named limiters — tune these values as traffic grows.
const limiters = {
  postCreate: createLimiter(10, 3600),   // 10 posts per hour per user
  postReact: createLimiter(60, 60),       // 60 reactions per minute per user
  authAttempts: createLimiter(5, 900),    // 5 auth attempts per 15 min per IP
} as const;

export type LimiterName = keyof typeof limiters;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}

export async function checkLimit(
  name: LimiterName,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = limiters[name];

  // No limiter configured — allow all requests with dummy values
  if (!limiter) {
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }

  try {
    const result = await limiter.limit(`${name}:${identifier}`);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: Math.floor(result.reset / 1000),
    };
  } catch (err) {
    // Upstash unreachable — fail open, log warning
    console.warn("[rate-limit] Upstash unreachable — allowing request", { name, err });
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
