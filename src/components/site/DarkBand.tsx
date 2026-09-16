import Image from "next/image";

/**
 * 深色正文带：满宽近黑容器，内部左窄右宽两栏。
 * 左栏为小标题 + 正文，右栏为大号排印（把能力清单当图形使用）。
 * 右栏可选配图，用于内页。
 */
export default function DarkBand({
  heading,
  body,
  lead,
  image,
  footer,
}: {
  heading: string;
  body: string;
  /** 大号排印行，逐行渲染 */
  lead?: readonly string[];
  /** 可选配图，出现在右栏下方 */
  image?: string;
  /** 底部补充文案 */
  footer?: string;
}) {
  return (
    <section className="band-dark w-full">
      <div className="container-site section-pad">
        <div className="grid gap-12 lg:grid-cols-[1fr_2.1fr] lg:gap-20">
          {/* 左栏：窄 */}
          <div>
            <span className="rule-volt" aria-hidden />
            <h2 className="mt-6 text-lg font-medium tracking-tight text-white md:text-xl">
              {heading}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-[1.85] text-white/55">
              {body}
            </p>
          </div>

          {/* 右栏：宽，把能力清单当图形 */}
          <div>
            {lead && lead.length > 0 ? (
              <div className="typo-lead text-white">
                {lead.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            {image ? (
              <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-white/5">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="object-cover opacity-85"
                />
              </div>
            ) : null}

            {footer ? (
              <p className="mt-8 max-w-2xl text-sm leading-[1.85] text-white/55">
                {footer}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
