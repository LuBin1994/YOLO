-- =============================================================
-- 产品分类表：树状多级（2026-11-06 新增）
--
-- 【为什么现在才建表】
-- 分类原来是代码里写死的两级数组（src/lib/product-categories.ts），
-- 后台表单又另写了一套完全不同的枚举（apparel/knit/...），两边对不上。
-- 现在统一成数据库表：后台维护、前台读英文名、商品可挂任意一级。
--
-- 【结构要点】
--   parent_id 自引用 → 任意层级，不预设只有两级
--   products.category 存 **slug**，外键指到本表 slug（on update cascade /
--     on delete restrict）：改 slug 自动带到产品，删还有产品的分类会被拦住
--   name_zh / name_en 分开存：后台显示中文，前台显示英文，不做运行时翻译
--
-- 【执行位置】Supabase Dashboard → SQL Editor；幂等，可重复执行
-- 【执行顺序】要在 schema.sql / migrate-to-yolo.sql 之后（依赖 yolo schema 与 yolo.set_updated_at）
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 1 · 建表
-- -------------------------------------------------------------
create table if not exists yolo.categories (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references yolo.categories (id) on delete restrict,
  slug        text not null unique,
  name_zh     text not null,
  name_en     text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  /* 防止自己认自己当爹（跨层的环由应用层保证，这里挡最直接的一种） */
  constraint categories_not_self_parent check (parent_id is null or parent_id <> id)
);

create index if not exists idx_categories_parent on yolo.categories (parent_id, sort_order);
create index if not exists idx_categories_sort on yolo.categories (sort_order, name_en);

drop trigger if exists trg_categories_updated_at on yolo.categories;
create trigger trg_categories_updated_at
  before update on yolo.categories
  for each row execute function yolo.set_updated_at();

-- -------------------------------------------------------------
-- 2 · RLS：公开可读（前台要拿英文名），仅管理员可写
-- -------------------------------------------------------------
alter table yolo.categories enable row level security;

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

-- 授权（自建 schema 不会自动带上 public 的默认权限）
grant all privileges on yolo.categories to anon, authenticated, service_role;

-- -------------------------------------------------------------
-- 3 · 种子：迁移前静态树里的 13 个节点，顺序即客户目录顺序
--     已存在的行只更新名称与排序，不动 parent_id（下面单独处理）
-- -------------------------------------------------------------
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
      sort_order = excluded.sort_order,
      updated_at = now();

-- 父子关系单独写，避免在 values 里引用还没插入的行
update yolo.categories c
   set parent_id = p.id
  from (values
          ('kids-jacket', 'kids'),
          ('kids-padded', 'kids'),
          ('kids-shearling', 'kids'),
          ('mens-coat', 'mens'),
          ('mens-jacket', 'mens'),
          ('mens-padded', 'mens'),
          ('womens-jacket', 'womens'),
          ('womens-padded', 'womens'),
          ('womens-shearling', 'womens'),
          ('womens-trench', 'womens')
       ) as m (child, parent)
  join yolo.categories p on p.slug = m.parent
 where c.slug = m.child
   and c.parent_id is distinct from p.id;

-- 根节点确保是根（防止之前误设过父级）
update yolo.categories
   set parent_id = null
 where slug in ('kids', 'mens', 'womens') and parent_id is not null;

-- -------------------------------------------------------------
-- 4 · 给 products.category 补外键
--     原则：宁可跳过也不让迁移失败 —— 有脏数据时先提示，不强行加约束
-- -------------------------------------------------------------
alter table yolo.products alter column category drop default;

do $$
declare
  orphans int;
  total int;
begin
  select count(*) into total from yolo.products;
  select count(*) into orphans
    from yolo.products p
   where not exists (select 1 from yolo.categories c where c.slug = p.category);

  if orphans > 0 then
    raise notice '有 % 个产品（共 % 个）的 category 不在分类表里，已跳过外键。', orphans, total;
    raise notice '先补分类或改这些产品，再执行：';
    raise notice '  alter table yolo.products add constraint products_category_fkey foreign key (category) references yolo.categories (slug) on update cascade on delete restrict;';
    raise notice '  select distinct category from yolo.products where category not in (select slug from yolo.categories);';
  else
    alter table yolo.products drop constraint if exists products_category_fkey;
    alter table yolo.products
      add constraint products_category_fkey
      foreign key (category) references yolo.categories (slug)
      on update cascade on delete restrict;
    raise notice 'products.category → categories.slug 外键已就绪（产品 % 个）', total;
  end if;
end $$;

-- -------------------------------------------------------------
-- 5 · 自查
-- -------------------------------------------------------------
-- 树形一览：
--   select c.slug, c.name_zh, c.name_en, c.sort_order, p.slug as parent
--   from yolo.categories c left join yolo.categories p on p.id = c.parent_id
--   order by coalesce(p.sort_order, c.sort_order), c.sort_order;

notify pgrst, 'reload schema';

commit;
