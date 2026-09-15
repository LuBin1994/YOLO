-- =============================================================
-- 产品目录数据：按服装分类补齐，每类凑满 4 条
-- =============================================================
-- 执行方式：Supabase Dashboard → SQL Editor → 粘贴本文件 → Run
--   （products 表 RLS 只允许管理员写入，anon key 无法直接插，所以走 SQL Editor）
--
-- 幂等：以 slug 为冲突键 upsert，可重复执行，不会产生重复行。
-- 本文件不动 supabase/seed.sql 里已有的 5 条数据，只新增 15 条。
--
-- 图片：Unsplash 直链，已逐张验证 HTTP 200 且内容与分类一致。
--       上线前请替换为 Supabase Storage URL。
--
-- 补齐后各分类条数：apparel 4 / knit 4 / woven 4 / outerwear 4 / denim 4 = 20 条
-- =============================================================

insert into public.products
  (title, slug, description, category, images, cover_image, materials, moq, price_range, featured, published, sort_order)
values

-- ---------------------------------------------------------------
-- apparel（已有 2 条，补 2 条）
-- ---------------------------------------------------------------
(
  'Heavyweight Boxy Crew Tee',
  'heavyweight-boxy-crew-tee',
  '240gsm compact-spun jersey with a boxy, dropped-shoulder silhouette. Twin-needle hems, ribbed neck tape and a garment-washed hand feel — built for private label basics programs.',
  'apparel',
  array['https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=1600&auto=format',
  array['100% Combed Cotton'],
  600,
  '$4.2 - $5.6 / pc',
  false,
  true,
  7
),
(
  'Graphic Fleece Hoodie',
  'graphic-fleece-hoodie',
  '380gsm brushed-back fleece hoodie built for screen print and puff print programs. Double-layer hood, metal-tipped drawcords and a deep kangaroo pocket.',
  'apparel',
  array['https://images.unsplash.com/photo-1680292783974-a9a336c10366?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1680292783974-a9a336c10366?q=80&w=1600&auto=format',
  array['80% Cotton', '20% Recycled Polyester'],
  500,
  '$9.8 - $13.5 / pc',
  true,
  true,
  8
),

-- ---------------------------------------------------------------
-- knit（已有 1 条，补 3 条）
-- ---------------------------------------------------------------
(
  'Merino Ribbed Crewneck',
  'merino-ribbed-crewneck',
  'Fine-gauge merino rib knit with a clean crew neckline. Fully fashioned panels, hand-linked seams and a machine-washable finish.',
  'knit',
  array['https://images.unsplash.com/photo-1615310748170-29d7088865ad?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1615310748170-29d7088865ad?q=80&w=1600&auto=format',
  array['100% Extra-fine Merino Wool'],
  400,
  '$14.5 - $19.0 / pc',
  false,
  true,
  9
),
(
  'Mohair-Blend Cardigan',
  'mohair-blend-cardigan',
  'Fluffy mohair-blend cardigan with drop shoulders and horn-look buttons. Brushed surface, loose gauge — ideal for autumn/winter layering stories.',
  'knit',
  array['https://images.unsplash.com/photo-1581497396202-5645e76a3a8e?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1581497396202-5645e76a3a8e?q=80&w=1600&auto=format',
  array['45% Mohair', '30% Nylon', '25% Wool'],
  350,
  '$16.0 - $21.5 / pc',
  true,
  true,
  10
),
(
  'Fair Isle Jacquard Cardigan',
  'fair-isle-jacquard-cardigan',
  'Jacquard-knit cardigan with a traditional Fair Isle yoke. 5-gauge flat bed, hand-linked armholes and a four-colour yarn program.',
  'knit',
  array['https://images.unsplash.com/photo-1758981400268-1181291b9503?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1758981400268-1181291b9503?q=80&w=1600&auto=format',
  array['60% Lambswool', '40% Recycled Polyamide'],
  300,
  '$18.0 - $24.0 / pc',
  false,
  true,
  11
),

-- ---------------------------------------------------------------
-- woven（已有 1 条，补 3 条）
-- ---------------------------------------------------------------
(
  'Linen Camp-Collar Shirt',
  'linen-camp-collar-shirt',
  'Relaxed camp-collar shirt in 100% washed European linen. Coconut buttons, single patch pocket and a garment-washed drape that softens with every wear.',
  'woven',
  array['https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1713881842156-3d9ef36418cc?q=80&w=1600&auto=format',
  array['100% European Linen'],
  400,
  '$9.5 - $12.8 / pc',
  true,
  true,
  12
),
(
  'Oxford Button-Down Shirt',
  'oxford-button-down-shirt',
  'Classic oxford cloth button-down in 140gsm yarn-dyed cotton. Button-down collar, box pleat and a split back yoke for easy movement.',
  'woven',
  array['https://images.unsplash.com/photo-1758600588319-fa4097ee5208?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1758600588319-fa4097ee5208?q=80&w=1600&auto=format',
  array['100% Cotton Oxford'],
  600,
  '$7.8 - $10.4 / pc',
  false,
  true,
  13
),
(
  'Stretch Poplin Dress Shirt',
  'stretch-poplin-dress-shirt',
  'Easy-care stretch poplin with a wrinkle-resistant finish. Fused collar and cuffs, available in slim and regular fits.',
  'woven',
  array['https://images.unsplash.com/photo-1598032895455-526c9e347a87?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1598032895455-526c9e347a87?q=80&w=1600&auto=format',
  array['97% Cotton', '3% Elastane'],
  800,
  '$8.6 - $11.2 / pc',
  false,
  true,
  14
),

-- ---------------------------------------------------------------
-- outerwear（已有 1 条，补 3 条）
-- ---------------------------------------------------------------
(
  'Moto Leather Jacket',
  'moto-leather-jacket',
  'Asymmetric-zip moto jacket in 1.1mm grained sheep leather. Quilted viscose lining, YKK hardware and hand-finished edge paint.',
  'outerwear',
  array['https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1600&auto=format',
  array['100% Sheep Leather', 'Viscose Lining'],
  200,
  '$62.0 - $88.0 / pc',
  true,
  true,
  15
),
(
  'Fur-Lined Hooded Parka',
  'fur-lined-hooded-parka',
  'Long-line parka with detachable faux-fur trim, storm cuffs and taped critical seams. 10K/5K membrane for winter performance programs.',
  'outerwear',
  array['https://images.unsplash.com/photo-1611163475130-02a9306afed6?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1611163475130-02a9306afed6?q=80&w=1600&auto=format',
  array['Shell: 100% Recycled Polyester', 'Lining: 100% Recycled Polyester'],
  300,
  '$38.0 - $52.0 / pc',
  false,
  true,
  16
),
(
  'Lightweight Down Jacket',
  'lightweight-down-jacket',
  '650-fill-power down jacket with a 20D ripstop shell. Packs into its own pocket, matte finish and RDS-certified filling.',
  'outerwear',
  array['https://images.unsplash.com/photo-1612698691996-86300eb50691?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1612698691996-86300eb50691?q=80&w=1600&auto=format',
  array['Shell: 100% Nylon 20D', 'Fill: 90/10 RDS Duck Down'],
  300,
  '$34.0 - $46.0 / pc',
  true,
  true,
  17
),

-- ---------------------------------------------------------------
-- denim（原为空，补 4 条）
-- ---------------------------------------------------------------
(
  'Raw Denim Wash Development',
  'raw-denim-wash-development',
  'In-house wash development on 12-14oz raw denim. Laser whiskering, ozone and e-flow finishing for low-water wash programmes.',
  'denim',
  array['https://images.unsplash.com/photo-1645859610425-f0f4177df5f0?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1645859610425-f0f4177df5f0?q=80&w=1600&auto=format',
  array['12-14oz Rigid Denim'],
  300,
  '$1.2 - $2.8 / pc (wash only)',
  false,
  true,
  18
),
(
  'Selvedge Straight-Leg Jean',
  'selvedge-straight-leg-jean',
  '14oz selvedge denim in a classic straight leg. Chain-stitched hem, copper rivets and sanforized construction for minimal shrinkage.',
  'denim',
  array['https://images.unsplash.com/photo-1637069585336-827b298fe84a?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1637069585336-827b298fe84a?q=80&w=1600&auto=format',
  array['14oz Japanese Selvedge Denim'],
  300,
  '$19.0 - $26.0 / pc',
  true,
  true,
  19
),
(
  'Rigid Denim Trucker Jacket',
  'rigid-denim-trucker-jacket',
  'Type III trucker jacket in 12oz rigid denim. Contrast stitching, branded shank buttons and adjustable waist tabs.',
  'denim',
  array['https://images.unsplash.com/photo-1537465978529-d23b17165b3b?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1537465978529-d23b17165b3b?q=80&w=1600&auto=format',
  array['12oz Rigid Denim'],
  400,
  '$21.0 - $28.5 / pc',
  false,
  true,
  20
),
(
  'Stretch Denim Overshirt',
  'stretch-denim-overshirt',
  'Shirt-jacket hybrid in 9oz stretch denim. Double chest pockets, corozo buttons and a garment wash for an already-broken-in feel.',
  'denim',
  array['https://images.unsplash.com/photo-1527016021513-b09758b777bd?q=80&w=1600&auto=format'],
  'https://images.unsplash.com/photo-1527016021513-b09758b777bd?q=80&w=1600&auto=format',
  array['98% Cotton', '2% Elastane'],
  500,
  '$16.5 - $22.0 / pc',
  false,
  true,
  21
)

on conflict (slug) do update set
  title       = excluded.title,
  description = excluded.description,
  category    = excluded.category,
  images      = excluded.images,
  cover_image = excluded.cover_image,
  materials   = excluded.materials,
  moq         = excluded.moq,
  price_range = excluded.price_range,
  featured    = excluded.featured,
  published   = excluded.published,
  sort_order  = excluded.sort_order;

-- 执行后核对各分类条数：
-- select category, count(*) from public.products group by category order by category;
