"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminSidebarProps {
  admin: {
    email: string;
    displayName: string;
    role: string;
  };
}

/** 分组导航：概览与日常运营分开，给侧栏一点结构感 */
const NAV_GROUPS = [
  {
    label: "概览",
    items: [{ href: "/admin", label: "数据看板", icon: "▦" }],
  },
  {
    label: "运营",
    items: [
      { href: "/admin/products", label: "产品管理", icon: "◇" },
      { href: "/admin/pages", label: "内容管理", icon: "□" },
      { href: "/admin/inquiries", label: "询盘管理", icon: "✉" },
    ],
  },
];

/**
 * 后台侧边栏：导航 + 账号信息 + 退出登录。
 * 底色与前台一致改近黑，激活态用青柠竖条标示。
 */
export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col bg-ink-950 text-white md:w-64">
      {/* 品牌 */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-4 md:px-6">
        <span className="text-xl font-medium tracking-tight text-white">
          Y<span className="text-volt-400">.</span>
        </span>
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-medium text-white">
            YOLO APPAREL
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            管理后台
          </p>
        </div>
      </div>

      {/* 导航 */}
      <nav className="flex-1 overflow-y-auto px-2 py-6 md:px-3" aria-label="Admin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-7 last:mb-0">
            <p className="mb-2 hidden px-3 text-[10px] uppercase tracking-[0.24em] text-white/25 md:block">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors duration-200 ${
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {/* 激活青柠竖条 */}
                    <span
                      aria-hidden
                      className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-volt-400 transition-opacity duration-200 ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="w-5 shrink-0 text-center text-sm" aria-hidden>
                      {item.icon}
                    </span>
                    <span className="hidden truncate md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 账号 + 退出 */}
      <div className="border-t border-white/10 p-3 md:p-4">
        <Link
          href="/"
          className="mb-3 hidden items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/50 transition-colors duration-200 hover:bg-white/5 hover:text-white md:flex"
        >
          <span aria-hidden>↗</span>
          查看官网
        </Link>
        <div className="hidden truncate md:block">
          <p className="truncate text-sm font-medium text-white">
            {admin.displayName}
          </p>
          <p className="truncate text-[11px] text-white/40">{admin.email}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2.5 text-xs tracking-wide text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
        >
          <span className="hidden md:inline">退出登录</span>
          <span className="md:hidden">⏻</span>
        </button>
      </div>
    </aside>
  );
}
