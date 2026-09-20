import Image from "next/image";
import Link from "next/link";

interface BannerItem {
  eyebrow: string;
  title: string;
  cta: { label: string; href: string };
  image: string;
  strip: string;
}

/**
 * 首页主视觉。
 *
 * 由原来的「50/50 居中对称双拼」改为「满幅单图 + 文字贴左下」。三处关键变化：
 *
 * 1) 不对称取代对称。原先两栏等分、标题居中、按钮居中，是落地页模板语汇；
 *    现在一整张图铺满视口，文字退到左下角，靠不对称制造张力。
 * 2) 解除对图片的压暗。原实现给图片加 opacity-70，再叠 from-black/45
 *    via-black/20 to-black/65 三层渐变——等于先把影像削弱再当背景板用。
 *    现在图片不做任何整体压暗，遮罩只覆盖文字所在的下部 3/5。
 * 3) 第二条 banner 没有删。它降为 3fr/2fr 的非对称次级带接在主视觉下方，
 *    原 strip 文案保留在各自栏内，内容零丢失。
 *
 * 顺带移除：原先的 `tone` 字段从未被任何数据使用，且它的行内 backgroundColor
 * 会覆盖 className 里的 hover:bg-white，使悬停反馈失效——属死代码兼隐性 bug。
 */
export default function SplitBanner({ items }: { items: readonly BannerItem[] }) {
  const hero = items[0];
  const second = items[1];

  if (!hero) return null;

  return (
    <section className="w-full">
      {/* ① 主视觉：满幅单图，文字贴左下 */}
      <div className="relative h-[78vh] w-full overflow-hidden bg-ink-950 md:h-[92vh]">
        <Image
          src={hero.image}
          alt={hero.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* 遮罩只压住文字所在的下部，图片主体保持原样 */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
        />

        <div className="container-site relative flex h-full flex-col justify-end pb-12 md:pb-16">
          <p className="overlay-eyebrow uppercase">{hero.eyebrow}</p>
          <h2 className="overlay-title mt-5 max-w-4xl text-5xl uppercase text-white md:text-7xl lg:text-8xl">
            {hero.title}
          </h2>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href={hero.cta.href}
              className="inline-flex items-center justify-center bg-volt-400 px-8 py-4 text-sm font-medium tracking-wide text-ink-950 transition-colors duration-300 hover:bg-white"
            >
              {hero.cta.label}
            </Link>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/75">
              {hero.strip}
            </p>
          </div>
        </div>
      </div>

      {/* ② 次级带：3fr/2fr 非对称，保留原本会被删掉的那条 banner */}
      {second ? (
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr]">
          <Link
            href={second.cta.href}
            className="group relative flex h-[48vh] items-end overflow-hidden bg-ink-950 md:h-[60vh]"
          >
            <Image
              src={second.image}
              alt={second.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            />
            <div className="relative p-8 md:p-12">
              <p className="overlay-eyebrow uppercase">{second.eyebrow}</p>
              <h3 className="overlay-title mt-4 text-3xl uppercase text-white md:text-5xl">
                {second.title}
              </h3>
            </div>
          </Link>

          <div className="flex flex-col justify-center bg-ink-950 px-8 py-12 md:px-12 md:py-16">
            <span className="rule-volt" aria-hidden />
            <p className="mt-6 text-sm leading-relaxed text-white/65">
              {second.strip}
            </p>
            <Link
              href={second.cta.href}
              className="mt-8 inline-flex w-fit items-center justify-center bg-volt-400 px-7 py-3.5 text-sm font-medium tracking-wide text-ink-950 transition-colors duration-300 hover:bg-white"
            >
              {second.cta.label}
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
