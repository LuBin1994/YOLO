import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DB_SCHEMA } from "./config";
import type { Database } from "./types";

/**
 * 会话刷新中间件：每个请求刷新 Supabase Auth 会话 cookie。
 * 路径守卫（/admin 登录拦截）在服务端布局/页面层实现，
 * 中间件只负责令牌续期，避免每个页面重复刷新。
 *
 * 这里不查业务表，`db.schema` 对 auth 接口没有影响；
 * 仍然写上是为了三处客户端配置一致，避免以后有人在中间件里加查询时踩 PGRST106。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    db: { schema: DB_SCHEMA },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 触发会话刷新（重要：不要移除）
  await supabase.auth.getUser();

  return supabaseResponse;
}
