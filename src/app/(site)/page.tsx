import type { Metadata } from "next";
import VideoMosaic from "@/components/site/VideoMosaic";
import WelcomeBand from "@/components/site/WelcomeBand";
import ImageMarquee from "@/components/site/ImageMarquee";
import TrustBand from "@/components/site/TrustBand";
import ShowcaseWall from "@/components/site/ShowcaseWall";
import ContactSection from "@/components/site/ContactSection";
import GlobalBrands from "@/components/site/GlobalBrands";
/* 首页目前不渲染「精选产品」，相关导入一并注释，恢复时放开 */
// import Link from "next/link";
// import Reveal from "@/components/site/Reveal";
// import ProductCard from "@/components/site/ProductCard";
/*
 * 首屏的「斜切面板 + 单段视频」（Hero.tsx / HOME_HERO）已于 2026-10-22 撤出首页，
 * 客户要求改用九宫格视频墙当第一屏。
 * 2026-10-23 清理死代码时，Hero.tsx、HOME_HERO 常量与 hero-loop 素材一并删除；
 * 如需回滚，先从 .workbuddy/backups/ 恢复组件与 public/media/home/hero-loop.*。
 */
import {
  HOME_REEL,
  HOME_REEL_INTRO,
  HOME_SHOWCASE,
  HOME_SHOWCASE_HEADLINE,
  HOME_WELCOME,
  buildProductMarquee,
  getProducts,
} from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Vertically integrated apparel manufacturing",
  description:
    "Apparel manufacturing with 16+ own factories across China, Cambodia, Laos, Myanmar and Egypt. Fabric development, design centres, production and shipment inside one group.",
};

/**
 * 首页节奏（2026-10 改版）
 *
 *   ① 视频墙        九段视频铺满整屏，不规则分格 —— 首屏就是"我们在做什么"
 *   ② 公司介绍      左叙述 / 右能力索引 + 三个数字（首屏之后进门）
 *   ③ 商品跑马灯    动态，紧跟着"我们是谁"亮出"我们做什么"
 *   ④ 信任带        地图 + 认证，合并为一个区块（原本是三块）
 *   ⑤ 合作品牌      整屏黑底 + 四列标识墙 —— 证据区的收尾重音
 *   ⑥ 联系表单      看完信任证据正好可以询盘
 *
 * 2026-10-22 晚间：客户要求把视频墙提到首页第一个板块，
 * 原先的「斜切面板 + 单段视频」首屏（Hero）整个撤掉。
 * 于是页面从"一句主张 + 一张大图"改成"九段工序同时开场"——
 * 首屏不再有 display-xl 的文案，唯一的"大"变成这面墙本身。
 * 代价要说清楚：**首屏没有可读的主张句了**，文案入口退到第二块。
 *
 * 上一版是「九宫格 → 介绍 → 跑马灯 → 地图 → 认证 → 品牌 → 表单」，
 * 七块同构、音量一致。这一版做的是：
 *   - 首屏从"九份注意力"收回成"一份"
 *   - 全站只有一个 display-xl 尺寸，其余降档
 *   - 中段三块合并，去掉两次重复的区块头部
 *   - 品牌墙改成整屏黑底，和黑底首屏前后呼应，页面首尾各有一次重音
 *
 * 2026-10-22 又去掉了一条「主张带」（Most brands need four vendors…），
 * 公司介绍从第三位顶到第二位。那条带原本承担"给首屏后面留一口气"的
 * 作用，现在这口气交给公司介绍自己的 section-pad 和左栏的留白。
 */
export default async function HomePage() {
  const products = await getProducts();
  // 精选区暂停，一并注释；恢复时放开
  // const featured = products.filter((p) => p.featured).slice(0, 6);
  /* 横向滚动带的图源就是产品图，与 /products 页同源，点击进对应详情页 */
  const marqueeRows = buildProductMarquee(products);

  return (
    <>
      {/* 首屏的 LCP 是视频墙的 poster（<video> 元素本身无法设 fetchPriority）。
          素材已改 Mixkit 远程直链（2026-10-23），这里预加载面积最大的两格封面，
          提前完成对 assets.mixkit.co 的握手；其余七张按正常优先级并发。
          React 19 会把 <link> 提到 <head>。 */}
      {/* 视频墙素材在第三方 CDN 上：提前建连（DNS + TLS），
          实测能把首屏 LCP 从 4.8s 压回 3s 出头 */}
      <link rel="preconnect" href="https://assets.mixkit.co" crossOrigin="" />
      <link rel="dns-prefetch" href="https://assets.mixkit.co" />
      <link
        rel="preload"
        as="image"
        href="https://assets.mixkit.co/videos/45750/45750-thumb-720-2.jpg"
      />
      <link
        rel="preload"
        as="image"
        href="https://assets.mixkit.co/videos/33167/33167-thumb-720-2.jpg"
      />

      {/* ① 视频墙：九段视频铺满整屏，不规则分格，占住首页第一屏。
          悬停单格即播、其余暂停；点击从原位滑到中央播放，
          原位留灰、点 mask 原路滑回（见 VideoMosaic.tsx）。
          2026-10-22 晚间从第四块提到第一块，顶掉原来的斜切面板首屏。 */}
      <VideoMosaic clips={HOME_REEL} intro={HOME_REEL_INTRO} />

      {/* ② 公司介绍：珍珠白底，左叙述 / 右能力索引。 */}
      <WelcomeBand
        eyebrow={HOME_WELCOME.eyebrow}
        lead={HOME_WELCOME.lead}
        body={HOME_WELCOME.body}
        capabilities={HOME_WELCOME.capabilities}
        stats={HOME_WELCOME.stats}
      />

      {/* ③ 商品图横向滚动带：两行错峰，悬停暂停；点击整格进产品详情。
          2026-10-22 从拼贴后面提到公司介绍正下方——客户要求
          "商品跑马灯移在公司介绍下面"。 */}
      {marqueeRows.length > 0 ? (
        <ImageMarquee rows={marqueeRows} label="YOLO Apparel style" />
      ) : null}

      {/* ④ 信任带：全球布局 + 认证，合并为一个区块 */}
      <TrustBand />

      {/* ⑤ 案例图墙：三列流式图片，标题钉在中屏；字压图上是白的、落在纸面是黑的 */}
      <ShowcaseWall
        shots={HOME_SHOWCASE}
        headline={HOME_SHOWCASE_HEADLINE}
      />

      {/* ⑥ 合作品牌：整屏黑底，左栏说明 + 四列标识墙 */}
      <GlobalBrands />

      {/* ⑦ 联系我们：与 /contact 页共用同一份实现，首页用 h2 避免两个 h1，
          标题降一档避免和首屏抢"全站最大的那一处" */}
      <section className="container-site section-pad">
        <ContactSection headingClassName="display-md" />
      </section>

      {/* ⑦ 精选产品 —— 商品图暂时从首页撤下（2026-10-21）。
          恢复时删掉这层注释包裹即可，内部代码没有改动。
      <section className="border-t hairline bg-sand-50">
        <div className="container-site section-pad">
          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Featured Styles</p>
                <h2 className="display-lg mt-5">Seasonal collection</h2>
              </div>
              <Link
                href="/products"
                className="btn-ghost shrink-0 text-[15px] md:pb-2"
              >
                View all products
              </Link>
            </div>
          </Reveal>

          <div className="card-grid-3 mt-16">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      */}
    </>
  );
}
