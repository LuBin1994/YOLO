"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ImageUploader from "./ImageUploader";
import MoodImageUploader from "./MoodImageUploader";
import { slugify } from "@/lib/utils";
import {
  buildCategoryTree,
  flattenCategoryTree,
  type Category,
} from "@/lib/categories";
import type { Product } from "@/lib/supabase/types";

interface ProductFormProps {
  /** 编辑模式传入现有产品，新建模式为 null */
  product?: Product | null;
  /** 全部分类（树状缩进展示，值存 slug） */
  categories: Category[];
}

/**
 * 产品新建/编辑表单。提交到 /api/admin/products。
 *
 * 【分类为什么是缩进下拉】
 * 2026-11-06 之前这里写死了一套 `["apparel","knit",...]`，
 * 和前台用的 kids-jacket 那套完全对不上（后台选"服装"，前台根本筛不出东西）。
 * 现在读 yolo.categories，按层级缩进，商品可以挂到任意一级。
 */
export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  /** 氛围图独立字段：不进 images，所以详情页图集不会多出一张 */
  const [moodImage, setMoodImage] = useState<string | null>(
    product?.mood_image ?? null
  );
  const [materials, setMaterials] = useState(product?.materials.join(", ") ?? "");
  const [moq, setMoq] = useState(product?.moq?.toString() ?? "");
  const [priceRange, setPriceRange] = useState(product?.price_range ?? "");
  const [sortOrder, setSortOrder] = useState(
    product?.sort_order?.toString() ?? "0"
  );
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [published, setPublished] = useState(product?.published ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalSlug = useMemo(
    () => (slugTouched ? slug : slugify(title)),
    [title, slug, slugTouched]
  );

  /* 树形缩进选项：一次点选、任意深度，比多级联动少两步操作 */
  const categoryOptions = useMemo(
    () => flattenCategoryTree(buildCategoryTree(categories)),
    [categories]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      slug: finalSlug,
      category,
      description,
      images,
      mood_image: moodImage,
      materials: materials
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      moq,
      price_range: priceRange,
      sort_order: sortOrder,
      featured,
      published,
    };

    try {
      const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "保存失败。");

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败。");
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full border border-ink-900/15 bg-white px-3 py-2.5 text-[15px] outline-none transition-colors focus:border-ink-950";
  const labelCls = "mb-1.5 block text-[12px] uppercase tracking-[0.2em] text-ink-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基础信息 */}
      <section className="space-y-5">
        <p className="text-[12px] uppercase tracking-[0.24em] text-ink-400">
          基本信息
        </p>
        <div>
          <label htmlFor="title" className={labelCls}>标题 *</label>
          <input
            id="title"
            className={inputCls}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label htmlFor="slug" className={labelCls}>别名（Slug）</label>
          <input
            id="slug"
            className={inputCls}
            value={slugTouched ? slug : finalSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="自动根据标题生成"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="category" className={labelCls}>分类 *</label>
            <select
              id="category"
              className={inputCls}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                请选择分类
              </option>
              {categoryOptions.map((node) => (
                <option key={node.id} value={node.slug}>
                  {`${"　".repeat(node.depth)}${node.depth > 0 ? "└ " : ""}${node.name_zh}`}
                </option>
              ))}
            </select>
            {categoryOptions.length === 0 ? (
              <p className="mt-1 text-[13px] text-amber-700">
                还没有分类，先去「分类管理」建一个。
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="price" className={labelCls}>价格区间</label>
            <input
              id="price"
              className={inputCls}
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              placeholder="$3.8 - $5.2 / pc"
            />
          </div>
          <div>
            <label htmlFor="moq" className={labelCls}>起订量（MOQ）</label>
            <input
              id="moq"
              type="number"
              min={1}
              className={inputCls}
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="desc" className={labelCls}>描述</label>
          <textarea
            id="desc"
            rows={4}
            className={`${inputCls} resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="materials" className={labelCls}>材质</label>
          <input
            id="materials"
            className={inputCls}
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="100% GOTS Organic Cotton, 65% Recycled Polyester"
          />
          <p className="mt-1 text-[13px] text-ink-400">多个材质用逗号分隔。</p>
        </div>
      </section>

      {/* 图片 */}
      <section className="space-y-5">
        <p className="text-[12px] uppercase tracking-[0.24em] text-ink-400">
          图片 <span className="text-ink-400">（Supabase 存储）</span>
        </p>
        <ImageUploader
          images={images}
          onChange={setImages}
          folder={`products/${finalSlug || "draft"}`}
        />
      </section>

      {/* 氛围图：只在首页滚动图组使用，详情图集不读它 */}
      <section className="space-y-5">
        <p className="text-[12px] uppercase tracking-[0.24em] text-ink-400">
          氛围图 <span className="text-ink-400">（首页滚动图组专用）</span>
        </p>
        <MoodImageUploader
          value={moodImage}
          onChange={setMoodImage}
          folder={`products/${finalSlug || "draft"}/mood`}
        />
      </section>

      {/* 设置 */}
      <section className="space-y-5">
        <p className="text-[12px] uppercase tracking-[0.24em] text-ink-400">
          设置
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="sort" className={labelCls}>排序值</label>
            <input
              id="sort"
              type="number"
              className={inputCls}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-8 pt-1">
          <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink-950">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-ink-950"
            />
            首页精选
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink-950">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-ink-950"
            />
            发布
          </label>
        </div>
      </section>

      {error ? <p className="text-[15px] font-medium text-red-600">{error}</p> : null}

      <div className="flex items-center gap-4 border-t hairline pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "保存中..." : isEdit ? "保存修改" : "创建产品"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="btn-ghost text-[15px]"
        >
          取消
        </button>
      </div>
    </form>
  );
}
