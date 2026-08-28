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

const NAV = [
  { href: "/admin", label: "数据看板", icon: "▦" },
  { href: "/admin/products", label: "产品管理", icon: "◇" },
  { href: "/admin/pages", label: "内容管理", icon: "□" },
  { href: "/admin/inquiries", label: "询盘管理", icon: "✉" },
];

/**
 * 后台侧边栏：导航 + 账号信息 + 退出登录。
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
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col bg-forest-950 text-sand-100 md:w-60">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4 md:px-6">
        <span className="text-lg font-semibold tracking-tight text-sand-50">
          M<span className="text-moss-400">.</span>
        </span>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-sand-50">Meridian</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-sand-200/60">
            管理后台
          </p>
        </div>
      </div>

      {/* 导航 */}
      <nav className="flex-1 space-y-1 px-2 py-6 md:px-4" aria-label="Admin">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors ${
              isActive(item.href)
                ? "bg-white/10 font-medium text-sand-50"
                : "text-sand-200/70 hover:bg-white/5 hover:text-sand-50"
            }`}
          >
            <span className="w-4 text-center text-xs">{item.icon}</span>
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* 账号 + 退出 */}
      <div className="border-t border-white/10 p-3 md:p-4">
        <div className="hidden truncate md:block">
          <p className="truncate text-sm font-medium text-sand-50">
            {admin.displayName}
          </p>
          <p className="truncate text-[11px] text-sand-200/60">{admin.email}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 w-full rounded border border-white/15 px-3 py-2 text-xs tracking-wide text-sand-200/80 transition-colors hover:border-white/40 hover:text-sand-50"
        >
          <span className="hidden md:inline">退出登录</span>
          <span className="md:hidden">⏻</span>
        </button>
      </div>
    </aside>
  );
}
