import Image from "next/image";

/**
 * 首页公司介绍带：珍珠白底 + 近黑字。
 *
 * 【2026-11-19 改版：从纯文字双栏改成带配图】
 * 客户反馈原来的「左叙述 / 右能力索引」太素、没有画面。现在的结构是：
 *   上半 左文右图 —— 结论（lead）→ 事实（正文）→ 证据（三个数字）走左栏，
 *        右侧一竖幅实拍配图，图下一行 caption 交代拍的是什么。
 *   下半 能力索引横排三列 —— 原来右侧竖排六条，每条 2xl/3xl 字号，
 *        把整块拉得很高，且与左侧文案抢注意力。改成三列网格后
 *        变成一条"索引带"，信息密度上来了，也给配图让出了空间。
 *
 * 【为什么能力清单用 gap-px + 背景色画线】
 * 三列网格里逐条加 border-b 会让最后一行多出一条线、且列间没有竖线。
 * grid + gap-1px + 容器底色 + 每格 bg-paper，画出来就是完整的网格，
 * 不用 nth-child 补丁。
 *
 * 【为什么配图不做成 4/5 竖构图】
 * 素材是 1.13 的近方图，人物在画面左侧三分之一。硬裁 4/5 会把人切掉半个身子。
 * 容器给 10/9，与源图只差 2%，几乎不裁。
 */
export default function WelcomeBand({
  eyebrow,
  lead,
  body,
  capabilities,
  stats,
  image,
}: {
  eyebrow: string;
  /** 一句话主张，字号最大的一行 */
  lead: string;
  /** 正文段落，逐段渲染 */
  body: readonly string[];
  /** 能力清单，横排网格 */
  capabilities: readonly string[];
  /** 左侧数据条 */
  stats: readonly { readonly label: string; readonly value: string }[];
  /** 配图 */
  image: {
    src: string;
    alt: string;
    /** 图下一行小字，说明画面拍的是什么 */
    caption?: string;
  };
}) {
  return (
    <section className="w-full bg-paper">
      <div className="container-site section-pad">
        {/* 上半：左文右图 */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-16">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="h-[3px] w-6 bg-accent-500" />
              {eyebrow}
            </p>

            {/* h1 已交给首屏，这里退回普通段落，保证全页只有一个 h1 */}
            <p className="mt-8 text-[24px] leading-[1.38] tracking-tight text-ink-950 md:text-[32px]">
              {lead}
            </p>

            <div className="mt-7 space-y-5">
              {body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="max-w-[34rem] text-[15px] leading-[1.85] text-ink-600"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 数据条：dt(标签) 在前保证语义，视觉上用 column-reverse 把数字放上面 */}
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink-900/12 pt-7">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-2.5 text-[11px] uppercase leading-snug tracking-[0.14em] text-ink-400">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl font-medium tracking-tight text-ink-950 md:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 右：配图 + caption */}
          <figure className="lg:pt-2">
            <div className="relative aspect-[10/9] w-full overflow-hidden bg-sand-100">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
            {image.caption ? (
              <figcaption className="mt-3 flex items-baseline gap-2.5 text-[11.5px] leading-relaxed text-ink-400">
                <span aria-hidden className="h-px w-4 shrink-0 translate-y-[-3px] bg-ink-900/25" />
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        </div>

        {/* 下半：能力索引横排三列 */}
        <div className="mt-14 md:mt-16">
          <p className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
            Capabilities
          </p>

          <ul className="mt-5 grid gap-px bg-ink-900/12 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item, index) => (
              <li
                key={item}
                className="group flex items-baseline gap-4 bg-paper py-5 pr-6 transition-colors duration-300 hover:bg-sand-50 lg:py-6"
              >
                <span className="w-5 shrink-0 text-[11px] tabular-nums tracking-[0.1em] text-ink-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[18px] font-medium leading-snug tracking-tight text-ink-950 md:text-[20px]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
