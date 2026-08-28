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
 * 滚动后叠加毛玻璃背景；首页首屏透明悬浮于 Hero 之上。
 */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !isHome;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-sand-50/90 backdrop-blur-md border-b border-ink-900/5"
          : "bg-transparent"
      }`}
    >
      <div className="container-site flex h-16 md:h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-ink-900"
          aria-label="Meridian Apparel Group — Home"
        >
          <span className="text-lg md:text-xl font-semibold tracking-tight">
            Meridian
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.28em] text-forest-600">
            Apparel Group
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] tracking-wide transition-colors duration-200 ${
                pathname.startsWith(link.href)
                  ? "text-forest-700 font-medium"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="md:hidden text-[13px] font-medium text-forest-700"
        >
          Contact
        </Link>
      </div>
    </header>
  );
}
