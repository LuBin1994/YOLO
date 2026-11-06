"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  buildCategorySlug,
  buildCategoryTree,
  collectDescendantIds,
  flattenCategoryTree,
  type Category,
} from "@/lib/categories";

interface CategoryFormProps {
  /** 编辑模式传现有分类，新建为 null */
  category?: Category | null;
  /** 全部分类（用于选上级） */
  categories: Category[];
}

/**
 * 分类新建/编辑表单。
 *
 * 【为什么上级用「一个缩进下拉」而不是三级联动】
 * 需求是"商品/分类可以挂在任意一级"。联动选择器天然只能一路走到底，
 * 想停在中间就得再加一个"到这里为止"的勾选，反而更绕。
 * 原生 select 里用缩进（`　　└ `）表达层级，一次点选、任意深度、键盘可用。
 *
 * 【slug 为什么自动带父级前缀】
 * 迁移前的素材就是 kids-jacket 这种写法，`products.category` 存的就是它。
 * 保持同一种命名，SQL 里能一眼看出归属；用户也可以手工改。
 */
export default function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = Boolean(category);

  const [nameZh, setNameZh] = useState(category?.name_zh ?? "");
  const [nameEn, setNameEn] = useState(category?.name_en ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [parentId, setParentId] = useState(category?.parent_id ?? "");
  const [sortOrder, setSortOrder] = useState(
    category?.sort_order?.toString() ?? "0"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* 编辑时，可选上级 = 全部分类 − 自己及自己的子孙（否则树会成环） */
  const parentOptions = useMemo(() => {
    const excluded = category
      ? collectDescendantIds(categories, category.id)
      : new Set<string>();
    const rows = categories.filter((c) => !excluded.has(c.id));
    return flattenCategoryTree(buildCategoryTree(rows));
  }, [categories, category]);

  const parentSlug = parentId
    ? categories.find((c) => c.id === parentId)?.slug ?? null
    : null;

  const autoSlug = buildCategorySlug(nameEn, parentSlug);
  const finalSlug = slugTouched ? slug : autoSlug;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name_zh: nameZh,
      name_en: nameEn,
      slug: finalSlug,
      parent_id: parentId || null,
      sort_order: sortOrder,
    };

    try {
      const url = isEdit
        ? `/api/admin/categories/${category!.id}`
        : "/api/admin/categories";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "保存失败。");

      router.push("/admin/categories");
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
      <section className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name_zh" className={labelCls}>
              中文名 *
            </label>
            <input
              id="name_zh"
              className={inputCls}
              value={nameZh}
              onChange={(e) => setNameZh(e.target.value)}
              placeholder="童装夹克"
              required
            />
            <p className="mt-1 text-[13px] text-ink-400">后台显示用。</p>
          </div>
          <div>
            <label htmlFor="name_en" className={labelCls}>
              英文名 *
            </label>
            <input
              id="name_en"
              className={inputCls}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Kids Jackets"
              required
            />
            <p className="mt-1 text-[13px] text-ink-400">前台显示用。</p>
          </div>
        </div>

        <div>
          <label htmlFor="parent" className={labelCls}>
            上级分类
          </label>
          <select
            id="parent"
            className={inputCls}
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">— 顶级分类 —</option>
            {parentOptions.map((node) => (
              <option key={node.id} value={node.id}>
                {`${"　".repeat(node.depth)}${node.depth > 0 ? "└ " : ""}${node.name_zh}`}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[13px] text-ink-400">
            层级不限。商品可以挂在这个分类本身，也可以挂到它的下级。
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="slug" className={labelCls}>
              别名（slug）
            </label>
            <input
              id="slug"
              className={inputCls}
              value={finalSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              placeholder="留空自动生成"
            />
            <p className="mt-1 text-[13px] text-ink-400">
              产品的分类字段存的是这个值。改它会把挂在此类下的产品一起改掉。
            </p>
          </div>
          <div>
            <label htmlFor="sort" className={labelCls}>
              排序值
            </label>
            <input
              id="sort"
              type="number"
              className={inputCls}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <p className="mt-1 text-[13px] text-ink-400">
              同级之间按数值从小到大；不同级互不影响。
            </p>
          </div>
        </div>
      </section>

      {error ? <p className="text-[15px] font-medium text-red-600">{error}</p> : null}

      <div className="flex items-center gap-4 border-t hairline pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "保存中..." : isEdit ? "保存修改" : "创建分类"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="btn-ghost text-[15px]"
        >
          取消
        </button>
      </div>
    </form>
  );
}
