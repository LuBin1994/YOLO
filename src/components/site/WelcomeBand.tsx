/**
 * 首页公司介绍带：珍珠白底 + 近黑字。
 *
 * 排版意图：整体是「左叙述 / 右索引」的编辑式双栏，不靠字号堆张力。
 * - 左栏窄：小标 → 一句话主张（大一号）→ 两段正文 → 三个关键数字。
 *   顺序是「结论 → 事实 → 证据」，读者扫一眼就知道我们是谁、多大体量。
 * - 右栏宽：能力清单改成「编号 + 细线」的索引列表。
 *   用列表的秩序感代替原来那块大号排印——那个做法在小屏上会碎成
 *   一堆断行，且和下面的板块抢注意力。
 *
 * 原组件名叫 DarkBand（近黑底），现在底色已改为珍珠白，名字会误导，
 * 因此一并改名为 WelcomeBand。
 */
export default function WelcomeBand({
  eyebrow,
  lead,
  body,
  capabilities,
  stats,
}: {
  eyebrow: string;
  /** 一句话主张，字号最大的一行 */
  lead: string;
  /** 正文段落，逐段渲染 */
  body: readonly string[];
  /** 右侧能力索引 */
  capabilities: readonly string[];
  /** 左栏数据条 */
  stats: readonly { readonly label: string; readonly value: string }[];
}) {
  return (
    <section className="w-full bg-paper">
      <div className="container-site section-pad">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          {/* 左：结论 → 事实 → 证据 */}
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden className="h-[3px] w-6 bg-accent-500" />
              {eyebrow}
            </p>

            {/* h1 已交给首屏视频墙正中的主介绍（VideoMosaic 的 IntroTile），
                这里退回普通段落，保证全页只有一个 h1。 */}
            <p className="mt-9 text-2xl leading-[1.42] tracking-tight text-ink-950 md:text-[28px]">
              {lead}
            </p>

            <div className="mt-8 space-y-5">
              {body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-base leading-[1.85] text-ink-600"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* 数据条：dt(标签) 在前保证语义，视觉上用 column-reverse 把数字放上面 */}
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-ink-900/12 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="mt-2.5 text-[11px] uppercase tracking-[0.14em] text-ink-400">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl font-medium tracking-tight text-ink-950 md:text-4xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* 右：能力索引 */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink-400">
              Capabilities
            </p>
            <ul className="mt-6 border-t border-ink-900/12">
              {capabilities.map((item, index) => (
                <li
                  key={item}
                  className="group flex items-baseline gap-5 border-b border-ink-900/12 py-5 md:py-6"
                >
                  <span className="w-6 shrink-0 text-[11px] tabular-nums tracking-[0.1em] text-ink-400 transition-colors duration-300 group-hover:text-ink-950">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-2xl font-medium tracking-tight text-ink-950 md:text-3xl">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
