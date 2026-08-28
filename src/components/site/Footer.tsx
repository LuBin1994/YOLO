import Link from "next/link";
import { SITE } from "@/lib/site-data";

const FOOTER_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/factory", label: "Our Factory" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/responsibility", label: "Social Responsibility" },
];

/**
 * 页脚：品牌信息 + 导航 + 联系方式，细线分隔。
 */
export default function Footer() {
  return (
    <footer className="border-t hairline bg-sand-100/60">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-xl font-semibold tracking-tight text-ink-900">
              {SITE.name}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-600">
              {SITE.tagline}. Vertically integrated production with a
              commitment to sustainable materials and ethical manufacturing.
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
              Explore
            </p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-600 transition-colors hover:text-forest-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="transition-colors hover:text-forest-700"
                >
                  {SITE.email}
                </a>
              </li>
              <li>{SITE.phone}</li>
              <li className="leading-relaxed">{SITE.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t hairline pt-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>GOTS · Oeko-Tex · BSCI Certified Partners</p>
        </div>
      </div>
    </footer>
  );
}
