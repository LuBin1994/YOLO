-- =============================================================
-- 迁移：把 public 里的业务表搬到 yolo schema（保留数据）
--
-- 【什么时候用本脚本】
--   项目已经跑起来、public 里已经有 products / inquiries / admins 三张表
--   （哪怕只有 inquiries 里有真实询盘），要换成 yolo schema 时用这个。
--   全新项目只要执行 schema.sql，不需要本脚本。
--
-- 【执行前必做】
--   1. Supabase Dashboard → Database → Backups 手动做一次快照（免费版也能下 dump）。
--   2. 确认 public.pages 已经清掉（2026-11-05 起 CMS 下线）：
--        drop table if exists public.pages cascade;
--      它还挂在 public 里的话，最后一步删旧函数会因为策略依赖而失败
--      （脚本检测到会自动跳过，不会中断，但会留一堆 public 残留）。
--
-- 【执行后必做】
--   Project Settings → API → Exposed schemas 加上 `yolo`
--   —— 不做这一步，前端所有查询返回 PGRST106。
--
-- 【为什么用 alter table ... set schema 而不是建新表再 copy】
--   move 是元数据操作：索引、约束、外键、触发器、策略都跟着表走，不重写数据，
--   秒级完成且不会因为类型/默认值写错而丢字段。唯一需要手工重接的是
--   策略和触发器里**写死的函数限定名**（public.is_admin → yolo.is_admin），
--   下面 O 段就是干这个。
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 0 · 前置检查
-- -------------------------------------------------------------
do $$
declare
  t text;
  moved int := 0;
begin
  foreach t in array array['products', 'inquiries', 'admins'] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t)
       and exists (select 1 from pg_tables where schemaname = 'yolo' and tablename = t) then
      raise exception '目标冲突：public.% 与 yolo.% 同时存在，请先人工确认保留哪一份', t, t;
    end if;
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      moved := moved + 1;
    end if;
  end loop;

  if moved = 0 then
    raise exception 'public 里没有找到 products / inquiries / admins，本库看起来是空的：直接执行 schema.sql 即可';
  end if;

  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'pages') then
    raise notice '检测到 public.pages 仍存在 —— 建议先 drop table if exists public.pages cascade; 否则最后一步删旧函数会被跳过';
  end if;
end $$;

-- -------------------------------------------------------------
-- 1 · 建 schema
-- -------------------------------------------------------------
create schema if not exists yolo;
comment on schema yolo is 'YOLO APPAREL 官网业务表（products / inquiries / admins）';

-- -------------------------------------------------------------
-- 2 · 搬表（数据、索引、约束、外键一起走）
-- -------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['products', 'inquiries', 'admins'] loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t)
       and not exists (select 1 from pg_tables where schemaname = 'yolo' and tablename = t) then
      execute format('alter table public.%I set schema yolo', t);
      raise notice '已搬迁 public.% → yolo.%', t, t;
    end if;
  end loop;
end $$;

-- -------------------------------------------------------------
-- 3 · 函数：在 yolo 里重建（旧的在 public 里，稍后删）
-- -------------------------------------------------------------
create or replace function yolo.set_updated_at()
returns trigger
language plpgsql
set search_path = yolo, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function yolo.is_admin()
returns boolean
language sql
security definer
set search_path = yolo, pg_temp
stable
as $$
  select exists (
    select 1 from yolo.admins
    where id = auth.uid()
  );
$$;

-- -------------------------------------------------------------
-- 4 · 触发器：先删再建，把函数指向 yolo.set_updated_at
--     （搬表时触发器跟着走，但函数限定名还停在 public）
-- -------------------------------------------------------------
drop trigger if exists trg_products_updated_at on yolo.products;
create trigger trg_products_updated_at
  before update on yolo.products
  for each row execute function yolo.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on yolo.inquiries;
create trigger trg_inquiries_updated_at
  before update on yolo.inquiries
  for each row execute function yolo.set_updated_at();

-- -------------------------------------------------------------
-- 5 · 策略：全部重建，鉴权函数换成 yolo.is_admin()
--     先 drop 再 create，避免同名策略残留旧表达式
-- -------------------------------------------------------------
alter table yolo.products  enable row level security;
alter table yolo.inquiries enable row level security;
alter table yolo.admins    enable row level security;

drop policy if exists "products_public_read" on yolo.products;
create policy "products_public_read" on yolo.products for select using (published = true);

drop policy if exists "products_admin_insert" on yolo.products;
create policy "products_admin_insert" on yolo.products for insert with check (yolo.is_admin());

drop policy if exists "products_admin_update" on yolo.products;
create policy "products_admin_update" on yolo.products for update using (yolo.is_admin());

drop policy if exists "products_admin_delete" on yolo.products;
create policy "products_admin_delete" on yolo.products for delete using (yolo.is_admin());

drop policy if exists "inquiries_anon_insert" on yolo.inquiries;
create policy "inquiries_anon_insert" on yolo.inquiries for insert with check (true);

drop policy if exists "inquiries_admin_select" on yolo.inquiries;
create policy "inquiries_admin_select" on yolo.inquiries for select using (yolo.is_admin());

drop policy if exists "inquiries_admin_update" on yolo.inquiries;
create policy "inquiries_admin_update" on yolo.inquiries for update using (yolo.is_admin());

drop policy if exists "inquiries_admin_delete" on yolo.inquiries;
create policy "inquiries_admin_delete" on yolo.inquiries for delete using (yolo.is_admin());

drop policy if exists "admins_admin_select" on yolo.admins;
create policy "admins_admin_select" on yolo.admins for select using (yolo.is_admin());

-- -------------------------------------------------------------
-- 6 · 授权：自建 schema 没有 public 那套默认权限，必须显式给
-- -------------------------------------------------------------
grant usage on schema yolo to anon, authenticated, service_role;

grant all privileges on all tables    in schema yolo to anon, authenticated, service_role;
grant all privileges on all sequences in schema yolo to anon, authenticated, service_role;
grant all privileges on all functions in schema yolo to anon, authenticated, service_role;

alter default privileges in schema yolo
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema yolo
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema yolo
  grant all on functions to anon, authenticated, service_role;

-- -------------------------------------------------------------
-- 7 · Storage 策略里的鉴权函数也要换（桶在 storage schema，不动）
--     必须在删 public.is_admin() 之前做，否则会被依赖挡住
-- -------------------------------------------------------------
drop policy if exists "yolo_auth_upload" on storage.objects;
create policy "yolo_auth_upload"
  on storage.objects for insert
  with check (bucket_id = 'yolo' and yolo.is_admin());

drop policy if exists "yolo_auth_update" on storage.objects;
create policy "yolo_auth_update"
  on storage.objects for update
  using (bucket_id = 'yolo' and yolo.is_admin());

drop policy if exists "yolo_auth_delete" on storage.objects;
create policy "yolo_auth_delete"
  on storage.objects for delete
  using (bucket_id = 'yolo' and yolo.is_admin());

-- -------------------------------------------------------------
-- 8 · 清掉 public 里的旧函数
--     默认是 RESTRICT 语义：还有对象依赖它就会报 2BP01 而不是连带删除
--     —— 这是想要的，宁可停下来也别把别人的策略一起删了。
--     用 exception 兜住：真被挡住也只跳过删除，不让整个迁移回滚。
--     最常见的挡路者是 public.pages（CMS 遗留表）上的策略。
-- -------------------------------------------------------------
do $$
begin
  drop function if exists public.is_admin();
  drop function if exists public.set_updated_at();
  raise notice '已删除 public.is_admin / public.set_updated_at';
exception
  when dependent_objects_still_exist then
    raise notice 'public 里的旧函数仍被其它对象依赖（大概率是 public.pages 的策略），已跳过删除；';
    raise notice '它不影响 yolo 里的任何东西，处置办法：drop table if exists public.pages cascade; 之后手动补删。';
end $$;

-- -------------------------------------------------------------
-- 9 · 核对：搬完的行数（与迁移前对比，应完全一致）
-- -------------------------------------------------------------
do $$
declare
  r record;
begin
  raise notice '--- 迁移后行数 ---';
  for r in
    select 'yolo.products'  as t, count(*) as n from yolo.products
    union all select 'yolo.inquiries', count(*) from yolo.inquiries
    union all select 'yolo.admins',    count(*) from yolo.admins
  loop
    raise notice '  % = %', r.t, r.n;
  end loop;
end $$;

-- 让 PostgREST 立刻重新读取（改完 Exposed schemas 也会自动刷）
notify pgrst, 'reload schema';

commit;

-- =============================================================
-- 迁移后自查
-- =============================================================
-- 1. 表在哪：
--      select schemaname, tablename from pg_tables
--      where schemaname in ('public','yolo') order by 1,2;
--    预期 public 下只剩 pages（若还没删），products/inquiries/admins 全在 yolo。
--
-- 2. 策略挂对了没：
--      select tablename, policyname from pg_policies where schemaname='yolo' order by 1,2;
--    预期 8 条（products 4 / inquiries 4）+ admins 1 条。
--
-- 3. REST 通不通（浏览器里换掉两个变量）：
--      curl '<项目URL>/rest/v1/products?select=id&limit=1' \
--           -H 'apikey: <anon key>' -H 'Authorization: Bearer <anon key>' \
--           -H 'Accept-Profile: yolo'
--    200 + [] 或数据 = 通；
--    406 PGRST106 = Exposed schemas 还没加 yolo。

-- =============================================================
-- 回滚（万一线上要退回 public）
--   把下面整段取消注释执行即可，数据不动，只是把表搬回去。
--   ⚠️ 回滚后代码里的 DB_SCHEMA 也要改回 "public"，
--      并且 Database 类型的键、schema.sql 的限定名一起改，否则类型全错。
-- =============================================================
-- begin;
-- alter table yolo.products  set schema public;
-- alter table yolo.inquiries set schema public;
-- alter table yolo.admins    set schema public;
-- create or replace function public.set_updated_at()
--   returns trigger language plpgsql as $$
--   begin new.updated_at = now(); return new; end; $$;
-- create or replace function public.is_admin()
--   returns boolean language sql security definer set search_path = public stable
--   as $$ select exists (select 1 from public.admins where id = auth.uid()); $$;
-- drop trigger if exists trg_products_updated_at on public.products;
-- create trigger trg_products_updated_at before update on public.products
--   for each row execute function public.set_updated_at();
-- drop trigger if exists trg_inquiries_updated_at on public.inquiries;
-- create trigger trg_inquiries_updated_at before update on public.inquiries
--   for each row execute function public.set_updated_at();
-- alter table public.products  enable row level security;
-- alter table public.inquiries enable row level security;
-- alter table public.admins    enable row level security;
-- drop policy if exists "products_public_read" on public.products;
-- create policy "products_public_read" on public.products for select using (published = true);
-- drop policy if exists "products_admin_insert" on public.products;
-- create policy "products_admin_insert" on public.products for insert with check (public.is_admin());
-- drop policy if exists "products_admin_update" on public.products;
-- create policy "products_admin_update" on public.products for update using (public.is_admin());
-- drop policy if exists "products_admin_delete" on public.products;
-- create policy "products_admin_delete" on public.products for delete using (public.is_admin());
-- drop policy if exists "inquiries_anon_insert" on public.inquiries;
-- create policy "inquiries_anon_insert" on public.inquiries for insert with check (true);
-- drop policy if exists "inquiries_admin_select" on public.inquiries;
-- create policy "inquiries_admin_select" on public.inquiries for select using (public.is_admin());
-- drop policy if exists "inquiries_admin_update" on public.inquiries;
-- create policy "inquiries_admin_update" on public.inquiries for update using (public.is_admin());
-- drop policy if exists "inquiries_admin_delete" on public.inquiries;
-- create policy "inquiries_admin_delete" on public.inquiries for delete using (public.is_admin());
-- drop policy if exists "admins_admin_select" on public.admins;
-- create policy "admins_admin_select" on public.admins for select using (public.is_admin());
-- drop policy if exists "yolo_auth_upload" on storage.objects;
-- create policy "yolo_auth_upload" on storage.objects for insert
--   with check (bucket_id = 'yolo' and public.is_admin());
-- drop policy if exists "yolo_auth_update" on storage.objects;
-- create policy "yolo_auth_update" on storage.objects for update
--   using (bucket_id = 'yolo' and public.is_admin());
-- drop policy if exists "yolo_auth_delete" on storage.objects;
-- create policy "yolo_auth_delete" on storage.objects for delete
--   using (bucket_id = 'yolo' and public.is_admin());
-- drop function if exists yolo.is_admin();
-- drop function if exists yolo.set_updated_at();
-- drop schema if exists yolo;
-- notify pgrst, 'reload schema';
-- commit;

