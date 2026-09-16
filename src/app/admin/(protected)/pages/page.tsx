import type { Metadata } from "next";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "内容管理 | 管理后台",
  robots: { index: false, follow: false },
};

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: true });

  const pageMeta: Record<string, { desc: string; route: string }> = {
    factory: { desc: "工厂介绍与产能", route: "/factory" },
    sustainability: { desc: "环保材料与清洁生产", route: "/sustainability" },
    "social-responsibility": { desc: "员工关怀与社区贡献", route: "/responsibility" },
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="内容"
        title="内容管理"
        description="编辑官网各页面的富文本内容，保存后前台即时生效。"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(pages ?? []).map((p) => {
          const meta = pageMeta[p.slug] ?? { desc: "页面内容", route: `/${p.slug}` };
          return (
            <Link
              key={p.id}
              href={`/admin/pages/${p.id}/edit`}
              className="group relative flex flex-col overflow-hidden border border-ink-900/8 bg-white p-8 transition-colors duration-300 hover:border-ink-900/25"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-volt-400 transition-transform duration-300 ease-out group-hover:scale-y-100"
              />
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
                /{p.slug}
              </p>
              <h2 className="mt-4 text-2xl font-medium tracking-tight text-ink-950">
                {p.title}
              </h2>
              <p className="mt-3 text-sm text-ink-600">{meta.desc}</p>
              <p className="mt-6 text-xs text-ink-400 transition-colors duration-300 group-hover:text-ink-950">
                {p.sections.length} 个内容块 · 编辑 →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
