import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy（Next 16 取代 middleware）：刷新 Supabase 会话。
 * 匹配所有路由（默认 matcher 排除 _next/static 等由 Next.js 自动处理）。
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 除静态资源与 Next 内部路径外的所有请求
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
