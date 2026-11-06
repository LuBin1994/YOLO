-- =============================================================
-- 产品「氛围图」字段（2026-11-06 新增）
--
-- 【用途边界】只在首页滚动图组使用：
--   后台给商品单独传一张氛围/场景图 → 首页图墙取所有有氛围图的商品，
--   每格链到该商品详情页；**商品详情页不展示它**（详情页只读 images/cover_image）。
--
-- 【为什么单独一列，不塞进 images】
-- 塞进 images 就会在图集里出现，还得记"最后一张是氛围图"这种隐式约定；
-- 单独一列让"有没有氛围图"变成一条可查询条件（where mood_image is not null）。
--
-- 【执行位置】Supabase Dashboard → SQL Editor；幂等
-- =============================================================

alter table yolo.products
  add column if not exists mood_image text;

comment on column yolo.products.mood_image is
  '首页滚动图组专用的氛围图（Storage 公开 URL）；不进商品详情图集';

-- 有氛围图的商品按排序值取出，给首页用；顺手建个部分索引
create index if not exists idx_products_has_mood
  on yolo.products (sort_order)
  where mood_image is not null;

notify pgrst, 'reload schema';
