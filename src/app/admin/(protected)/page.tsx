import type { Metadata } from "next";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
      <AdminPageHeader
        eyebrow="总览"
        title="数据看板"
        description="内容、询盘与访客数据一目了然。"
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative overflow-hidden border border-ink-900/8 bg-white p-8 transition-colors duration-300 hover:border-ink-900/25"
          >
            {/* hover 时左侧青柠条滑出，给一点反馈而不刺眼 */}
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-volt-400 transition-transform duration-300 ease-out group-hover:scale-y-100"
            />
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
              {c.label}
            </p>
            <p className="mt-4 text-5xl font-medium tracking-tight text-ink-950">
              {c.value}
            </p>
            <p className="mt-4 text-xs text-ink-400 transition-colors duration-300 group-hover:text-ink-950">
              {c.hint} →
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <AnalyticsPanel result={analytics} />
      </div>
    </div>
  );
}
