import type { Metadata } from "next";
import Link from "next/link";
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
      <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
        内容
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">内容管理</h1>
      <p className="mt-2 text-sm text-ink-600">
        编辑官网各页面的富文本内容。
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(pages ?? []).map((p) => {
          const meta = pageMeta[p.slug] ?? { desc: "页面内容", route: `/${p.slug}` };
          return (
            <Link
              key={p.id}
              href={`/admin/pages/${p.id}/edit`}
              className="group border hairline bg-white/60 p-6 transition-colors hover:border-forest-600/40 hover:bg-white"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-forest-600">
                /{p.slug}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink-900">
                {p.title}
              </h2>
              <p className="mt-2 text-sm text-ink-600">{meta.desc}</p>
              <p className="mt-4 text-xs text-ink-400 group-hover:text-forest-700">
                {p.sections.length} 个内容块 · 编辑 →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
