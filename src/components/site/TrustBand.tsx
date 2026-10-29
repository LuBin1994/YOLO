import Reveal from "./Reveal";
import WorldMap from "./WorldMap";
import {
  CERTIFICATION_WALL,
  GLOBAL_FOOTPRINT,
  GLOBAL_OFFICES,
  OFFICE_GROUPS,
  PARTNER_BRANDS,
} from "@/lib/site-data";

/**
 * 首页信任带：全球布局 + 认证，合成**一个**区块。
 * （合作品牌 2026-10-22 起独立成 GlobalBrands，见该组件顶部注释。）
 *
 * 【为什么要合】
 * 三块原先各自是一个独立 section：三段 section-pad（上下各 128px）、
 * 三个「小标 + display-lg 标题 + 网格」的同构头部、约 2800px 总高。
 * （现剩两块：全球布局 + 认证。）
 * 读者滚到这里会连续遇到三次"又开始一个板块"，是滚动疲劳的主因。
 * 合并后共用一次上下留白和一个头部，总高降到约 1700px，信息一点没少。
 *
 * 【为什么头部不放 display-lg】
 * 全站只保留一个真正的"大"——首屏主张（见 VideoMosaic 的说明带）。其余区块标题一律
 * 用 display-md 或更小，靠落差而不是靠堆字号制造层次。
 *
 * 【地图为什么不再压清单】
 * 原先清单绝对定位在地图左下角，是为了在"整屏地图"里省高度。现在地图
 * 只占 8 列、旁边就是清单，遮挡关系不存在了，也就没有理由再用浮层。
 * 浮层还会挡住南美西岸——那是最容易被误读成"没画完"的一块。
 *
 * 【地图版式：2026-10-29 改为技术图纸】
 * 地图本体自带细边框、经纬刻度、左下角读数条和一行图脚（投影 / 站点编号）。
 * 因此这一层**不再加第二个框**，标题行也不再补边框——否则会出现
 * "标题下一条线 + 地图框上一条线"的双线，在 paper 底上很扎眼。
 */


/* 品牌标识的尺寸表（BRAND_WIDTH / BRAND_FIXED_HEIGHT）已随品牌墙一起
   搬到 GlobalBrands.tsx（2026-10-22）。 */

export default function TrustBand() {
  const groups = OFFICE_GROUPS.map((group) => ({
    ...group,
    items: GLOBAL_OFFICES.filter((office) => office.roles.includes(group.role)),
  }));

  const certCount = CERTIFICATION_WALL.groups.reduce(
    (total, group) => total + group.items.length,
    0
  );

  const numbers = [
    { value: String(GLOBAL_OFFICES.length), label: "Sites" },
    { value: String(certCount), label: "Certifications" },
    { value: String(PARTNER_BRANDS.length), label: "Brands served" },
  ];

  /* 区块底色：2026-10-22 起由 sand-50 改为 paper，首页各区块统一 #f8f6f0，
     不再靠深浅交替划分板块（页脚仍保留 sand-50 作区隔）。 */
  return (
    <section className="w-full bg-paper">
      <div className="container-site py-20 md:py-28">
        {/* ---------- 头部：一句总纲 + 三个数字 ---------- */}
        <Reveal>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="max-w-2xl">
              <p className="eyebrow flex items-center gap-3">
                <span aria-hidden className="h-[3px] w-6 bg-accent-500" />
                Proof
              </p>
              <h2 className="display-md mt-5">
                Where we make, what we are audited on, who we make for.
              </h2>
            </div>

            {/* 三个数字先给结论，下面的三块只是把结论展开 */}
            <dl className="grid shrink-0 grid-cols-3 gap-6 sm:gap-10">
              {numbers.map((item) => (
                <div key={item.label} className="flex flex-col-reverse">
                  <dt className="mt-2 text-[11px] uppercase tracking-[0.16em] text-ink-400">
                    {item.label}
                  </dt>
                  <dd className="text-3xl font-medium tabular-nums tracking-tight text-ink-950 md:text-4xl">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* ---------- 一、地图 + 站点清单 ---------- */}
        <Reveal className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink-900/12 pb-3">
            <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-ink-600">
              {GLOBAL_FOOTPRINT.eyebrow}
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
              {GLOBAL_FOOTPRINT.summary}
            </p>
          </div>

          {/* 地图吃满容器宽度，清单排在它**下方**一排。
              试过把清单绝对定位压在地图左下（南太平洋那块空白）：地图只有
              8 列宽时那是纯水面，压得住；吃满宽度之后，南美与南极的点阵跟着
              变大，清单一压上去就糊在圆点里，可读性反而比另起一排更差。
              现在的取舍是「地图完整、清单整齐」，多花约 100px 高度。 */}
          <div className="mt-6">
            <WorldMap offices={GLOBAL_OFFICES} />

            {/* 信息层：地图上每个点都能悬停出左下角读数条，但那是"补充"。
                清单才是主载体——B2B 访客不会去地图上探索，几个国家、
                什么角色必须能一眼扫完，而且不依赖 hover 也能拿到全量信息。 */}
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-ink-900/12 pt-7 sm:grid-cols-4 lg:gap-x-10">
              {groups.map((group) => (
                <div key={group.role}>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink-400">
                    {group.label}
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {group.items.map((office) => (
                      <li key={`${group.role}-${office.id}`}>
                        <p className="text-[15px] font-medium leading-snug tracking-tight text-ink-950">
                          {office.name}
                        </p>
                        {office.note ? (
                          <p className="mt-0.5 text-[12px] leading-snug text-ink-600">
                            {office.note}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------- 二、认证 ---------- */}
        <div className="mt-16 border-t border-ink-900/12 pt-10">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-ink-600">
                {CERTIFICATION_WALL.eyebrow}
              </p>
              <p className="text-[12px] leading-relaxed text-ink-400 sm:text-right">
                {CERTIFICATION_WALL.note}
              </p>
            </div>
          </Reveal>

          {/* 认证条（2026-10-27）：一排无限左滚，悬停/聚焦暂停。
              - 内容重复两遍 + 位移 -50% 是无缝循环的常规做法；
              - 第二遍 aria-hidden，读屏不会把 20 个认证念 40 遍；
              - 卡片尺寸写在 globals.css 的 .cert-card 里，不用任意值 utility：
                任意值类靠 Tailwind 扫描生成，dev 偶发漏编译时卡片宽度会退回
                min-content，被 logo 的宽高比撑开（方形标变窄、OEKO-TEX 变一条）。 */}
          <div className="mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
            <ul className="cert-marquee flex w-max animate-[marquee-left_80s_linear_infinite] gap-3">
              {(() => {
                const items = CERTIFICATION_WALL.groups.flatMap((g) => g.items);
                return [...items, ...items].map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    aria-hidden={index >= items.length}
                    className="cert-card group flex shrink-0 flex-col items-center rounded-[10px] border border-ink-900/10 bg-white px-3 pb-3.5 pt-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-ink-900/25"
                  >
                    <div className="cert-card-logo flex w-full items-center justify-center">
                      {item.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.logo}
                          alt={item.name}
                          title={item.note ?? item.name}
                          /* fetchPriority="low" 不能删：React 19 会给所有不带
                             loading="lazy"、也不是 fetchPriority="low" 的 <img>
                             自动插 <link rel="preload" as="image">。这块在页面中部，
                             20 张 PNG 一起进 preload 会跟首屏 video poster 抢带宽。
                             这里不用 loading="lazy"——认证条是横向无限滚动的，
                             lazy 会让滚出视口的卡片延迟加载，跑马灯里出现空白卡。 */
                          fetchPriority="low"
                          decoding="async"
                          className="max-h-full w-auto max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[15px] font-medium tracking-tight text-ink-950">
                          {item.name}
                        </span>
                      )}
                    </div>

                    <p className="mt-auto flex min-h-[2.6em] items-end text-center text-[11px] uppercase leading-[1.55] tracking-[0.11em] text-ink-500">
                      {item.note ?? item.name}
                    </p>
                  </li>
                ));
              })()}
            </ul>
          </div>
        </div>

        {/*
          ---------- 三、合作品牌 ----------
          2026-10-22 起移出本区块，成为独立的 `GlobalBrands`（整屏黑底 +
          左文案右标识墙）。原来裸排在珍珠白上的那版，和客户给的目标版式
          （黑底、左栏说明、四列标识）完全是两回事，塞在白色容器里做不出。
          PARTNER_BRANDS 仍留在上方数字里统计 "Brands served"。
        */}
      </div>
    </section>
  );
}
