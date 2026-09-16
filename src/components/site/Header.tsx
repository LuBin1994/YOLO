"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/factory", label: "Factory" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/responsibility", label: "Responsibility" },
  { href: "/contact", label: "Contact" },
];

/**
 * 极简导航：Logo 左、导航右。
 * 滚动后叠加白色毛玻璃背景；首页首屏透明悬浮于 Hero 之上。
 * 当前项与 hover 用青柠细线滑入标示，制造轻量微交互。
 */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  /* 菜单展开时也铺底色，否则首屏透明 header 上的下拉面板会与 Hero 糊在一起 */
  const solid = scrolled || !isHome || menuOpen;
  /* 透明态只出现在首页首屏，此时 header 悬浮在深色大图上，文字必须反白 */
  const onImage = !solid;
  const barColor = onImage ? "bg-white" : "bg-ink-950";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-white/90 backdrop-blur-md border-b border-ink-900/5"
          : "bg-transparent"
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
                className={`group relative text-[13px] tracking-wide transition-colors duration-200 ${
                  onImage
                    ? active
                      ? "font-medium text-white"
                      : "text-white/70 hover:text-white"
                    : active
                      ? "font-medium text-ink-950"
                      : "text-ink-600 hover:text-ink-950"
                }`}
              >
                {link.label}
                {/* 青柠细线：当前项常驻，其余 hover 时滑入 */}
                <span
                  aria-hidden
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-volt-400 transition-[width] duration-300 ease-out ${
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
        className={`overflow-hidden bg-white/95 backdrop-blur-md transition-[max-height,opacity,visibility] duration-300 ease-out md:hidden ${
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
                    className={active ? "text-volt-500" : "text-ink-400"}
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
