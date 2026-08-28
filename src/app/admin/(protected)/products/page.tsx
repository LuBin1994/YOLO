import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { categoryLabel } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "产品管理 | 管理后台",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
            产品目录
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            产品管理
          </h1>
        </div>
        <Link href="/admin/products/new" className="btn-primary shrink-0">
          + 新建产品
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto border hairline bg-white/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b hairline text-[11px] uppercase tracking-[0.18em] text-ink-400">
              <th className="px-4 py-3 font-medium">产品</th>
              <th className="px-4 py-3 font-medium">分类</th>
              <th className="px-4 py-3 font-medium">价格</th>
              <th className="px-4 py-3 font-medium">起订量</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr
                key={p.id}
                className="border-b hairline last:border-0 hover:bg-sand-100/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden bg-sand-100">
                      {p.cover_image ? (
                        <Image
                          src={p.cover_image}
                          alt={p.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">
                        {p.title}
                      </p>
                      <p className="truncate text-xs text-ink-400">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {categoryLabel(p.category)}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {p.price_range ?? "—"}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {p.moq ? `${p.moq.toLocaleString()} 件` : "—"}
                </td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs text-forest-700 hover:underline"
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
            {(products ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-400">
                  暂无产品。{" "}
                  <Link href="/admin/products/new" className="text-forest-700 hover:underline">
                    立即创建第一个产品 →
                  </Link>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
