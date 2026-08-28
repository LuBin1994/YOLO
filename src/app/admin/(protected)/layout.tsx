import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

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
        <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
