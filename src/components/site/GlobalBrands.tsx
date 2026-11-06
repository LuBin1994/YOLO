import Link from "next/link";
import Reveal from "./Reveal";
import { PARTNERS_INTRO, PARTNER_BRANDS } from "@/lib/site-data";

/**
 * 合作品牌墙（2026-11-05 第四次改版：标识从 15 个增到 28 个）。
 *
 * 【这一版只换了内容，没动骨架】
 * 客户 2026-11-05 把「品牌」文件夹重组成 1/2/3/4 四个子目录，标识从 15 个变 28 个，
 * 要求「按目录名字的顺序排」「原来的 logo 去掉」。所以左黑右白 + 斜切分界原样保留，
 * 只改了标识数据、格子列数（5 列 → 4 列）和配平基准。
 *
 * 【为什么是"左黑右白"】
 * 上一版整块纸底，把黑底重音彻底丢了 —— 黑底原本是"证据区"末尾唯一的深色落点。
 * 但黑底又不能铺满：客户给的 28 个标识里绝大多数是黑墨（Max&Co. / Zara / Nike /
 * Jordan / Converse / Under Armour / Wrangler / Lacoste …），黑标放黑底等于消失。
 * 左黑右白正好同时满足：黑块只承载文案（不需要底色衬标识），
 * 白底才是标识的衬底（也是彩色标最准的底色）。
 *
 * 【斜切为什么成立】
 * 上宽下窄（35% → 28%），黑块读起来像书脊的裁切边，有收束感；反过来头重脚轻。
 * 实测这个斜度只吃掉 3% 的平均宽度（平均 31.5% vs 垂直版的 31%），
 * 也就是**斜线几乎是白拿的**。真正的代价在下面那条。
 *
 * 【代价：网格线必须去掉】
 * 斜线和等距网格是两种语言 —— 斜边压过去会把第一列的竖线一截一截切断，
 * 看着像没画完。所以这一版没有网格线、也没有序号，靠标识自身的间距成行。
 * 这是"斜线的动势"换"网格的秩序"，二选一。
 *
 * 【响应式：小屏退化成水平分割】
 * 390px 宽、一千多高，同样的百分比斜度会变成接近 60° 的陡坡，非常难看。
 * 所以 `lg` 以下不用斜切，直接黑在上、白在下；黑块靠 `-mx` 出血到屏幕两侧。
 *
 * 【为什么是 4 列 7 行】
 * 28 = 4×7 正好整除，不留空格（5 列会剩 3 个尾巴，6 列会剩 4 个）。
 * 更关键的是宽度：五列时每格内容只有 147px，而 iBlues（7.6:1）、Pennyblack（12.6:1）
 * 这类超长字标要拿到 188px 才够配平重量，否则被压成一条细线。
 * 四列每格 204px（内容 188px），刚好等于配平基准，LAYOUT_SCALE 因此是 1。
 */
const BRAND_HEIGHT: Record<string, number> = {
  "Max&Co.": 26,
  "Weekend MaxMara": 47,
  "U.S. Polo Assn.": 54,
  EMME: 51,
  "Gaudì": 47,
  iBlues: 25,
  Intrend: 56,
  Marella: 28,
  Pennyblack: 15,
  "Armata di Mare": 65,
  "Conte of Florence": 66,
  Refrigue: 74,
  "Levi's": 34,
  Nike: 47,
  Lacoste: 41,
  Jordan: 55,
  "Abercrombie & Fitch": 66,
  "Bench.": 29,
  Buffalo: 42,
  Converse: 66,
  "Under Armour": 60,
  Hurley: 72,
  Stanley: 65,
  Wrangler: 38,
  Walmart: 44,
  Costco: 29,
  "Scotch & Soda": 61,
  Zara: 51,
};

/**
 * 版式缩放系数。
 *
 * BRAND_HEIGHT 是"光学配平"的结果（让 28 个标识视觉重量一致，见上）。
 * 它是**与版式无关的基准值** —— 换布局时不应该去改那组数字，那会让配平逻辑失真。
 * 这里单独给一个系数，把整组等比缩放，配平关系原样保留。
 *
 * 1 = 配平基准（188×66 格子）与当前版式（4 列 × 204px 格，内容 188px）刚好对齐。
 * 若哪天斜度变小、标识区变宽，只改这一个数即可。
 */
const LAYOUT_SCALE = 1;

export default function GlobalBrands() {
  return (
    <section className="w-full bg-white">
      {/* 竖向留白交给左右两栏自己给（py-16 / py-20），container 不再加 py ——
          否则黑块上下会各留一段白，变成"浮在白纸上的深色面板"，
          而不是一条从边到边的"左黑右白"色带。 */}
      <div className="container-site">
        <div className="relative">
          {/* 斜切黑块：仅 lg 以上。
              必须 `-left-16` 出血到视口左边 —— 否则黑块和左栏文字同起点（都在
              container 的 64px 内边距处），文字会紧贴黑块左边缘，像顶格。

              出血 64px 后，元素宽度变成「内容宽 + 64」，clip-path 的百分比
              基准也随之变大，所以两个端点要跟着换算（不是 35% / 28%）：
                container 内容宽 1312，出血后元素宽 1376
                35% 的内容点 = 64 + 0.35×1312 = 523  → 523/1376 = 38.0%
              底部取 32% 而不是精确对齐 28% 算出来的 31.3% ——
              实测左栏文字块右边界 425、斜边在 423.7，只差 1.3px，
              换行长一点就会蹭到白底。留 8px 余量，斜角还更缓一点。
              lg 以下 container 内边距是 40px，但那时不显示斜切，无影响。 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-16 right-0 hidden bg-ink-950 lg:block"
            style={{ clipPath: "polygon(0 0, 38% 0, 32% 100%, 0 100%)" }}
          />

          <div className="relative grid lg:grid-cols-[35%_1fr]">
            {/* ---------- 左：黑块上的文案 ---------- */}
            <div className="-mx-6 flex flex-col justify-center bg-ink-950 px-6 py-16 sm:-mx-10 sm:px-10 lg:mx-0 lg:bg-transparent lg:py-20 lg:pl-0 lg:pr-0">
              {/* 文字必须留在斜边最窄处以内（黑块底部只到 28%，
                  而本列宽 35%），否则白字会掉到白底上。
                  80% × 35% = 28%，正好卡住。 */}
              <Reveal className="lg:max-w-[80%]">
                <p className="flex items-center gap-3 text-[12px] font-medium uppercase tracking-[0.28em] text-white/50">
                  <span aria-hidden className="h-[3px] w-6 bg-accent-400" />
                  {PARTNERS_INTRO.eyebrow}
                </p>
                <h2 className="display-md mt-5 text-white">
                  {PARTNERS_INTRO.title}
                </h2>

                <p className="mt-6 text-[15px] leading-[1.85] text-white/70">
                  {PARTNERS_INTRO.lead}
                </p>
                <p className="mt-4 text-[15px] leading-[1.85] text-white/70">
                  {PARTNERS_INTRO.body}
                </p>

                <Link
                  href={PARTNERS_INTRO.cta.href}
                  className="group mt-8 inline-flex items-stretch border border-white/28 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 transition-colors duration-300 hover:border-white/60 hover:text-white"
                >
                  <span className="px-5 py-3">{PARTNERS_INTRO.cta.label}</span>
                  <span
                    aria-hidden
                    className="flex w-10 items-center justify-center border-l border-white/28 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </Reveal>
            </div>

            {/* ---------- 右：白底标识墙 ---------- */}
            {/* flex + items-center：让七行标识在左栏的高度里垂直居中。
                不加的话 ul 从顶部开始排，左栏比它高出一截，下方会空一块。 */}
            <div className="flex items-center bg-white px-6 py-16 sm:px-10 lg:py-16 lg:pl-9 lg:pr-0">
              <Reveal className="w-full">
                {/* 28 个 = 4 列 × 7 行，正好整除，不留空格。
                    五列会把超长字标（iBlues 7.6:1 / Pennyblack 12.6:1）压成细条 ——
                    格子变宽后它们才拿得到配平所需的 188px。 */}
                <ul className="grid grid-cols-2 items-center gap-x-0 gap-y-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-y-1">
                  {PARTNER_BRANDS.map((brand) => (
                    <li
                      key={brand.name}
                      className="flex h-[82px] items-center justify-center px-2"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        title={brand.name}
                        /* lazy 安全：静态网格，不像认证条那样横向滚动 */
                        loading="lazy"
                        decoding="async"
                        style={{
                          height: `${Math.round(
                            (BRAND_HEIGHT[brand.name] ?? 48) * LAYOUT_SCALE
                          )}px`,
                        }}
                        className="max-h-full w-auto max-w-full object-contain"
                      />
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
