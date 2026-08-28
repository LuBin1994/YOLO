"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/supabase/types";
import ProductCard from "./ProductCard";

type ViewMode = "grid" | "list";

/**
 * 产品浏览区：分类筛选 + 网格/列表切换。
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
        <div className="flex flex-wrap gap-x-7 gap-y-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`text-sm capitalize transition-colors ${
                activeCategory === c
                  ? "text-forest-700 font-medium"
                  : "text-ink-400 hover:text-ink-900"
              }`}
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
              className={`px-4 py-2 text-xs tracking-wide transition-colors ${
                view === mode
                  ? "bg-forest-700 text-sand-50"
                  : "text-ink-600 hover:bg-forest-700/10"
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

      {/* 网格视图 */}
      {view === "grid" ? (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
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
