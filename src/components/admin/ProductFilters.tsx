"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS } from "@/lib/utils";

export interface ProductFilterValues {
  keyword: string;
  category: string;
  /** "" | "published" | "draft" */
  status: string;
  /** "" | "only" | "no" */
  featured: string;
}

const SELECT_CLASS =
  "rounded-md border border-ink-900/15 bg-white px-3 py-2.5 text-xs text-ink-600 outline-none transition-colors focus:border-ink-950";

/**
 * 产品筛选栏：关键词 + 分类 + 发布状态 + 精选，全部通过 URL 参数驱动服务端查询。
 * 任一条件变化都回到第一页（筛选后页码可能已越界）。
 */
export default function ProductFilters({
  keyword,
  category,
  status,
  featured,
}: ProductFilterValues) {
  const router = useRouter();
  const hasFilter = Boolean(keyword || category || status || featured);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const params = new URLSearchParams();
    const q = formData.get("q")?.toString().trim() ?? "";
    const c = formData.get("category")?.toString() ?? "";
    const s = formData.get("status")?.toString() ?? "";
    const f = formData.get("featured")?.toString() ?? "";

    if (q) params.set("q", q);
    if (c) params.set("category", c);
    if (s) params.set("status", s);
    if (f) params.set("featured", f);

    const qs = params.toString();
    router.push(`/admin/products${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-x-4 gap-y-3 border border-ink-900/8 bg-white px-6 py-5"
    >
      <label htmlFor="product-search" className="sr-only">
        搜索产品
      </label>
      <input
        /* key 跟随取值变化重挂载，保证「清除」后各控件同步复位 */
        key={`q-${keyword}`}
        id="product-search"
        name="q"
        type="search"
        defaultValue={keyword}
        placeholder="搜索产品名称、slug 或描述…"
        className="min-w-[220px] flex-1 rounded-md border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-400 focus:border-ink-950"
      />

      <select
        key={`category-${category}`}
        name="category"
        defaultValue={category}
        aria-label="按分类筛选"
        className={SELECT_CLASS}
      >
        <option value="">全部分类</option>
        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        key={`status-${status}`}
        name="status"
        defaultValue={status}
        aria-label="按发布状态筛选"
        className={SELECT_CLASS}
      >
        <option value="">全部状态</option>
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
      </select>

      <select
        key={`featured-${featured}`}
        name="featured"
        defaultValue={featured}
        aria-label="按精选筛选"
        className={SELECT_CLASS}
      >
        <option value="">精选与普通</option>
        <option value="only">仅精选</option>
        <option value="no">非精选</option>
      </select>

      <button
        type="submit"
        className="rounded-md border border-ink-950 bg-ink-950 px-5 py-2.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-volt-400 hover:text-ink-950"
      >
        筛选
      </button>
      {hasFilter ? (
        <Link
          href="/admin/products"
          className="text-xs text-ink-400 transition-colors duration-200 hover:text-ink-950"
        >
          清除
        </Link>
      ) : null}
    </form>
  );
}
