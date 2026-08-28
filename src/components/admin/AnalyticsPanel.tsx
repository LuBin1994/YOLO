import type { AnalyticsData } from "@/lib/analytics";
import { deviceLabel } from "@/lib/utils";

/**
 * 后台数据看板面板：UV/PV、每日趋势、地域、设备。
 * 纯 CSS 可视化，无第三方图表库。
 */
export default function AnalyticsPanel({
  data,
}: {
  data: AnalyticsData | null;
}) {
  if (!data) {
    return (
      <div className="border hairline bg-white/60 p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
          访客数据
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          暂无访客数据：请在项目环境变量中配置{" "}
          <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">VERCEL_TOKEN</code>{" "}
          以启用数据面板（
          <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">VERCEL_PROJECT_ID</code>{" "}
          由 Vercel 自动注入）。
        </p>
      </div>
    );
  }

  const { totals, daily, countries, devices, range } = data;
  const maxDaily = Math.max(...daily.map((d) => d.pageviews), 1);
  const maxCountry = Math.max(...countries.map((c) => c.visitors), 1);
  const maxDevice = Math.max(...devices.map((d) => d.visitors), 1);

  return (
    <div className="space-y-10">
      {/* 顶部指标 */}
      <div className="grid grid-cols-2 gap-5">
        <div className="border hairline bg-white/70 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
            独立访客（UV）
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">
            {totals.visitors.toLocaleString()}
          </p>
        </div>
        <div className="border hairline bg-white/70 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
            浏览量（PV）
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">
            {totals.pageviews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 每日趋势 */}
      <div className="border hairline bg-white/70 p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
            每日浏览量
          </p>
          <p className="text-xs text-ink-400">
            {range.since} → {range.until}
          </p>
        </div>
        {daily.length === 0 ? (
          <p className="mt-6 text-sm text-ink-400">
            当前时间窗口暂无数据。
          </p>
        ) : (
          <div className="mt-6 flex h-32 items-end gap-1">
            {daily.map((d, i) => (
              <div
                key={i}
                title={`${d.key}: ${d.pageviews} 次浏览 / ${d.visitors} 位访客`}
                className="group relative flex-1 bg-forest-700/70 transition-colors hover:bg-forest-600"
                style={{ height: `${Math.max((d.pageviews / maxDaily) * 100, 2)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* 地域 */}
        <div className="border hairline bg-white/70 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
            热门国家/地区
          </p>
          {countries.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">暂无数据。</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {countries.map((c) => (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-ink-900">{c.key}</span>
                    <span className="text-ink-400">
                      {c.visitors.toLocaleString()} 位访客
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-sand-100">
                    <div
                      className="h-full bg-forest-700/70"
                      style={{ width: `${(c.visitors / maxCountry) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 设备 */}
        <div className="border hairline bg-white/70 p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
            设备分布
          </p>
          {devices.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">暂无数据。</p>
          ) : (
            <ul className="mt-6 space-y-4">
              {devices.map((d) => (
                <li key={d.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-ink-900">
                      {deviceLabel(d.key)}
                    </span>
                    <span className="text-ink-400">
                      {Math.round(
                        (d.visitors / Math.max(totals.visitors, 1)) * 100
                      )}
                      % · {d.visitors.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-sand-100">
                    <div
                      className="h-full bg-moss-500/80"
                      style={{ width: `${(d.visitors / maxDevice) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
