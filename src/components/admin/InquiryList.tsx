"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import DeleteButton from "./DeleteButton";
import Pagination from "./Pagination";
import type { Inquiry, InquiryStatus } from "@/lib/supabase/types";
import { formatDateTime, shiftDate, todayInAdminTz } from "@/lib/datetime";

const STATUS_META: Record<InquiryStatus, { label: string; cls: string }> = {
  new: { label: "新询盘", cls: "bg-moss-500/15 text-moss-600" },
  read: { label: "已读", cls: "bg-amber-500/15 text-amber-600" },
  replied: { label: "已回复", cls: "bg-forest-700/10 text-forest-700" },
};

/** 快捷时段：null 表示不限时间段 */
const QUICK_RANGES: readonly { label: string; days: number | null }[] = [
  { label: "今天", days: 1 },
  { label: "近 7 天", days: 7 },
  { label: "近 30 天", days: 30 },
  { label: "不限", days: null },
];

interface InquiryListProps {
  inquiries: Inquiry[];
  total: number;
  page: number;
  pageSize: number;
  keyword: string;
  fromDate: string;
  toDate: string;
}

interface FilterOverride {
  q?: string;
  from?: string;
  to?: string;
}

/**
 * 询盘列表：表格式排列，关键词搜索 + 时间段筛选 + 分页。
 * 所有筛选条件都通过 URL 参数驱动服务端查询，状态可分享、可刷新、可回退。
 */
export default function InquiryList({
  inquiries,
  total,
  page,
  pageSize,
  keyword,
  fromDate,
  toDate,
}: InquiryListProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const hasFilter = Boolean(keyword || fromDate || toDate);

  function buildHref(targetPage: number, override: FilterOverride = {}) {
    const nextQ = override.q ?? keyword;
    const nextFrom = override.from ?? fromDate;
    const nextTo = override.to ?? toDate;

    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    if (targetPage > 1) params.set("page", String(targetPage));

    const qs = params.toString();
    return `/admin/inquiries${qs ? `?${qs}` : ""}`;
  }

  async function updateStatus(id: string, status: InquiryStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("更新失败");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "更新失败");
    } finally {
      setUpdating(null);
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    /* 任何筛选条件变化都回到第一页 */
    router.push(
      buildHref(1, {
        q: formData.get("q")?.toString().trim() ?? "",
        from: formData.get("from")?.toString() ?? "",
        to: formData.get("to")?.toString() ?? "",
      })
    );
  }

  /**
   * 快捷时段。日期在点击时才用 todayInAdminTz() 现算：
   * 若在渲染期计算，服务端与浏览器可能跨零点算出不同的「今天」，触发 hydration 不一致。
   */
  function applyQuickRange(days: number | null) {
    if (days === null) {
      router.push(buildHref(1, { from: "", to: "" }));
      return;
    }
    const today = todayInAdminTz();
    router.push(buildHref(1, { from: shiftDate(today, -(days - 1)), to: today }));
  }

  return (
    <div>
      {/* ---------- 筛选区 ---------- */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-center gap-x-4 gap-y-3 border hairline bg-white/70 px-4 py-3"
      >
        <label htmlFor="inquiry-search" className="sr-only">
          搜索询盘
        </label>
        <input
          /* key 跟随关键词变化重挂载，保证「清除」后输入框同步清空 */
          key={`q-${keyword}`}
          id="inquiry-search"
          name="q"
          type="search"
          defaultValue={keyword}
          placeholder="搜索姓名、邮箱、电话或询盘内容…"
          className="min-w-[200px] flex-1 border-b border-ink-900/15 bg-transparent px-1 py-1.5 text-sm outline-none transition-colors placeholder:text-ink-400 focus:border-forest-600"
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="inquiry-from"
            className="whitespace-nowrap text-xs text-ink-400"
          >
            提交时间
          </label>
          <input
            key={`from-${fromDate}`}
            id="inquiry-from"
            name="from"
            type="date"
            defaultValue={fromDate}
            aria-label="起始日期"
            className="border-b border-ink-900/15 bg-transparent px-1 py-1 text-xs tabular-nums text-ink-600 outline-none transition-colors focus:border-forest-600"
          />
          <span className="text-xs text-ink-400">—</span>
          <input
            key={`to-${toDate}`}
            name="to"
            type="date"
            defaultValue={toDate}
            aria-label="结束日期"
            className="border-b border-ink-900/15 bg-transparent px-1 py-1 text-xs tabular-nums text-ink-600 outline-none transition-colors focus:border-forest-600"
          />
        </div>

        <button
          type="submit"
          className="border border-forest-700 bg-forest-700 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-forest-800"
        >
          筛选
        </button>
        {hasFilter ? (
          <Link
            href="/admin/inquiries"
            className="text-xs text-ink-400 transition-colors hover:text-ink-900"
          >
            清除
          </Link>
        ) : null}
      </form>

      {/* ---------- 快捷时段 ---------- */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-ink-400">快捷时段：</span>
        {QUICK_RANGES.map((range) => (
          <button
            key={range.label}
            type="button"
            onClick={() => applyQuickRange(range.days)}
            className="border border-ink-900/15 bg-white px-2.5 py-1 text-ink-600 transition-colors hover:border-forest-600 hover:text-forest-700"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* ---------- 结果概览 ---------- */}
      <p className="mt-4 text-xs text-ink-400">
        {total === 0
          ? hasFilter
            ? "当前筛选条件下没有询盘"
            : "暂无询盘"
          : `共 ${total} 条${
              hasFilter
                ? `（${[
                    keyword ? `关键词「${keyword}」` : null,
                    fromDate || toDate
                      ? `提交时间 ${fromDate || "最早"} ~ ${toDate || "至今"}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join("，")}）`
                : ""
            } · 显示第 ${rangeStart}–${rangeEnd} 条 · 按提交时间倒序`}
      </p>

      {/* ---------- 列表 ---------- */}
      {inquiries.length === 0 ? (
        <div className="mt-3 border hairline bg-white/60 px-6 py-16 text-center">
          <p className="text-sm text-ink-400">
            {hasFilter
              ? "放宽或清除筛选条件后再看看。"
              : "访客提交联系表单后会显示在这里。"}
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto border hairline bg-white/70">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b hairline text-left text-[11px] uppercase tracking-[0.14em] text-ink-400">
                <th className="w-[88px] px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">联系人</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">电话</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">询盘内容</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">提交时间</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => {
                const meta = STATUS_META[inq.status];
                const isOpen = expanded === inq.id;

                return (
                  <Fragment key={inq.id}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : inq.id)}
                      className={`cursor-pointer border-b hairline align-top transition-colors last:border-b-0 ${
                        isOpen ? "bg-sand-50" : "hover:bg-sand-50/70"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="block font-medium text-ink-900">{inq.name}</span>
                        <span className="block text-xs text-ink-400">{inq.email}</span>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3.5 text-ink-600 lg:table-cell">
                        {inq.phone || "—"}
                      </td>
                      <td className="hidden max-w-[280px] px-4 py-3.5 text-ink-600 md:table-cell">
                        <span className="line-clamp-2">{inq.message}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 tabular-nums text-ink-600">
                        {formatDateTime(inq.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-ink-400">
                        {isOpen ? "−" : "+"}
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b hairline bg-sand-50 last:border-b-0">
                        <td colSpan={6} className="px-4 pb-6 pt-1">
                          <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                            <p className="text-ink-600">
                              <span className="block text-[11px] uppercase tracking-wider text-ink-400">
                                电话
                              </span>
                              {inq.phone || "—"}
                            </p>
                            <p className="text-ink-600">
                              <span className="block text-[11px] uppercase tracking-wider text-ink-400">
                                来源
                              </span>
                              {inq.source || "contact-form"}
                            </p>
                            <p className="text-ink-600">
                              <span className="block text-[11px] uppercase tracking-wider text-ink-400">
                                提交时间
                              </span>
                              {formatDateTime(inq.created_at)}
                            </p>
                          </div>

                          <p className="mt-4 whitespace-pre-wrap rounded bg-white/80 p-4 text-sm leading-relaxed text-ink-900">
                            {inq.message}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-3">
                            <span className="text-[11px] uppercase tracking-wider text-ink-400">
                              标记为：
                            </span>
                            {(
                              [
                                ["new", "新询盘"],
                                ["read", "已读"],
                                ["replied", "已回复"],
                              ] as const
                            ).map(([status, label]) => (
                              <button
                                key={status}
                                type="button"
                                disabled={updating === inq.id || inq.status === status}
                                onClick={() => updateStatus(inq.id, status)}
                                className={`border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                  inq.status === status
                                    ? "border-forest-700 bg-forest-700 text-white"
                                    : "border-ink-900/15 bg-white text-ink-600 hover:border-forest-600 hover:text-forest-700"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                            <span className="ml-auto">
                              <DeleteButton
                                endpoint={`/api/admin/inquiries/${inq.id}`}
                                confirmText={`确定删除 ${inq.name} 的询盘？`}
                              />
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- 分页 ---------- */}
      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
