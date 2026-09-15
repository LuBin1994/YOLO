/**
 * 后台时间处理：统一按 UTC+8（Asia/Shanghai）理解与展示。
 *
 * 为什么要固定时区：
 * - 询盘时间会同时经服务端渲染和浏览器 hydration，用本地时区会在两端算出不同结果
 * - 数据库里 created_at 是 timestamptz，筛选「某一天」时必须先确定这一天属于哪个时区
 */

export const ADMIN_TIME_ZONE = "Asia/Shanghai";
/** 对应 ADMIN_TIME_ZONE 的 UTC 偏移，用于把「某天」换算成绝对时间戳 */
export const ADMIN_UTC_OFFSET = "+08:00";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 是否为合法的 YYYY-MM-DD 输入 */
export function isDateInput(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00${ADMIN_UTC_OFFSET}`);
  return !Number.isNaN(date.getTime());
}

/** 某天 00:00:00.000（UTC+8）对应的 UTC ISO 时间戳，用于 gte 过滤 */
export function startOfDayISO(date: string): string | null {
  if (!isDateInput(date)) return null;
  return new Date(`${date}T00:00:00.000${ADMIN_UTC_OFFSET}`).toISOString();
}

/** 某天 23:59:59.999（UTC+8）对应的 UTC ISO 时间戳，用于 lte 过滤 */
export function endOfDayISO(date: string): string | null {
  if (!isDateInput(date)) return null;
  return new Date(`${date}T23:59:59.999${ADMIN_UTC_OFFSET}`).toISOString();
}

/** 今天的 YYYY-MM-DD（按 UTC+8 判定） */
export function todayInAdminTz(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

/** 日期加减天数。全程在 UTC 基准上做，纯日期运算不受时区影响 */
export function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/**
 * 格式化为 YYYY-MM-DD HH:mm（UTC+8）。
 * 用 formatToParts 手工拼接而不用 toLocaleString，避免不同运行时/locale 下的排版差异。
 */
export function formatDateTime(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ADMIN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));

  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")} ${pick("hour")}:${pick("minute")}`;
}
