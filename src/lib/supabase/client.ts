"use client";

import { createBrowserClient } from "@supabase/ssr";
import { DB_SCHEMA } from "./config";
import type { Database } from "./types";

/**
 * 浏览器端 Supabase 客户端
 * 用于：前台/后台所有客户端组件的数据读取与写入。
 * 依赖环境变量：NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 业务表在 yolo schema（不是 public），所以必须显式指定 db.schema。
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "缺少 Supabase 环境变量：请配置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY（.env.local）"
    );
  }

  return createBrowserClient<Database>(url, key, {
    db: { schema: DB_SCHEMA },
  });
}
