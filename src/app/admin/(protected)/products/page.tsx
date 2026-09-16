import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Pagination from "@/components/admin/Pagination";
import ProductFilters from "@/components/admin/ProductFilters";
import { CATEGORY_LABELS, categoryLabel } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "产品管理 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** 每页条数。产品行带缩略图、行高比询盘大，所以比询盘页的 20 少一些 */
const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    featured?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const {
    q = "",
    category = "",
    status = "",
    featured = "",
    page = "1",
  } = await searchParams;

  const keyword = q.trim();

  /* 白名单校验：URL 是用户可改的，脏值一律当没传，别直接拼进查询 */
  const categoryFilter =
    category && Object.hasOwn(CATEGORY_LABELS, category) ? category : "";
  const statusFilter =
    status === "published" || status === "draft" ? status : "";
  const featuredFilter = featured === "only" || featured === "no" ? featured : "";

  const parsedPage = Number.parseInt(page, 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const fromRow = (requestedPage - 1) * PAGE_SIZE;
  const toRow = fromRow + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true });

  if (keyword) {
    /* PostgREST 的 or 语法里逗号、括号、反斜杠是分隔符，先清掉再拼 */
    const safe = keyword.replace(/[,()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (safe) {
      const like = `%${safe}%`;
      query = query.or(
        `title.ilike.${like},slug.ilike.${like},description.ilike.${like}`
      );
    }
  }
  if (categoryFilter) query = query.eq("category", categoryFilter);
  if (statusFilter) query = query.eq("published", statusFilter === "published");
  if (featuredFilter) query = query.eq("featured", featuredFilter === "only");

  const { data: products, count } = await query.range(fromRow, toRow);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  /* 筛选后总数变少时，页码可能已越界，收敛到最后一页 */
  const currentPage = Math.min(requestedPage, totalPages);
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);
  const hasFilter = Boolean(keyword || categoryFilter || statusFilter || featuredFilter);

  const rows = products ?? [];

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (categoryFilter) params.set("category", categoryFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (featuredFilter) params.set("featured", featuredFilter);
    if (targetPage > 1) params.set("page", String(targetPage));

    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="产品目录"
        title="产品管理"
        description="维护产品的分类、价格、起订量与发布状态，改动即时同步到前台。"
        actions={
          <Link href="/admin/products/new" className="btn-primary shrink-0">
            + 新建产品
          </Link>
        }
      />

      <div className="mt-8">
        <ProductFilters
          keyword={keyword}
          category={categoryFilter}
          status={statusFilter}
          featured={featuredFilter}
        />
      </div>

      <p className="mt-4 text-xs text-ink-400">
        {total === 0
          ? hasFilter
            ? "当前筛选条件下没有产品"
            : "暂无产品"
          : `共 ${total} 条${
              hasFilter
                ? `（${[
                    keyword ? `关键词「${keyword}」` : null,
                    categoryFilter ? `分类 ${categoryLabel(categoryFilter)}` : null,
                    statusFilter
                      ? `状态 ${statusFilter === "published" ? "已发布" : "草稿"}`
                      : null,
                    featuredFilter
                      ? featuredFilter === "only"
                        ? "仅精选"
                        : "非精选"
                      : null,
                  ]
                    .filter(Boolean)
                    .join("，")}）`
                : ""
            } · 显示第 ${rangeStart}–${rangeEnd} 条`}
      </p>

      <div className="mt-6 overflow-x-auto border border-ink-900/8 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-900/8 bg-sand-50 text-[11px] uppercase tracking-[0.18em] text-ink-400">
              <th className="px-5 py-4 font-medium">产品</th>
              <th className="px-5 py-4 font-medium">分类</th>
              <th className="px-5 py-4 font-medium">价格</th>
              <th className="px-5 py-4 font-medium">起订量</th>
              <th className="px-5 py-4 font-medium">状态</th>
              <th className="px-5 py-4 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-b border-ink-900/8 transition-colors duration-200 last:border-0 hover:bg-sand-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden bg-sand-100">
                      {p.cover_image ? (
                        <Image
                          src={p.cover_image}
                          alt={p.title}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-950">
                        {p.title}
                      </p>
                      <p className="truncate text-xs text-ink-400">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-ink-600">
                  {categoryLabel(p.category)}
                </td>
                <td className="px-5 py-4 text-ink-600">
                  {p.price_range ?? "—"}
                </td>
                <td className="px-5 py-4 text-ink-600">
                  {p.moq ? `${p.moq.toLocaleString()} 件` : "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        p.published ? "bg-moss-500" : "bg-ink-400"
                      }`}
                    />
                    <span className="text-xs text-ink-600">
                      {p.published ? "已发布" : "草稿"}
                      {p.featured ? " · 精选" : ""}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-5">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-ink-950 underline decoration-transparent decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-volt-500"
                    >
                      编辑
                    </Link>
                    <DeleteButton
                      endpoint={`/api/admin/products/${p.id}`}
                      confirmText={`确定删除「${p.title}」？该操作不可撤销。`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-20 text-center text-sm text-ink-400">
                  {hasFilter ? (
                    "放宽或清除筛选条件后再看看。"
                  ) : (
                    <>
                      暂无产品。{" "}
                      <Link
                        href="/admin/products/new"
                        className="text-ink-950 underline decoration-transparent decoration-2 underline-offset-4 transition-colors duration-200 hover:decoration-volt-500"
                      >
                        立即创建第一个产品 →
                      </Link>
                    </>
                  )}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
