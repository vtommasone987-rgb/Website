type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/**
 * Simple fixed-window rate limiter, in-memory. Fine while the rest of the app
 * runs on the in-memory mock store (src/lib/store.ts) in a single process —
 * if this moves to a multi-instance deployment (e.g. serverless on Vercel),
 * swap the Map for a shared store (Upstash Redis, or a DB table) so limits
 * are enforced across instances instead of reset per-instance.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
