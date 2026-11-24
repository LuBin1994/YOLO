"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/factory", label: "Factory" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/responsibility", label: "Responsibility" },
  { href: "/rnd", label: "R&D" },
  { href: "/contact", label: "Contact" },
];

/**
 * 极简导航：Logo 左、导航右。
 *
 * 【透明态（2026-10-23 恢复，2026-11-19 关闭）】
 * 首页第一屏曾是满幅视频墙，导航压在它上面、不占位：滚动条在顶部时完全透明
 * + 文字反白，滚过 8px 才变成珍珠白毛玻璃。可读性由影像侧的顶部压暗兜底。
 *
 * 2026-11-19 首页首屏换成白底杂志拼版（HeroEditorial），透明反白态失去意义：
 * 白字压白纸等于隐身。现在全站到顶即实底（bg-paper/90 + backdrop-blur），
 * 首页与内页导航表现一致，也更干净。
 */
export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  /* Esc 收起菜单 */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /* 2026-11-19：首页首屏换成白底杂志拼版，透明反白态关闭，全站到顶即实底。
     solid / onImage / scrolled 等透明态相关状态一并移除。 */
  const barColor = "bg-ink-950";

  /**
   * 当前项判定。
   *
   * 不能直接用 `pathname.startsWith(href)`：Home 的 href 是 "/"，
   * 而任何路径都以 "/" 开头 —— 那样 Home 会在**每一个页面**都高亮。
   * 根路径必须精确匹配，其余仍用前缀匹配（/products 高亮 /products/[slug]）。
   */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-ink-900/8 transition-colors duration-300"
    >
      <div className="container-site flex h-16 items-center justify-between md:h-20">
        {/* 品牌字标：2026-11-18 由文字改为客户提供的衬线字标 PNG。
            原图是白底棕红字，已抠成透明（public/logo-yolo-mark.png，
            578×159，颜色统一 #8A4139 + 逐像素 alpha）。

            【透明态必须反白】
            棕红 #8A4139 压在视频墙的暗部上只有约 2:1，等于看不见。
            brightness(0) 先把 RGB 压成黑（alpha 不动），invert 再翻成白 ——
            得到的是"白色字标 + 原始抗锯齿边缘"，比换一张白版 PNG 更准，
            也不用维护两份文件。
            尺寸走高度、宽度 auto：字标是 3.64:1 的横幅，给宽度会变形。 */}
        <Link
          href="/"
          className="flex items-center transition-opacity duration-300 hover:opacity-75"
          aria-label="YOLO APPAREL PTE. LTD. — back to homepage"
        >
          <Image
            src="/logo-yolo-mark.png"
            alt=""
            width={578}
            height={159}
            priority
            className="h-[26px] w-auto md:h-[34px]"
          />
        </Link>

        {/*
         * 桌面导航：2026-11-20 起改用品牌衬线（Playfair Display，font-serif），
         * 与左侧字标统一 —— 客户要求「导航文字用 logo 同款字体」。
         *
         * 【为什么是大写 + 11.5px 而不是原样的 15px】
         * 字标是高对比 Didone，发丝笔画在 12–15px 只有 0.5–1px，
         * 直接套 15px 混排会发灰、显得脏。改成大写成组 + 加字距，
         * 靠"整组排版"体现衬线气质，这是时装品牌页头的通用做法。
         *
         * 【为什么字号/字距分 lg 与 xl 两档】
         * 实测 7 项大写 + 0.14em 字距约 790px，而 `lg`(1024) 扣掉容器
         * 内边距与 124px 字标只剩约 850px 可用 —— 贴着边界。所以
         * lg 收成 11.5px / 0.10em / gap-4，xl 才放开到 12.5px / 0.14em。
         * 断点仍留在 lg：抬到 xl 会让 1024–1279 的笔记本掉成汉堡菜单。
         *
         * 【字重恒为 700】
         * 只载了 600/700 两档。当前项不再用 font-medium 区分（500 无字重会
         * 被合成或跳到 600，反而不稳），改用颜色 + 常驻下划线。
         *
         * 【颜色 = 字标色】（2026-11-20 客户要求）
         * 文字与下划线统一用 brand（#8a4139，逐像素取自 logo-yolo-mark.png），
         * 与左侧字标严格同色。当前项与普通项**不再分色**，靠"下划线常驻"
         * 区分；hover 只把文字压深到 brand-deep（同色相，对比度更高），
         * 保持可点的反馈，不引入第二种颜色。
         */}
        <nav className="hidden items-center gap-4 lg:flex xl:gap-7" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative font-serif text-[11.5px] font-bold uppercase tracking-[0.1em] text-brand transition-colors duration-200 hover:text-brand-deep xl:text-[12.5px] xl:tracking-[0.14em]`}
              >
                {link.label}
                {/* 下划线：当前项常驻，其余 hover 时滑入；颜色与文字、字标一致 */}
                <span
                  aria-hidden
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-brand transition-[width] duration-300 ease-out ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* 移动端菜单按钮：三条线 → X */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="-mr-2 flex h-10 w-10 items-center justify-center lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <span className="relative block h-4 w-6" aria-hidden>
            <span
              className={`absolute left-0 top-0 block h-[1.5px] w-6 ${barColor} transition-transform duration-300 ease-out ${
                menuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] block h-[1.5px] w-6 ${barColor} transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] block h-[1.5px] w-6 ${barColor} transition-transform duration-300 ease-out ${
                menuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* 移动端竖向下拉面板 */}
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={`overflow-hidden bg-paper/95 backdrop-blur-md transition-[max-height,opacity,visibility] duration-300 ease-out lg:hidden ${
          menuOpen
            ? "visible max-h-[30rem] opacity-100"
            : "invisible max-h-0 opacity-0"
        }`}
      >
        <ul className="container-site flex flex-col">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href} className="border-b hairline last:border-b-0">
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between py-4 font-serif text-[15px] font-bold uppercase tracking-[0.12em] text-brand transition-colors duration-200 hover:text-brand-deep`}
                >
                  {link.label}
                  {/* 箭头强制用无衬线：Playfair 不含箭头字形，
                      混进衬线回退链可能掉成豆腐块 */}
                  <span
                    aria-hidden
                    className={`font-sans ${active ? "text-brand" : "text-ink-400"}`}
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
