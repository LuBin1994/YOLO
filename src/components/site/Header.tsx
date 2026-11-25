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
 * 【到顶透明（2026-11-25 按客户要求恢复，仅限浅色首屏的路由 + 桌面端）】
 * 滚动条在顶部时 header 不铺底色、不描边、不模糊，让首屏画面直接顶到 y=0；
 * 滚过 8px 立刻变回珍珠白毛玻璃，保证长页面滚动时导航始终清晰可读。
 *
 * 【为什么不是全站、也不是全端】
 * 1) 只有首屏是**浅底**的页面才敢透明。内页里 /products（PageHero）、/factory
 *    （SplitHero bg-ink-950）、/sustainability（OffsetHero 顶部整幅照片）、
 *    /responsibility、/rnd（bg-accent-600）都是**从 y=0 就是深色影像**，
 *    棕红导航压上去对比度不到 2:1，等于看不见 —— 这些页必须保持实底。
 * 2) 移动端首页是 VideoMosaic 九宫格视频墙，顶部也是深色影像，
 *    所以透明只在 `md` 以上生效（用 md: 前缀），手机一律实底。
 * 3) 菜单展开时必须实底，否则下拉面板与导航条之间会断开。
 */
export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Esc 收起菜单 */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /* 到顶判定：阈值 8px，跟"滚一下就变实底"的手感对齐 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * 首屏是**纸底**、没有满幅影像压到 y=0 的路由，才允许到顶透明。
   * 新增页面时若首屏也是纸底，记得加进来；判断依据见顶部注释。
   */
  const lightTop =
    pathname === "/" ||
    pathname === "/contact" ||
    (pathname.startsWith("/products/") && pathname !== "/products");

  /** 桌面端 + 到顶 + 菜单收起 → 透明 */
  const seeThrough = lightTop && !scrolled && !menuOpen;

  /* 汉堡按钮的三条线：任何状态下都压在浅底上（透明时首页顶部也是纸底） */
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
      className={`fixed inset-x-0 top-0 z-50 border-b bg-paper/90 backdrop-blur-md transition-colors duration-300 border-ink-900/8 ${
        /* 透明只作用于 md 以上：手机首页首屏是深色视频墙，压不住 */
        seeThrough
          ? "md:border-transparent md:bg-transparent md:backdrop-blur-none"
          : ""
      }`}
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
