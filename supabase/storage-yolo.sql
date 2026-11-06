-- =============================================================
-- Storage 存储桶：media → yolo（2026-11-06）
--
-- 【为什么是新建桶而不是改桶名】
-- Supabase Storage 把对象真实路径记成 `{bucket_id}/{key}`（S3 里的前缀）。
-- 直接 update storage.buckets set id='yolo' 只会改元数据，文件还躺在
-- media/ 下面 —— 结果是列表看得见、下载全 404。所以只新建桶，不做重命名。
--
-- 【media 桶里现在有什么】
-- 只有 `pages/**` 这一堆 CMS 遗留图（2026-11-05 内容管理下线，代码已不引用），
-- `products/**` 从来没传过（产品图都是仓库里的 public/media 静态资源）。
-- 所以本脚本的策略是：**桶里没东西才顺手删掉，有东西就只提示、不动手**。
--
-- 【执行位置】Supabase Dashboard → SQL Editor
-- 【执行顺序】在 schema.sql / migrate-to-yolo.sql 之后
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 1 · 新建 yolo 桶（公开读，10MB，只允许图片）
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'yolo', 'yolo', true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- -------------------------------------------------------------
-- 2 · 策略：新桶四条；同时清掉旧桶留下的同名策略
--     （策略挂在 storage.objects 上，按名字区分，删旧的不影响别的项目）
-- -------------------------------------------------------------
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

drop policy if exists "media_public_read" on storage.objects;
drop policy if exists "media_auth_upload" on storage.objects;
drop policy if exists "media_auth_update" on storage.objects;
drop policy if exists "media_auth_delete" on storage.objects;

-- -------------------------------------------------------------
-- 3 · 旧桶：空的就删，有东西只提示（不替客户销毁数据）
-- -------------------------------------------------------------
do $$
declare
  n int;
begin
  select count(*) into n from storage.objects where bucket_id = 'media';

  if n = 0 then
    delete from storage.buckets where id = 'media';
    raise notice 'media 桶是空的，已删除。';
  else
    raise notice 'media 桶里还有 % 个对象，没有动它。', n;
    raise notice '按当前代码它们都已不再被引用（只剩 CMS 的 pages/ 遗留图）。确认不要之后，在';
    raise notice 'Dashboard → Storage 里手动删掉 media 桶即可；要保留就先下载，别用 SQL 改桶名。';
    raise notice '自查：select bucket_id, count(*) from storage.objects group by 1;';
  end if;
end $$;

notify pgrst, 'reload schema';

commit;
