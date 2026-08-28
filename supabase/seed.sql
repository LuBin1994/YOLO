-- =============================================================
-- 种子数据：示例产品 + 页面内容（开发阶段占位）
-- 图片为 Unsplash 高质量占位图，上线前替换为 Supabase Storage URL
-- =============================================================

insert into public.products (title, slug, description, category, images, cover_image, materials, moq, price_range, featured, sort_order) values
(
  'Organic Cotton Jersey Tee',
  'organic-cotton-jersey-tee',
  'Heavyweight 220gsm organic cotton jersey. Garment-dyed, pre-shrunk, with a relaxed fit. Ideal for private label basics programs.',
  'apparel',
  array[
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1600&q=80'
  ],
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
  array['100% GOTS Organic Cotton'],
  500,
  '$3.8 - $5.2 / pc',
  true,
  1
),
(
  'Eco-Certified Knit Polo',
  'eco-certified-knit-polo',
  'Pique knit polo in recycled polyester blend. Oeko-Tex certified, quick-dry finish, custom embroidery ready.',
  'knit',
  array[
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1600&q=80'
  ],
  'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1600&q=80',
  array['65% Recycled Polyester', '35% Cotton'],
  800,
  '$6.5 - $8.9 / pc',
  true,
  2
),
(
  'Selvedge Denim Jacket',
  'selvedge-denim-jacket',
  'Classic trucker jacket in 14oz selvedge denim. Sanforized, contrast stitching, branded hardware.',
  'denim',
  array[
    'https://images.unsplash.com/photo-1521093470119-a3ac39643369?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1600&q=80'
  ],
  'https://images.unsplash.com/photo-1521093470119-a3ac39643369?auto=format&fit=crop&w=1600&q=80',
  array['14oz Selvedge Denim'],
  300,
  '$18.0 - $24.0 / pc',
  false,
  3
),
(
  'Relaxed Woven Shirt',
  'relaxed-woven-shirt',
  'Relaxed-fit woven shirt in Tencel and organic linen blend. Breathable, wrinkle-resistant, perfect for warm climates.',
  'woven',
  array[
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=80'
  ],
  'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=80',
  array['60% Tencel', '40% Organic Linen'],
  400,
  '$9.5 - $12.8 / pc',
  false,
  4
),
(
  'Performance Track Jacket',
  'performance-track-jacket',
  'Lightweight 3-layer bonded shell for performance outerwear lines. Water-resistant, breathable membrane, taped seams.',
  'outerwear',
  array[
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80'
  ],
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1600&q=80',
  array['100% Recycled Nylon'],
  600,
  '$14.0 - $19.5 / pc',
  true,
  5
),
(
  'Brushed Fleece Hoodie',
  'brushed-fleece-hoodie',
  '330gsm brushed-back fleece hoodie. Drop shoulder, double-layer hood, kangaroo pocket. Heavyweight streetwear staple.',
  'apparel',
  array[
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=80'
  ],
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=80',
  array['80% Cotton', '20% Recycled Polyester'],
  500,
  '$11.0 - $15.0 / pc',
  false,
  6
);

-- 工厂介绍页（示例富文本内容）
update public.pages
set hero_image = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2400&q=80',
    sections = '[
      {"type": "heading", "content": "Vertically Integrated Production"},
      {"type": "paragraph", "content": "Our factories across Southeast Asia manage the full supply chain — from fabric sourcing and dyeing to cutting, sewing, finishing and quality control. This vertical integration gives us unmatched control over quality, lead time and cost."},
      {"type": "image", "content": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2400&q=80", "caption": "Sewing floor, 1,200 operators"},
      {"type": "heading", "content": "Capacity & Capability"},
      {"type": "paragraph", "content": "Monthly output exceeds 1.2 million pieces across six production lines. We specialize in medium to large-volume programs with full QC, packaging and logistics support."}
    ]'::jsonb
where slug = 'factory';

-- 绿色理念页（示例富文本内容）
update public.pages
set hero_image = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=2400&q=80',
    sections = '[
      {"type": "heading", "content": "Sustainable Materials"},
      {"type": "paragraph", "content": "We source GOTS organic cotton, recycled polyester, Tencel and hemp. All fabrics are Oeko-Tex certified and traceable from fiber to finished garment."},
      {"type": "heading", "content": "Clean Production"},
      {"type": "paragraph", "content": "Our dye houses use closed-loop water recycling systems, recovering 85% of wastewater. Solar panels cover 40% of factory rooftops, cutting grid dependency."}
    ]'::jsonb
where slug = 'sustainability';

-- 社会责任页（示例富文本内容）
update public.pages
set hero_image = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2400&q=80',
    sections = '[
      {"type": "heading", "content": "People First"},
      {"type": "paragraph", "content": "We employ over 3,800 workers across our facilities, with fair wages, dormitory housing, on-site clinics and free vocational training programs."},
      {"type": "heading", "content": "Community Impact"},
      {"type": "paragraph", "content": "Annual community programs support local schools, clean water projects and women-led cooperatives in the regions where we operate."}
    ]'::jsonb
where slug = 'social-responsibility';
