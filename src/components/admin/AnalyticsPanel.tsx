import type { AnalyticsResult } from "@/lib/analytics";
import { deviceLabel } from "@/lib/utils";

/**
 * 后台数据看板面板：UV/PV、每日趋势、地域、设备。
 * 纯 CSS 可视化，无第三方图表库。
 *
 * 三种状态分别渲染：未配置（列出缺失变量）/ 取数失败（展示真实错误）/ 正常。
 */
export default function AnalyticsPanel({
  result,
}: {
  result: AnalyticsResult;
}) {
  // 未配置：把缺失的变量名列出来，并说清本地与线上是两套配置
  if (result.status === "unconfigured") {
    return (
      <div className="border border-ink-900/8 bg-white p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
          访客数据
        </p>
        <p className="mt-4 text-sm font-medium text-ink-950">
          尚未配置：缺少{" "}
          {result.missing.map((k, i) => (
            <span key={k}>
              {i > 0 ? "、" : ""}
              <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">{k}</code>
            </span>
          ))}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          注意：<code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">VERCEL_PROJECT_ID</code>{" "}
          属于 Vercel 的<strong className="font-medium text-ink-950">系统环境变量</strong>
          ，只在 Vercel 平台上的构建与运行时注入。
          <strong className="font-medium text-ink-950">
            本地 <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">next dev</code> 不会自动带上它
          </strong>
          ，需要在 <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">.env.local</code> 手动填写。
        </p>
        <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-600">
          <li>
            · 取值位置：Vercel Dashboard → 项目 → Settings → General → Project ID（
            <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">prj_</code> 开头）
          </li>
          <li>
            · 团队（Team）项目还需填{" "}
            <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">VERCEL_TEAM_ID</code>
            （<code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">team_</code> 开头）；个人账号留空
          </li>
          <li>
            · <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
            不会上传到 Vercel，线上需在 Project → Settings → Environment Variables 单独配置
          </li>
        </ul>
      </div>
    );
  }

  // 取数失败：把 API 的真实报错亮出来，而不是伪装成「未配置」
  if (result.status === "error") {
    return (
      <div className="border border-ink-900/8 bg-white p-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
          访客数据
        </p>
        <p className="mt-4 text-sm font-medium text-ink-950">
          已配置，但调用 Vercel Web Analytics API 失败
        </p>
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all rounded bg-sand-100 p-4 text-xs leading-relaxed text-ink-600">
          {result.message}
        </pre>
        <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-600">
          <li>· 401/403：token 无效、已过期，或不属于该项目所属账号/团队</li>
          <li>· 404：projectId 写错，或该项目尚未开启 Web Analytics</li>
          <li>· 项目属于团队时，必须同时提供 VERCEL_TEAM_ID</li>
        </ul>
      </div>
    );
  }

  const { totals, daily, countries, devices, range } = result.data;
  const maxDaily = Math.max(...daily.map((d) => d.pageviews), 1);
  const maxCountry = Math.max(...countries.map((c) => c.visitors), 1);
  const maxDevice = Math.max(...devices.map((d) => d.visitors), 1);

  return (
    <div className="space-y-8">
      {/* 顶部指标 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-ink-900/8 bg-white p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            独立访客（UV）
          </p>
          <p className="mt-4 text-5xl font-medium tracking-tight text-ink-950">
            {totals.visitors.toLocaleString()}
          </p>
        </div>
        <div className="border border-ink-900/8 bg-white p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            浏览量（PV）
          </p>
          <p className="mt-4 text-5xl font-medium tracking-tight text-ink-950">
            {totals.pageviews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 每日趋势 */}
      <div className="border border-ink-900/8 bg-white p-8">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            每日浏览量
          </p>
          <p className="text-xs text-ink-400">
            {range.since} → {range.until}
          </p>
        </div>
        {daily.length === 0 ? (
          <p className="mt-6 text-sm text-ink-400">当前时间窗口暂无数据。</p>
        ) : (
          <div className="mt-8 flex h-40 items-end gap-1">
            {daily.map((d, i) => (
              <div
                key={i}
                title={`${d.key}: ${d.pageviews} 次浏览 / ${d.visitors} 位访客`}
                className="flex-1 bg-ink-950/85 transition-colors duration-200 hover:bg-volt-400"
                style={{ height: `${Math.max((d.pageviews / maxDaily) * 100, 2)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 地域 */}
        <div className="border border-ink-900/8 bg-white p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            热门国家/地区
          </p>
          {countries.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">暂无数据。</p>
          ) : (
            <ul className="mt-7 space-y-5">
              {countries.map((c) => (
                <li key={c.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-ink-950">{c.key}</span>
                    <span className="text-ink-400">
                      {c.visitors.toLocaleString()} 位访客
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-sand-100">
                    <div
                      className="h-full bg-ink-950"
                      style={{ width: `${(c.visitors / maxCountry) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 设备 */}
        <div className="border border-ink-900/8 bg-white p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            设备分布
          </p>
          {devices.length === 0 ? (
            <p className="mt-6 text-sm text-ink-400">暂无数据。</p>
          ) : (
            <ul className="mt-7 space-y-5">
              {devices.map((d) => (
                <li key={d.key}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-ink-950">
                      {deviceLabel(d.key)}
                    </span>
                    <span className="text-ink-400">
                      {Math.round(
                        (d.visitors / Math.max(totals.visitors, 1)) * 100
                      )}
                      % · {d.visitors.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-sand-100">
                    <div
                      className="h-full bg-moss-500"
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
