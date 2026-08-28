import type { Metadata } from "next";
import Link from "next/link";
import AnalyticsPanel from "@/components/admin/AnalyticsPanel";
import { getAnalytics } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "数据看板 | 管理后台",
  robots: { index: false, follow: false },
};

async function getStats() {
  const supabase = await createClient();

  const [products, inquiries, pages] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase.from("pages").select("id", { count: "exact", head: true }),
  ]);

  return {
    products: products.count ?? 0,
    inquiries: inquiries.count ?? 0,
    pages: pages.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const [stats, analytics] = await Promise.all([getStats(), getAnalytics()]);

  const cards = [
    {
      href: "/admin/products",
      label: "产品",
      value: stats.products,
      hint: "管理产品目录",
    },
    {
      href: "/admin/inquiries",
      label: "询盘",
      value: stats.inquiries,
      hint: "待处理询盘",
    },
    {
      href: "/admin/pages",
      label: "页面",
      value: stats.pages,
      hint: "站点内容",
    },
  ];

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
        总览
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">数据看板</h1>
      <p className="mt-2 text-sm text-ink-600">
        内容、询盘与访客数据一目了然。
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group border hairline bg-white/60 p-6 transition-colors hover:border-forest-600/40 hover:bg-white"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">
              {c.label}
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">
              {c.value}
            </p>
            <p className="mt-2 text-xs text-ink-400 group-hover:text-forest-700">
              {c.hint} →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <AnalyticsPanel data={analytics} />
      </div>
    </div>
  );
}
