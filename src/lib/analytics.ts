/**
 * Vercel Web Analytics 数据读取（服务端）
 *
 * 依赖环境变量（Vercel 部署时自动注入 projectId/teamId，token 需手动配置）：
 * - VERCEL_TOKEN        必填：Vercel Access Token（Settings → Tokens）
 * - VERCEL_PROJECT_ID   必填：部署时自动注入（prj_ 开头）
 * - VERCEL_TEAM_ID      团队项目自动注入，个人项目可省略
 *
 * 未配置时返回 null，界面展示配置引导。
 */

export interface AnalyticsTotals {
  pageviews: number;
  visitors: number;
}

export interface AnalyticsRow {
  key: string;
  pageviews: number;
  visitors: number;
}

export interface AnalyticsData {
  totals: AnalyticsTotals;
  daily: AnalyticsRow[]; // by day，最近 N 天
  countries: AnalyticsRow[]; // top N
  devices: AnalyticsRow[]; // top N
  range: { since: string; until: string };
}

const API_BASE = "https://api.vercel.com/v1/query/web-analytics/visits";

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function query(
  endpoint: "count" | "aggregate",
  params: Record<string, string>,
  token: string,
  teamId?: string
): Promise<unknown> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set("projectId", params.projectId);
  if (teamId) url.searchParams.set("teamId", teamId);
  for (const [k, v] of Object.entries(params)) {
    if (k === "projectId") continue;
    url.searchParams.set(k, v);
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Web Analytics API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function getAnalytics(
  days = 30
): Promise<AnalyticsData | null> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) return null;

  const since = isoDaysAgo(days);
  const until = isoDaysAgo(0);
  const common = { projectId, since, until };

  try {
    const [countRes, dailyRes, countryRes, deviceRes] = await Promise.all([
      query("count", { projectId }, token, teamId),
      query("aggregate", { ...common, by: "day", limit: "31" }, token, teamId),
      query("aggregate", { ...common, by: "country", limit: "10" }, token, teamId),
      query("aggregate", { ...common, by: "deviceType", limit: "5" }, token, teamId),
    ]);

    const countData = (countRes as { data?: { pageviews?: number; visitors?: number } })
      ?.data;

    const mapRows = (
      data: unknown,
      keyField: string
    ): AnalyticsRow[] => {
      const rows = (data as { data?: Array<Record<string, unknown>> })?.data;
      if (!Array.isArray(rows)) return [];
      return rows.map((r) => ({
        key:
          keyField === "timestamp"
            ? String(r.timestamp ?? "").slice(0, 10)
            : String(r[keyField] ?? "Unknown"),
        pageviews: Number(r.pageviews ?? 0),
        visitors: Number(r.visitors ?? 0),
      }));
    };

    return {
      totals: {
        pageviews: countData?.pageviews ?? 0,
        visitors: countData?.visitors ?? 0,
      },
      daily: mapRows(dailyRes, "timestamp"),
      countries: mapRows(countryRes, "country"),
      devices: mapRows(deviceRes, "deviceType"),
      range: { since, until },
    };
  } catch (err) {
    console.error("[analytics] fetch failed:", err);
    return null;
  }
}
