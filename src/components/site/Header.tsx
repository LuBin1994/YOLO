"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
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
 * 【透明态（2026-10-23 恢复）】
 * 首页第一屏是满幅视频墙，导航压在它上面、不占位：滚动条在顶部时完全透明
 * + 文字反白，滚过 8px 才变成珍珠白毛玻璃。可读性由**影像侧的顶部压暗**
 * 兜底（VideoMosaic 顶部那道 scrim），不给导航加实底——
 * 加了实底首屏就不再是满幅沉浸的。内页保持实底（PageHero 自带 pt-24）。
 *
 * 注意：透明态要求首屏的影像必须铺到 y=0。若哪天视频墙又改成"从纸底起头"，
 * 白字就会压在纸上读不出来，必须同步改这里。
 */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Esc 收起菜单 */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /* 只有「首页 + 到顶 + 菜单未展开」才是透明态 */
  const solid = scrolled || !isHome || menuOpen;
  const onImage = !solid;
  const barColor = onImage ? "bg-white" : "bg-ink-950";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-paper/90 backdrop-blur-md border-b border-ink-900/8"
          : "border-b border-transparent bg-transparent text-on-image"
      }`}
    >
      <div className="container-site flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          className={`flex items-baseline gap-2 transition-colors duration-300 ${
            onImage ? "text-white" : "text-ink-950"
          }`}
          aria-label="YOLO APPAREL PTE. LTD. — Home"
        >
          <span className="text-lg font-medium tracking-tight md:text-xl">
            YOLO APPAREL PTE. LTD.
          </span>
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`group relative text-[15px] tracking-wide transition-colors duration-200 ${
                  onImage
                    ? active
                      ? "font-medium text-white"
                      : "text-white/75 hover:text-white"
                    : active
                      ? "font-medium text-ink-950"
                      : "text-ink-600 hover:text-ink-950"
                }`}
              >
                {link.label}
                {/* 下划线：当前项常驻，其余 hover 时滑入。
                    透明态压在影像上，强调色会沉进暗部，所以那一段改用白色。 */}
                <span
                  aria-hidden
                  className={`absolute -bottom-1.5 left-0 h-[2px] transition-[width] duration-300 ease-out ${
                    onImage ? "bg-white/80" : "bg-accent-500"
                  } ${active ? "w-full" : "w-0 group-hover:w-full"}`}
                />
              </Link>
            );
          })}
        </nav>

        {/* 移动端菜单按钮：三条线 → X */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="-mr-2 flex h-10 w-10 items-center justify-center md:hidden"
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
        className={`overflow-hidden bg-paper/95 backdrop-blur-md transition-[max-height,opacity,visibility] duration-300 ease-out md:hidden ${
          menuOpen
            ? "visible max-h-[24rem] opacity-100"
            : "invisible max-h-0 opacity-0"
        }`}
      >
        <ul className="container-site flex flex-col">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href} className="border-b hairline last:border-b-0">
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between py-4 text-base tracking-wide transition-colors duration-200 ${
                    active ? "font-medium text-ink-950" : "text-ink-600"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={active ? "text-accent-500" : "text-ink-400"}
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
