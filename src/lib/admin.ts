import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import type { Database } from "./supabase/types";

export interface AdminContext {
  supabase: SupabaseClient<Database>;
  userId: string;
  email: string;
  role: string;
}

/**
 * 管理端守卫（供 Server Components 与 API Route 共用）：
 * 校验 session + admins 表授权，失败返回 null。
 */
export async function requireAdmin(): Promise<AdminContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) return null;

  return {
    supabase,
    userId: user.id,
    email: admin.email,
    role: admin.role,
  };
}
