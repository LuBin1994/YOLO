-- =============================================================
-- 离岸服装集团官网 · Supabase 数据库 Schema
-- 在 Supabase Dashboard → SQL Editor 中执行本脚本
-- 幂等：可重复执行
-- =============================================================

-- ---------- 扩展 ----------
create extension if not exists "pgcrypto";

-- =============================================================
-- 表：products（产品数据）
-- =============================================================
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  description text,
  category    text not null default 'apparel',           -- apparel / knit / woven / outerwear / denim ...
  images      text[] not null default '{}',              -- Supabase Storage 公开 URL 数组
  cover_image text,                                      -- 列表封面
  materials   text[] not null default '{}',              -- 面料成分
  moq         integer,                                   -- 最小起订量
  price_range text,                                      -- 价格区间展示文本，如 "$4.5 - $7.2 / pc"
  featured    boolean not null default false,            -- 首页精选
  published   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_products_published on public.products (published, sort_order desc);

create index if not exists idx_products_category on public.products (category);

-- =============================================================
-- 表：pages（通用页面内容：工厂介绍 / 绿色理念 / 社会责任）
-- =============================================================
create table if not exists public.pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,                      -- factory / sustainability / social-responsibility
  title       text not null,
  hero_image  text,                                      -- 首屏大图
  sections    jsonb not null default '[]',               -- 富文本段落数组，见 README 结构说明
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================
-- 表：inquiries（询盘数据）
-- =============================================================
create table if not exists public.inquiries (
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

create index if not exists idx_inquiries_status on public.inquiries (status, created_at desc);
create index if not exists idx_inquiries_created on public.inquiries (created_at desc);

-- =============================================================
-- 表：admins（后台管理员，关联 Supabase Auth 用户）
-- =============================================================
create table if not exists public.admins (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null unique,
  display_name text,
  role         text not null default 'admin' check (role in ('admin', 'editor')),
  created_at   timestamptz not null default now()
);

-- =============================================================
-- 通用：updated_at 自动更新触发器
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_pages_updated_at on public.pages;
create trigger trg_pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

-- =============================================================
-- RLS 辅助函数：当前用户是否为管理员
-- =============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins
    where id = auth.uid()
  );
$$;

-- =============================================================
-- 启用 Row Level Security
-- =============================================================
alter table public.products  enable row level security;
alter table public.pages     enable row level security;
alter table public.inquiries enable row level security;
alter table public.admins    enable row level security;

-- ---------- products：公开可读，仅管理员可写 ----------
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (published = true);

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
  on public.products for update
  using (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete
  using (public.is_admin());

-- ---------- pages：公开可读，仅管理员可写 ----------
drop policy if exists "pages_public_read" on public.pages;
create policy "pages_public_read"
  on public.pages for select
  using (published = true);

drop policy if exists "pages_admin_insert" on public.pages;
create policy "pages_admin_insert"
  on public.pages for insert
  with check (public.is_admin());

drop policy if exists "pages_admin_update" on public.pages;
create policy "pages_admin_update"
  on public.pages for update
  using (public.is_admin());

drop policy if exists "pages_admin_delete" on public.pages;
create policy "pages_admin_delete"
  on public.pages for delete
  using (public.is_admin());

-- ---------- inquiries：允许匿名提交，仅管理员可读/改状态 ----------
drop policy if exists "inquiries_anon_insert" on public.inquiries;
create policy "inquiries_anon_insert"
  on public.inquiries for insert
  with check (true);

drop policy if exists "inquiries_admin_select" on public.inquiries;
create policy "inquiries_admin_select"
  on public.inquiries for select
  using (public.is_admin());

drop policy if exists "inquiries_admin_update" on public.inquiries;
create policy "inquiries_admin_update"
  on public.inquiries for update
  using (public.is_admin());

drop policy if exists "inquiries_admin_delete" on public.inquiries;
create policy "inquiries_admin_delete"
  on public.inquiries for delete
  using (public.is_admin());

-- ---------- admins：仅管理员可读 ----------
drop policy if exists "admins_admin_select" on public.admins;
create policy "admins_admin_select"
  on public.admins for select
  using (public.is_admin());

-- =============================================================
-- Storage 存储桶：media（公开读）
-- 目录约定：media/products/<slug>/  media/pages/<slug>/
-- =============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media_auth_upload" on storage.objects;
create policy "media_auth_upload"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_auth_update" on storage.objects;
create policy "media_auth_update"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_auth_delete" on storage.objects;
create policy "media_auth_delete"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- =============================================================
-- 种子数据（可选执行）
-- =============================================================
insert into public.pages (slug, title, hero_image) values
  ('factory', 'Our Factory', null),
  ('sustainability', 'Sustainability', null),
  ('social-responsibility', 'Social Responsibility', null)
on conflict (slug) do nothing;
