import Link from "next/link";
import { CERT_HIGHLIGHTS, SITE } from "@/lib/site-data";

const FOOTER_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/factory", label: "Our Factory" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/responsibility", label: "Social Responsibility" },
  { href: "/rnd", label: "R&D" },
];

/**
 * 页脚：品牌信息 + 导航 + 联系方式。
 *
 * 【2026-11-18 由浅底改为主题绿底 + 白字（客户指定）】
 * 原设计是浅底，理由是"首页末尾不能和深色块连成一片"。现在改用
 * accent-600 #3F5345 —— 它足够深，能压白字；又比页脚上方的米白
 * ContactSection 明显低一档，所以页脚是"落地"而不是"再接一块深色带"。
 *
 * 【为什么用 accent-600 而不是 accent-500】
 * 深底上的文字层级只能靠白色透明度做，而透明度一降对比就掉。实测：
 *   accent-600 上 white/100 = 8.29、/80 = 6.04、/70 = 5.03  ← 三档全过 AA
 *   accent-500 上 white/100 = 5.89、/80 = 4.47（已不足）        ← 只剩两档
 * 用 accent-500 的话，"强/中/弱"三级层次里最弱那级必然不合格，
 * 只能全站一个亮度，页脚会糊成一片。
 *
 * 【注意 .eyebrow 不能用】
 * 它在 globals.css 里是不带 layer 的普通类，优先级高于 Tailwind 的
 * utilities 层，`text-white/70` 这类覆盖不上去，字会仍然是 ink-400。
 * 所以这里的两个小标签手写全套样式。
 */
export default function Footer() {
  return (
    <footer className="bg-accent-600 text-white">
      <div className="container-site py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="text-xl font-medium tracking-tight text-white">
              {SITE.name}
            </p>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80">
              {SITE.tagline}. Vertically integrated production with a
              commitment to sustainable materials and ethical manufacturing.
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-white/70">
              Explore
            </p>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[15px] text-white/80 underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:text-white hover:decoration-white/50"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-white/70">
              Contact
            </p>
            <ul className="mt-4 space-y-3 text-[15px] text-white/80">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:text-white hover:decoration-white/50"
                >
                  {SITE.email}
                </a>
              </li>
              <li>{SITE.phone}</li>
              <li className="leading-relaxed">{SITE.address}</li>
            </ul>
          </div>
        </div>

        {/* 品牌字标：超大排印收尾，制造记忆点。
            绿底上用的是 white/10 —— 低到只剩轮廓，不抢内容。 */}
        <p
          className="mt-16 select-none text-[13vw] font-medium leading-[0.85] tracking-[-0.04em] text-white/10 md:text-[9vw]"
          aria-hidden
        >
          YOLO APPAREL
        </p>

        {/* 分隔线跟着文字走：深底上 hairline（ink-900/10）几乎不可见，
            改用白色 15% 才有"一条线"的读感。 */}
        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-8 text-[13px] text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {/* SITE.name 自带句点（PTE. LTD.），这里不能再补 "."，否则双句点 */}
            © {new Date().getFullYear()} {SITE.name} All rights reserved.
          </p>
          <p>{CERT_HIGHLIGHTS.join(" · ")}</p>
        </div>
      </div>
    </footer>
  );
}
