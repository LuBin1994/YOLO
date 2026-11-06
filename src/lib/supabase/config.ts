/**
 * 业务表所在的 Postgres schema。
 *
 * 2026-11-06 起从 `public` 搬到 `yolo` —— public 是所有 Supabase 项目共用的
 * 默认 schema，任何拿到 anon key 的人都能通过 PostgREST 探到它；
 * 换成自建 schema 之后，暴露面变成白名单制（只在 Exposed schemas 里列出的才可见）。
 *
 * 【改这个值要同步四处，漏一处就是 404 / PGRST106】
 *   1. 本文件
 *   2. `src/lib/supabase/types.ts` 里 `Database` 的键（类型层面，必须字面量一致）
 *   3. `supabase/schema.sql` / `migrate-to-yolo.sql` 里的建表与策略限定名
 *   4. Supabase Dashboard → Project Settings → API → Exposed schemas
 *
 * 用 `as const` 是为了让类型保持字面量 "yolo" —— supabase-js 的
 * `db.schema` 是 `SchemaName` 泛型（= keyof Database），给 string 会报类型错。
 */
export const DB_SCHEMA = "yolo" as const;
