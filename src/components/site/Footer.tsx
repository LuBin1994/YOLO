import Link from "next/link";
import { SITE } from "@/lib/site-data";

const FOOTER_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/factory", label: "Our Factory" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/responsibility", label: "Social Responsibility" },
];

/**
 * 页脚：品牌信息 + 导航 + 联系方式。
 * 保持浅底（首页末尾已是近黑 CTA 带，页脚再压黑会连成一片），
 * 靠超大字号品牌字标收尾。
 */
export default function Footer() {
  return (
    <footer className="border-t hairline bg-sand-50">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-xl font-medium tracking-tight text-ink-950">
              {SITE.name}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-600">
              {SITE.tagline}. Vertically integrated production with a
              commitment to sustainable materials and ethical manufacturing.
            </p>
          </div>

          <div>
            <p className="eyebrow">Explore</p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-600 underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:text-ink-950 hover:decoration-volt-500"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:text-ink-950 hover:decoration-volt-500"
                >
                  {SITE.email}
                </a>
              </li>
              <li>{SITE.phone}</li>
              <li className="leading-relaxed">{SITE.address}</li>
            </ul>
          </div>
        </div>

        {/* 品牌字标：超大排印收尾，制造记忆点 */}
        <p
          className="mt-16 select-none text-[13vw] font-medium leading-[0.85] tracking-[-0.04em] text-ink-950/10 md:text-[9vw]"
          aria-hidden
        >
          YOLO APPAREL
        </p>

        <div className="mt-10 flex flex-col gap-2 border-t hairline pt-8 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>GOTS · Oeko-Tex · BSCI Certified Partners</p>
        </div>
      </div>
    </footer>
  );
}
