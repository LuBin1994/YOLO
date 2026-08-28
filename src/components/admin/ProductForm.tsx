"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ImageUploader from "./ImageUploader";
import { categoryLabel, slugify } from "@/lib/utils";
import type { Product } from "@/lib/supabase/types";

interface ProductFormProps {
  /** 编辑模式传入现有产品，新建模式为 null */
  product?: Product | null;
}

const CATEGORIES = ["apparel", "knit", "woven", "denim", "outerwear", "other"];

/**
 * 产品新建/编辑表单。提交到 /api/admin/products。
 */
export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(product?.category ?? "apparel");
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
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
    "w-full border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-forest-600";
  const labelCls = "mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-ink-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基础信息 */}
      <section className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
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
            <label htmlFor="category" className={labelCls}>分类</label>
            <select
              id="category"
              className={inputCls}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryLabel(c)}</option>
              ))}
            </select>
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
          <p className="mt-1 text-xs text-ink-400">多个材质用逗号分隔。</p>
        </div>
      </section>

      {/* 图片 */}
      <section className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
          图片 <span className="text-ink-400">（Supabase 存储）</span>
        </p>
        <ImageUploader
          images={images}
          onChange={setImages}
          folder={`products/${finalSlug || "draft"}`}
        />
      </section>

      {/* 设置 */}
      <section className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
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
          <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-900">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-forest-700"
            />
            首页精选
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-900">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 accent-forest-700"
            />
            发布
          </label>
        </div>
      </section>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

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
          className="btn-ghost text-sm"
        >
          取消
        </button>
      </div>
    </form>
  );
}
