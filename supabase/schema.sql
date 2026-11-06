-- =============================================================
-- YOLO APPAREL 官网 · Supabase 数据库 Schema
--
-- 【2026-11-06 起：所有业务表放在 yolo schema，不再放 public】
-- 在 Supabase Dashboard → SQL Editor 中执行本脚本；幂等，可重复执行。
--
-- ⚠️ 执行完本脚本，还必须去 **Project Settings → API → Exposed schemas**
--    把 `yolo` 加进去（默认只有 public / graphql_public）。
--    这一步不在 SQL 里，改的是 PostgREST 的配置；漏了的话所有查询都会返回
--    PGRST106: The schema must be one of the following: public, graphql_public。
--
-- ⚠️ 全新项目执行本脚本即可；**已有数据的项目请执行 migrate-to-yolo.sql**
--    （那是把 public 里的表原地搬到 yolo，不丢数据；本脚本只管建新的）。
-- =============================================================

-- ---------- 扩展（留在 public，PG13+ 的 gen_random_uuid 也内置在 pg_catalog） ----------
create extension if not exists "pgcrypto";

-- =============================================================
-- Schema
-- =============================================================
create schema if not exists yolo;

comment on schema yolo is 'YOLO APPAREL 官网业务表（products / inquiries / admins）';

-- =============================================================
-- 授权：public schema 的默认权限不覆盖自建 schema，必须显式给
--   只给 usage + 表权限，真正的行级边界仍由 RLS 决定
-- =============================================================
grant usage on schema yolo to anon, authenticated, service_role;

-- 将来新建的对象（必须写在本脚本建表之前才生效）
alter default privileges in schema yolo
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema yolo
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema yolo
  grant all on functions to anon, authenticated, service_role;

-- =============================================================
-- 表：products（产品数据）
-- =============================================================
create table if not exists yolo.products (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text,
  category    text not null,                             -- 指向 yolo.categories.slug（外键在文件末尾加）
  images      text[] not null default '{}',              -- Supabase Storage 公开 URL 数组
  cover_image text,                                      -- 列表封面
  mood_image  text,                                      -- 首页滚动图组专用氛围图（不进详情图集）
  materials   text[] not null default '{}',              -- 面料成分
  moq         integer,                                   -- 最小起订量
  price_range text,                                      -- 价格区间展示文本，如 "$4.5 - $7.2 / pc"
  featured    boolean not null default false,            -- 首页精选
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_products_published on yolo.products (published, sort_order desc);

create index if not exists idx_products_category on yolo.products (category);

-- 已有库执行本脚本时 create table 是空操作，用这句把新列补上
alter table yolo.products add column if not exists mood_image text;

create index if not exists idx_products_has_mood
  on yolo.products (sort_order)
  where mood_image is not null;

-- =============================================================
-- 表：inquiries（询盘数据）
-- =============================================================
create table if not exists yolo.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  message    text not null,
  status     text not null default 'new'
             check (status in ('new', 'read', 'replied')),
  source     text not null default 'contact-form',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inquiries_status on yolo.inquiries (status, created_at desc);
create index if not exists idx_inquiries_created on yolo.inquiries (created_at desc);

-- =============================================================
-- 表：admins（后台管理员，关联 Supabase Auth 用户）
-- =============================================================
create table if not exists yolo.admins (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null unique,
  display_name text,
  role         text not null default 'admin' check (role in ('admin', 'editor')),
  created_at   timestamptz not null default now()
);

-- =============================================================
-- 表：categories（产品分类，树状多级）
--   parent_id 自引用 → 任意层级；products.category 存本表的 slug。
--   后台显示 name_zh，前台显示 name_en，不在运行时做翻译。
-- =============================================================
create table if not exists yolo.categories (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references yolo.categories (id) on delete restrict,
  slug        text not null unique,
  name_zh     text not null,
  name_en     text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_not_self_parent check (parent_id is null or parent_id <> id)
);

create index if not exists idx_categories_parent on yolo.categories (parent_id, sort_order);
create index if not exists idx_categories_sort on yolo.categories (sort_order, name_en);

-- =============================================================
-- 通用：updated_at 自动更新触发器
-- =============================================================
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

drop trigger if exists trg_products_updated_at on yolo.products;
create trigger trg_products_updated_at
  before update on yolo.products
  for each row execute function yolo.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on yolo.inquiries;
create trigger trg_inquiries_updated_at
  before update on yolo.inquiries
  for each row execute function yolo.set_updated_at();

drop trigger if exists trg_categories_updated_at on yolo.categories;
create trigger trg_categories_updated_at
  before update on yolo.categories
  for each row execute function yolo.set_updated_at();

-- =============================================================
-- RLS 辅助函数：当前用户是否为管理员
--   security definer：绕过 admins 表自身的 RLS，避免递归
--   search_path 必须指向 yolo：函数里引用的就是 yolo.admins
-- =============================================================
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

-- =============================================================
-- 启用 Row Level Security
-- =============================================================
alter table yolo.products  enable row level security;
alter table yolo.inquiries enable row level security;
alter table yolo.admins    enable row level security;
alter table yolo.categories enable row level security;

-- ---------- categories：公开可读，仅管理员可写 ----------
drop policy if exists "categories_public_read" on yolo.categories;
create policy "categories_public_read"
  on yolo.categories for select
  using (true);

drop policy if exists "categories_admin_insert" on yolo.categories;
create policy "categories_admin_insert"
  on yolo.categories for insert
  with check (yolo.is_admin());

drop policy if exists "categories_admin_update" on yolo.categories;
create policy "categories_admin_update"
  on yolo.categories for update
  using (yolo.is_admin());

drop policy if exists "categories_admin_delete" on yolo.categories;
create policy "categories_admin_delete"
  on yolo.categories for delete
  using (yolo.is_admin());

-- ---------- products：公开可读，仅管理员可写 ----------
drop policy if exists "products_public_read" on yolo.products;
create policy "products_public_read"
  on yolo.products for select
  using (published = true);

drop policy if exists "products_admin_insert" on yolo.products;
create policy "products_admin_insert"
  on yolo.products for insert
  with check (yolo.is_admin());

drop policy if exists "products_admin_update" on yolo.products;
create policy "products_admin_update"
  on yolo.products for update
  using (yolo.is_admin());

drop policy if exists "products_admin_delete" on yolo.products;
create policy "products_admin_delete"
  on yolo.products for delete
  using (yolo.is_admin());

-- ---------- inquiries：允许匿名提交，仅管理员可读/改状态 ----------
drop policy if exists "inquiries_anon_insert" on yolo.inquiries;
create policy "inquiries_anon_insert"
  on yolo.inquiries for insert
  with check (true);

drop policy if exists "inquiries_admin_select" on yolo.inquiries;
create policy "inquiries_admin_select"
  on yolo.inquiries for select
  using (yolo.is_admin());

drop policy if exists "inquiries_admin_update" on yolo.inquiries;
create policy "inquiries_admin_update"
  on yolo.inquiries for update
  using (yolo.is_admin());

drop policy if exists "inquiries_admin_delete" on yolo.inquiries;
create policy "inquiries_admin_delete"
  on yolo.inquiries for delete
  using (yolo.is_admin());

-- ---------- admins：仅管理员可读 ----------
drop policy if exists "admins_admin_select" on yolo.admins;
create policy "admins_admin_select"
  on yolo.admins for select
  using (yolo.is_admin());

-- =============================================================
-- Storage 存储桶：yolo（公开读；2026-11-06 从 media 改名）
-- 目录约定：yolo/products/<slug>/
--   桶和对象属于 storage schema，与业务表放在哪个 schema 无关；
--   这里只是策略里的鉴权函数要跟着改成 yolo.is_admin()。
-- =============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'yolo', 'yolo', true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "yolo_public_read" on storage.objects;
create policy "yolo_public_read"
  on storage.objects for select
  using (bucket_id = 'yolo');

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

-- =============================================================
-- 基准分类（客户目录顺序，不要按字母重排）
--   这是**结构性参考数据**，不是演示数据，所以放在建表脚本里。
--   已有的库改分类请直接用后台 /admin/categories，或跑 supabase/categories.sql。
-- =============================================================
insert into yolo.categories (slug, name_zh, name_en, sort_order) values
  ('kids',            '童装',   'Kids',      10),
  ('kids-jacket',     '夹克',   'Jackets',   10),
  ('kids-padded',     '棉服',   'Padded',    20),
  ('kids-shearling',  '羊羔毛', 'Shearling', 30),
  ('mens',            '男装',   'Mens',      20),
  ('mens-coat',       '大衣',   'Coats',     10),
  ('mens-jacket',     '夹克',   'Jackets',   20),
  ('mens-padded',     '棉服',   'Padded',    30),
  ('womens',          '女装',   'Womens',    30),
  ('womens-jacket',   '夹克',   'Jackets',   10),
  ('womens-padded',   '棉服',   'Padded',    20),
  ('womens-shearling','羊羔毛', 'Shearling', 30),
  ('womens-trench',   '风衣',   'Trench',    40)
on conflict (slug) do update
  set name_zh = excluded.name_zh,
      name_en = excluded.name_en,
      sort_order = excluded.sort_order;

update yolo.categories c
   set parent_id = p.id
  from (values
          ('kids-jacket', 'kids'), ('kids-padded', 'kids'), ('kids-shearling', 'kids'),
          ('mens-coat', 'mens'), ('mens-jacket', 'mens'), ('mens-padded', 'mens'),
          ('womens-jacket', 'womens'), ('womens-padded', 'womens'),
          ('womens-shearling', 'womens'), ('womens-trench', 'womens')
       ) as m (child, parent)
  join yolo.categories p on p.slug = m.parent
 where c.slug = m.child
   and c.parent_id is distinct from p.id;

update yolo.categories
   set parent_id = null
 where slug in ('kids', 'mens', 'womens') and parent_id is not null;

-- products.category → categories.slug
--   有脏数据时跳过加约束，不让整个脚本失败（见 categories.sql 里的详细提示）
do $$
declare orphans int;
begin
  select count(*) into orphans
    from yolo.products p
   where not exists (select 1 from yolo.categories c where c.slug = p.category);
  if orphans = 0 then
    alter table yolo.products drop constraint if exists products_category_fkey;
    alter table yolo.products
      add constraint products_category_fkey
      foreign key (category) references yolo.categories (slug)
      on update cascade on delete restrict;
  else
    raise notice 'products 里有 % 行 category 不在分类表，已跳过外键', orphans;
  end if;
end $$;

-- =============================================================
-- 收尾 1 · 补齐已有对象的权限
--   放在最后执行：`create table if not exists` 对已存在的表是空操作，
--   而 default privileges 只作用于"之后创建"的对象，重复跑时靠这一段兜住。
-- =============================================================
grant all privileges on all tables    in schema yolo to anon, authenticated, service_role;
grant all privileges on all sequences in schema yolo to anon, authenticated, service_role;
grant all privileges on all functions in schema yolo to anon, authenticated, service_role;

-- =============================================================
-- 收尾 2 · 让 PostgREST 立刻重新读取 schema 缓存（改 Exposed schemas 后也会自动刷）
--   只是发个通知，不影响安全性
-- =============================================================
notify pgrst, 'reload schema';
