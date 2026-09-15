/**
 * 进程级内存限流（令牌桶/固定窗口）
 *
 * 适用场景与边界（务必知悉）：
 * - Vercel Serverless 是多实例并发的，每个实例有独立的 Map，
 *   因此本实现是「单实例级」限流，不能保证全局精确配额。
 * - 它的目标是挡掉低成本的脚本扫描与误触重试，把 95% 的噪声挡在数据库与 SMTP 之前，
 *   而不是防御分布式攻击（那需要 WAF / 边缘限流，见 README 生产检查清单）。
 * - 实例常驻期间会定期清理过期桶，避免内存无界增长。
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/** 超过该体积时触发一次全量清理 */
const MAX_ENTRIES = 5000;

function sweep(now: number) {
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** 还剩多少次可用（ok 为 false 时为 0） */
  remaining: number;
  /** 建议重试等待秒数 */
  retryAfter: number;
}

/**
 * 固定窗口限流
 * @param key      限流键（一般用 IP + 业务前缀）
 * @param limit    窗口内允许的最大次数
 * @param windowMs 窗口长度（毫秒）
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (store.size > MAX_ENTRIES) sweep(now);

  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * 从请求头解析客户端 IP（Vercel 边缘注入 x-forwarded-for / x-real-ip）。
 * 取不到时返回 "unknown"，由调用方决定降级策略。
 */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
