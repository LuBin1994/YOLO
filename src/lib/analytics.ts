/**
 * Vercel Web Analytics 数据读取（服务端）
 *
 * 依赖环境变量：
 * - VERCEL_TOKEN        必填：Vercel Access Token（Dashboard → Settings → Tokens）
 * - VERCEL_PROJECT_ID   必填：prj_ 开头
 * - VERCEL_TEAM_ID      仅团队（Team）项目需要，个人账号项目留空
 *
 * 【重要】VERCEL_PROJECT_ID / VERCEL_TEAM_ID 是 Vercel 的「系统环境变量」，
 * 只在 Vercel 平台上的构建与运行时注入。用 `next dev` 在本地跑时它们**不存在**，
 * 必须在 .env.local 里手动填写；否则本模块只会返回 unconfigured。
 * 本地不想手填，可改用 `vercel dev`，或先 `vercel link` 再填 .vercel/project.json 里的值。
 *
 * 返回值区分三种状态，避免「没配置」与「调用失败」都显示成同一句话：
 * - ok            取数成功
 * - unconfigured  缺少环境变量（附带缺失的变量名）
 * - error         API 调用失败（附带真实错误信息，便于排障）
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

export type AnalyticsResult =
  | { status: "ok"; data: AnalyticsData }
  /** 缺少环境变量。missing 列出缺了哪几个，直接展示给管理员。 */
  | { status: "unconfigured"; missing: string[] }
  /** API 调用失败（token 无权限、项目未开启 Web Analytics、网络问题等）。 */
  | { status: "error"; message: string };

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
    throw new Error(
      `Web Analytics API ${res.status} ${res.statusText}: ${text.slice(0, 300)}`
    );
  }
  return res.json();
}

export async function getAnalytics(
  days = 30
): Promise<AnalyticsResult> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  const missing: string[] = [];
  if (!token) missing.push("VERCEL_TOKEN");
  if (!projectId) missing.push("VERCEL_PROJECT_ID");
  // 分开判断：既能列出全部缺失项，又能让 TS 在此之后把两者收窄为 string
  if (!token || !projectId) return { status: "unconfigured", missing };

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
      status: "ok",
      data: {
        totals: {
          pageviews: countData?.pageviews ?? 0,
          visitors: countData?.visitors ?? 0,
        },
        daily: mapRows(dailyRes, "timestamp"),
        countries: mapRows(countryRes, "country"),
        devices: mapRows(deviceRes, "deviceType"),
        range: { since, until },
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[analytics] fetch failed:", message);
    return { status: "error", message };
  }
}
