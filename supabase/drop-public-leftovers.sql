-- =============================================================
-- 清理 public 里的残留（迁移到 yolo 之后执行一次）
--
-- 【为什么还要这一步】
-- migrate-to-yolo.sql 只搬 products / inquiries / admins 三张表。
-- public.pages（2026-11-05 下线的 CMS 表）还留在 public 里，它的策略
-- 引用着旧的 public.is_admin()，导致迁移脚本最后"删旧函数"那步被依赖挡住、
-- 静默跳过。结果就是 public 里留着一个**已经坏掉的 is_admin()**：
--   select public.is_admin() → ERROR 42P01 relation "public.admins" does not exist
-- 前台完全不受影响（没人再调它），但它是个陷阱：以后谁在 public 里建策略
-- 顺手用上它，就会得到一个"看着像在鉴权、其实每次都报错"的策略。
--
-- 【执行位置】Supabase Dashboard → SQL Editor
-- =============================================================

-- 1 · CMS 遗留表（静态化之后代码里已无任何引用）
drop table if exists public.pages cascade;

-- 2 · 失效的旧函数（现在没有依赖了，可以直接删）
drop function if exists public.is_admin();
drop function if exists public.set_updated_at();

-- 3 · 让 PostgREST 刷新 schema 缓存
notify pgrst, 'reload schema';

-- =============================================================
-- 自查：应返回 0 行
--   select routine_schema, routine_name from information_schema.routines
--   where routine_schema = 'public' and routine_name in ('is_admin', 'set_updated_at');
-- =============================================================
