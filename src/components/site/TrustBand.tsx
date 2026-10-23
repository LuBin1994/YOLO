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
 */

/**
 * 认证标识的视觉权重。
 *
 * 这是**人工调过的视觉权重，不是原图尺寸**：GOTS / WRAP / GRS 这类买家
 * 最认的标志给到 80 上下，辅助性标准压到 46 上下。
 * 新增认证时补一个值，缺省 50。
 *
 * 【为什么不能整体缩小】
 * 试过整体 ×0.68：省下的高度有限（真正占地方的是 section padding 和
 * 重复的区块头），但贴图墙立刻散掉——列间空隙变大、标识缩成小图标，
 * 读起来像一份"清单"而不是"墙"。要省的从来不是标识尺寸。
 */
const CERT_SIZE: Record<string, number> = {
  GOTS: 84,
  "OEKO-TEX®": 62,
  BCI: 56,
  "OCS 100": 50,
  "OCS Blended": 50,

  RWS: 66,
  RMS: 58,
  RAS: 58,
  "Good Cashmere": 52,
  ICCAW: 50,
  "SYS Group": 50,

  GRS: 76,
  "RCS 100": 50,
  "RCS Blended": 50,
  "Higg Index": 64,
  ICS: 50,

  "amfori BSCI": 54,
  SMETA: 58,
  WRAP: 80,
  "TÜV SÜD": 52,
  "ISO 14001": 50,
};

/** 四列的起始下沉量（仅 lg 以上），让列的横向基线错开 */
const CERT_OFFSET = ["lg:pt-0", "lg:pt-4", "lg:pt-1.5", "lg:pt-6"];

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
                  <dt className="mt-2 text-[10px] uppercase tracking-[0.16em] text-ink-400">
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
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-600">
              {GLOBAL_FOOTPRINT.eyebrow}
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
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

            {/* 信息层：地图上虽然每个点都能悬停出一张卡片，但那是"补充"。
                清单才是主载体——B2B 访客不会去地图上探索，几个国家、
                什么角色必须能一眼扫完，而且不依赖 hover 也能拿到全量信息。 */}
            <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-ink-900/12 pt-7 sm:grid-cols-4 lg:gap-x-10">
              {groups.map((group) => (
                <div key={group.role}>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-ink-400">
                    {group.label}
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {group.items.map((office) => (
                      <li key={`${group.role}-${office.id}`}>
                        <p className="text-sm font-medium leading-snug tracking-tight text-ink-950">
                          {office.name}
                        </p>
                        {office.note ? (
                          <p className="mt-0.5 text-[11px] leading-snug text-ink-600">
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
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-600">
                {CERTIFICATION_WALL.eyebrow}
              </p>
              <p className="text-[11px] leading-relaxed text-ink-400 sm:text-right">
                {CERTIFICATION_WALL.note}
              </p>
            </div>
          </Reveal>

          {/* 仍然不做成规整表格：大小不一、行不对齐、不画格子。
              这三件事才是"贴图墙"和一页规格表的区别。 */}
          <div className="mx-auto mt-8 w-full max-w-[1000px]">
            <div className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-4">
              {CERTIFICATION_WALL.groups.map((group, columnIndex) => (
                <div
                  key={group.label}
                  className={`flex flex-col items-center ${
                    CERT_OFFSET[columnIndex] ?? "lg:pt-0"
                  }`}
                >
                  {/* 原来这里有个 4px 的强调色小圆点。换成森林绿之后，
                      这么小的深色点在珍珠白上等于消失，留着只是噪声，索性去掉；
                      分组靠小字本身和上方的留白区分就够了。 */}
                  <p className="mb-4 self-start text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
                    {group.label}
                  </p>

                  <ul className="flex w-full flex-col items-center gap-3.5">
                    {group.items.map((item) => (
                      <li key={item.name} className="flex justify-center">
                        {item.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.logo}
                            alt={item.name}
                            title={item.note ?? item.name}
                            loading="lazy"
                            style={{ height: `${CERT_SIZE[item.name] ?? 40}px` }}
                            className="w-auto max-w-full object-contain"
                          />
                        ) : (
                          <p className="text-xs font-medium tracking-tight text-ink-950">
                            {item.name}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
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
