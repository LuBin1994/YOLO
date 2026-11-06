import type { Metadata } from "next";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { buildCategoryTree, flattenCategoryTree, type Category } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "分类管理 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * 分类管理（树状多级）。
 *
 * 【为什么用一张平表 + 缩进，而不是嵌套的可折叠树】
 * 客户维护的是十几个到几十个分类，缩进一览比"点开折叠"更快看到全貌，
 * 也不会出现"展开状态在刷新后丢失"这类问题。层级用左侧 20px × 深度的缩进
 * 和 └ 前缀表达，键盘与读屏都能正常遍历。
 */
export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const [categoryResult, productResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, parent_id, slug, name_zh, name_en, sort_order")
      .order("sort_order", { ascending: true }),
    supabase.from("products").select("category"),
  ]);

  /* 表还没建时不要把整个后台炸掉：给一句能照做的提示 */
  if (categoryResult.error) {
    return (
      <div className="max-w-3xl">
        <AdminPageHeader
          eyebrow="产品目录"
          title="分类管理"
          description="分类表还没建好。"
        />
        <div className="mt-10 border border-amber-300 bg-amber-50 px-6 py-5 text-[15px] leading-relaxed text-amber-900">
          <p className="font-medium">读取 yolo.categories 失败</p>
          <p className="mt-2 text-amber-800">
            {categoryResult.error.message}
          </p>
          <p className="mt-3 text-amber-800">
            请先在 Supabase → SQL Editor 里执行
            <code className="mx-1 bg-white/70 px-1.5 py-0.5">supabase/categories.sql</code>
            ，然后在 Project Settings → API → Exposed schemas 里确认已包含 <code className="mx-1 bg-white/70 px-1.5 py-0.5">yolo</code>。
          </p>
        </div>
      </div>
    );
  }

  const rows = (categoryResult.data ?? []) as Category[];
  const tree = flattenCategoryTree(buildCategoryTree(rows));

  /* 产品数按分类 slug 汇总一次，避免每个分类发一次 count */
  const counts = new Map<string, number>();
  for (const row of productResult.data ?? []) {
    const key = (row as { category: string }).category;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        eyebrow="产品目录"
        title="分类管理"
        description={`${rows.length} 个分类，层级不限。中文名给后台看，英文名给前台看。`}
      />

      <div className="mt-8">
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 rounded-md border border-ink-950 bg-ink-950 px-5 py-2.5 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-accent-500"
        >
          新建分类
        </Link>
      </div>

      <div className="mt-6 border border-ink-900/8 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-900/8 text-[11px] uppercase tracking-[0.2em] text-ink-400">
              <th scope="col" className="px-6 py-3 font-normal">分类</th>
              <th scope="col" className="px-4 py-3 font-normal">别名</th>
              <th scope="col" className="px-4 py-3 text-right font-normal">排序</th>
              <th scope="col" className="px-4 py-3 text-right font-normal">产品</th>
              <th scope="col" className="px-6 py-3 text-right font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {tree.map((node) => (
              <tr
                key={node.id}
                className="border-b border-ink-900/6 last:border-0 hover:bg-sand-50/60"
              >
                <td className="px-6 py-3">
                  <div
                    className="flex items-baseline gap-2"
                    style={{ paddingLeft: node.depth * 20 }}
                  >
                    {node.depth > 0 ? (
                      <span aria-hidden className="text-ink-400">└</span>
                    ) : null}
                    <span className="text-[15px] text-ink-950">{node.name_zh}</span>
                    <span className="text-[13px] text-ink-400">{node.name_en}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-400">
                  {node.slug}
                </td>
                <td className="px-4 py-3 text-right text-[13px] tabular-nums text-ink-500">
                  {node.sort_order}
                </td>
                <td className="px-4 py-3 text-right text-[13px] tabular-nums text-ink-500">
                  {counts.get(node.slug) ?? 0}
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/categories/${node.id}/edit`}
                      className="text-[13px] text-ink-600 transition-colors hover:text-ink-950"
                    >
                      编辑
                    </Link>
                    <DeleteButton
                      endpoint={`/api/admin/categories/${node.id}`}
                      confirmText={`确定删除「${node.name_zh}」？有子分类或挂着产品时会被拒绝。`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {tree.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-[15px] text-ink-400">
                  还没有分类。先执行 categories.sql 或在上面新建一个。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
