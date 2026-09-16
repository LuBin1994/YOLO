"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/supabase/types";
import ProductCard from "./ProductCard";

type ViewMode = "grid" | "list";

/**
 * 产品浏览区：分类筛选 + 网格/列表切换。
 * 激活态统一用近黑药丸，保持与全站一致；青柠只留给细节点缀。
 */
export default function ProductBrowser({
  products,
}: {
  products: Product[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [view, setView] = useState<ViewMode>("grid");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((p) => p.category === activeCategory),
    [products, activeCategory]
  );

  return (
    <div>
      {/* 工具栏：分类 + 视图切换 */}
      <div className="flex flex-col gap-6 border-b hairline pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`rounded-full px-4 py-1.5 text-xs capitalize tracking-wide transition-colors duration-200 ${
                activeCategory === c
                  ? "bg-ink-950 font-medium text-white"
                  : "border border-ink-900/15 text-ink-600 hover:border-ink-950 hover:text-ink-950"
              }`}
              aria-pressed={activeCategory === c}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {(
            [
              ["grid", "Grid"],
              ["list", "List"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`px-4 py-2 text-xs tracking-wide transition-colors duration-200 ${
                view === mode
                  ? "bg-ink-950 font-medium text-white"
                  : "text-ink-600 hover:bg-sand-100"
              }`}
              aria-pressed={view === mode}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="pt-8 text-xs tracking-[0.2em] text-ink-400">
        {filtered.length} {filtered.length === 1 ? "STYLE" : "STYLES"}
      </p>

      {/* 网格视图：等宽三列，与首页品类卡一致的秩序感 */}
      {view === "grid" ? (
        <div className="card-grid-3 mt-10">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        /* 列表视图 */
        <div className="mt-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} variant="list" />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm text-ink-400">
          No styles in this category yet.
        </p>
      ) : null}
    </div>
  );
}
