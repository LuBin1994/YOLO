import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

/**
 * 后台运行所必需的环境变量。
 *
 * 【为什么要有这段自检】`.env.local` 被 .gitignore 的 `.env*` 排除，不会随代码
 * 部署到 Vercel，所以「本地跑得通、线上缺变量」是常态。若直接让 createClient()
 * 抛异常，生产构建会把它压成没有文案的 "Minified React error #441"，
 * 线上只看到一个 500，现场完全看不出原因。先自检、给一条能照做的提示。
 */
const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

/** 配置缺失提示页（服务端组件，无交互） */
function MissingEnvNotice({ missing }: { missing: readonly string[] }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-2xl">
        <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-400">
          <span aria-hidden className="h-[3px] w-6 bg-volt-400" />
          管理后台
        </p>

        <h1 className="mt-6 text-3xl font-medium tracking-tight text-ink-950 md:text-4xl">
          缺少环境变量，后台无法启动
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          当前运行环境没有读到下列变量：
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {missing.map((key) => (
            <li key={key}>
              <code className="block rounded bg-sand-100 px-2 py-1 text-xs text-ink-950">
                {key}
              </code>
            </li>
          ))}
        </ul>

        <div className="mt-8 border border-ink-900/8 bg-white p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            怎么修
          </p>
          <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink-600">
            <li>
              1.{" "}
              <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
              已被 <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">.gitignore</code>{" "}
              排除，不会随代码部署到 Vercel，必须在平台上单独配置。
            </li>
            <li>
              2. Vercel → 项目 → Settings → Environment Variables 逐条添加，
              Environment 勾选 Production（Preview 建议一并勾上）。
            </li>
            <li>
              3. 改完环境变量
              <strong className="font-medium text-ink-950">必须重新部署</strong>
              ，已有部署不会热更新。
            </li>
            <li>
              4. 值取自 Supabase Dashboard → Project Settings → API 的 Project URL
              与 anon public key。
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/**
 * 后台守卫布局：所有 /admin 下页面（除 login）必须通过
 * 1) Supabase Auth session 校验
 * 2) admins 表授权校验
 * 未通过一律重定向到 /admin/login。
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 先自检配置再进入守卫逻辑：顺序重要，环境缺失时给出可读提示而非 #441
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) return <MissingEnvNotice missing={missing} />;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // 二次校验：必须是 admins 表中授权的账号
  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) {
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-sand-50">
      <AdminSidebar
        admin={{
          email: admin.email,
          displayName: admin.display_name ?? admin.email,
          role: admin.role,
        }}
      />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        {/* 放宽内容区（原 max-w-6xl 偏窄，表格与卡片显得局促），并加大纵向留白 */}
        <div className="mx-auto w-full max-w-[1400px] px-6 py-12 md:px-12 md:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
