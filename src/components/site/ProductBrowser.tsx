"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/supabase/types";
import {
  activeSlugOf,
  buildFilterRows,
  createCategoryIndex,
  selectAtPath,
  type Category,
} from "@/lib/categories";
import ProductCard from "./ProductCard";

type ViewMode = "grid" | "list";

/**
 * 产品浏览区：任意层级分类筛选 + 网格/列表切换，筛选栏滚动时吸顶。
 *
 * 【2026-11-06 分类完全取后台真实数据】
 * 之前有两个"看起来正常但其实是假"的行为：读库失败退回写死的 FALLBACK_CATEGORIES、
 * 以及把"没有产品的分类"裁掉（后台新建的 KNIT / PANTS 系列因此一直不显示）。
 * 现在分类只有 `yolo.categories` 一个来源，后台维护了什么就显示什么。
 *
 * 【层级不写死】
 * 用 `path: string[]` 表达"第 0 行选了谁、第 1 行选了谁…"，
 * `buildFilterRows()` 按选中的节点动态往下展开新的一行，后台建到几级就出几行。
 * 筛选命中用 `isUnder`（祖先链，含子孙），商品挂任意一级都成立。
 *
 * 【为什么点筛选要主动滚回筛选栏】
 * sticky 只在**父容器**范围内有效。用户滚到列表深处点一个筛选项后，结果数量骤减、
 * 页面变矮，浏览器会把滚动位置钳到新的最大值 —— 表现就是"跑到页面最底部"，
 * 而筛选栏随变矮的父容器一起滚出视口，点完反而看不见自己点了什么。
 * 所以在每次筛选后（DOM 已更新）把筛选栏重新顶到 Header 下沿，
 * 并给结果容器 `overflow-anchor: none`，关掉浏览器的 scroll anchoring 抢戏。
 *
 * 【吸顶参数】Header 是 `fixed z-50`、高 h-16(64px)/md:h-20(80px)，
 * 所以 `sticky top-16 z-40 bg-paper md:top-20`；z 用 40 压内容不压导航，
 * 白底不能省（卡片会从下面滚过去）。
 */
export default function ProductBrowser({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [path, setPath] = useState<string[]>(["all"]);
  const [view, setView] = useState<ViewMode>("grid");
  /**
   * 普通文档流里的零高度锚点。
   * 不能用 sticky 元素自己算位置：它被吸顶时 getBoundingClientRect().top
   * 恒等于 headerH，算出来的目标就是当前 scrollY，等于没滚 —— 会把用户
   * 留在"结果列表的中段"。锚点不参与 sticky，始终反映筛选区的真实文档位置。
   */
  const anchorRef = useRef<HTMLDivElement>(null);
  /** 只有点筛选项才触发回滚；首次渲染 / 切 Grid-List 不滚 */
  const needScroll = useRef(false);

  const index = useMemo(() => createCategoryIndex(categories), [categories]);
  const rows = useMemo(() => buildFilterRows(index, path), [index, path]);
  const activeSlug = activeSlugOf(path);

  const filtered = useMemo(
    () =>
      activeSlug === "all"
        ? products
        : products.filter((p) => index.isUnder(p.category, activeSlug)),
    [products, index, activeSlug]
  );

  /** 某一行 "All" 的计数 = 它上一级所选节点的全部子孙商品数 */
  function allCount(level: number): number {
    const parent = level === 0 ? "all" : path[level - 1];
    if (!parent || parent === "all") return level === 0 ? products.length : 0;
    return products.filter((p) => index.isUnder(p.category, parent)).length;
  }

  function selectAt(level: number, slug: string) {
    needScroll.current = true;
    setPath((prev) => selectAtPath(prev, level, slug));
  }

  /**
   * 筛选后把「结果区起点」顶回 Header 下沿，让用户从第一件商品开始看。
   *
   * 用 useEffect：DOM 已提交、结果数已变，此时读到的锚点位置和页面高度都是
   * "变矮之后"的真实值，算出的绝对目标才准（用 useLayoutEffect 在 SSR 下还会告警）。
   * 同时结果容器关掉了 overflow-anchor，浏览器不会在我们滚动时又自己校正一次。
   */
  useEffect(() => {
    if (!needScroll.current) return;
    needScroll.current = false;

    const anchor = anchorRef.current;
    if (!anchor) return;

    const headerH =
      document.querySelector("header")?.getBoundingClientRect().height ?? 64;
    const target = Math.max(
      0,
      window.scrollY + anchor.getBoundingClientRect().top - headerH
    );
    if (Math.abs(target - window.scrollY) < 6) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: target, behavior: reduceMotion ? "auto" : "smooth" });
  }, [path]);

  const tabRow = rows.find((r) => r.level === 0);
  const deeperRows = rows.filter((r) => r.level > 0);

  return (
    <div>
      {/* 普通流锚点：给上面的回滚计算一个不受 sticky 钳制的位置 */}
      <div ref={anchorRef} aria-hidden className="h-0" />

      {/* 吸顶筛选栏：一级 tab + 任意深度的下级行，整块固定 */}
      <div className="sticky top-16 z-40 border-b hairline bg-paper md:top-20">
        <div className="flex flex-col gap-5 py-5 md:flex-row md:items-center md:justify-between">
          {/* 一级分类：手机端横向滚动成一行，避免吸顶栏被撑高 */}
          <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 py-1 md:flex-wrap md:overflow-visible md:py-0">
            <Pill
              label="All"
              active={(path[0] ?? "all") === "all"}
              onClick={() => selectAt(0, "all")}
            />
            {(tabRow?.options ?? []).map((node) => (
              <Pill
                key={node.id}
                label={node.name_en}
                active={path[0] === node.slug}
                onClick={() => selectAt(0, node.slug)}
              />
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
                className={`px-4 py-2 text-[13px] tracking-wide transition-colors duration-200 ${
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

        {/* 二级 / 三级 / …：选中了上级且它确实有子级才会出现 */}
        {deeperRows.map((row) => (
          <div
            key={row.level}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t hairline py-4"
            aria-label={`Level ${row.level + 1} categories`}
          >
            <Chip
              label="All"
              count={allCount(row.level)}
              active={(path[row.level] ?? "all") === "all"}
              onClick={() => selectAt(row.level, "all")}
            />
            {row.options.map((node) => (
              <Chip
                key={node.id}
                label={node.name_en}
                count={products.filter((p) => index.isUnder(p.category, node.slug)).length}
                active={path[row.level] === node.slug}
                onClick={() => selectAt(row.level, node.slug)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* overflow-anchor: none 关掉浏览器的滚动锚定，别和上面的主动回滚打架 */}
      <div className="[overflow-anchor:none]">
        <p className="pt-7 text-[13px] tracking-[0.2em] text-ink-400">
          {filtered.length} {filtered.length === 1 ? "STYLE" : "STYLES"}
        </p>

        {view === "grid" ? (
          <div className="card-grid-3 mt-10">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} categories={categories} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                variant="list"
                categories={categories}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="py-24 text-center text-[15px] text-ink-400">
            No styles in this category yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** 一级：圆角胶囊 */
function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] tracking-wide transition-colors duration-200 ${
        active
          ? "bg-ink-950 font-medium text-white"
          : "border border-ink-900/15 text-ink-600 hover:border-ink-950 hover:text-ink-950"
      }`}
    >
      {label}
    </button>
  );
}

/** 下级：文字 + 计数 + 3px 下划线 */
function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative text-[13px] tracking-wide transition-colors duration-200 ${
        active ? "font-medium text-ink-950" : "text-ink-600 hover:text-ink-950"
      }`}
    >
      {label}
      <span className="ml-1.5 text-[11px] tabular-nums text-ink-400">{count}</span>
      <span
        aria-hidden
        className={`absolute -bottom-1 left-0 h-[2px] bg-accent-500 transition-[width] duration-300 ease-out ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </button>
  );
}
