import ContactForm from "./ContactForm";
import { SITE } from "@/lib/site-data";

/**
 * 「联系我们」区块：左侧信息 + 右侧表单。
 *
 * 联系页与首页共用同一份实现，避免两处文案与字段漂移。
 *
 * headingLevel：联系页这块是页面主标题（h1），首页只是其中一个区块（h2）。
 * 由调用方指定，避免首页出现两个 h1 影响标题层级与 SEO。
 *
 * headingClassName：字号也交给调用方。联系页是整页的主角，用 display-xl；
 * 首页首屏已经占用了"全站最大的那一处"，这里必须降一档（display-md），
 * 否则页面上会出现两个一样响的标题，读到末尾又变成"每块都在喊"。
 *
 * 注意：这里只渲染两列内容本身，**外层 section 与顶部留白由页面负责**——
 * 联系页因为固定头部需要 pt-28，首页不需要，二者不同。
 */
export default function ContactSection({
  product,
  headingLevel = "h2",
  headingClassName = "display-xl",
}: {
  /** 从产品详情页带过来的询盘对象 */
  product?: string;
  headingLevel?: "h1" | "h2";
  /** 标题字号类，默认 display-xl（联系页）；首页传 display-md */
  headingClassName?: string;
}) {
  const Heading = headingLevel;

  return (
    <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
      {/* 左侧信息 */}
      <div>
        <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-ink-400">
          Get in Touch
        </p>
        <Heading className={`${headingClassName} mt-5`}>
          Let&apos;s build your program.
        </Heading>
        <p className="mt-6 max-w-md text-base leading-relaxed text-ink-600">
          Tell us about your product type, target quantity and market. Our
          export sales team will respond within 24 hours.
        </p>

        <dl className="mt-12 space-y-8">
          <div>
            <dt className="text-[12px] uppercase tracking-[0.22em] text-ink-400">
              Email
            </dt>
            <dd className="mt-2">
              <a
                href={`mailto:${SITE.email}`}
                className="text-lg text-ink-950 underline decoration-transparent decoration-2 underline-offset-8 transition-colors duration-300 hover:decoration-accent-500"
              >
                {SITE.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[12px] uppercase tracking-[0.22em] text-ink-400">
              Phone / WhatsApp
            </dt>
            <dd className="mt-2 text-lg text-ink-950">{SITE.phone}</dd>
          </div>
          <div>
            <dt className="text-[12px] uppercase tracking-[0.22em] text-ink-400">
              Offices
            </dt>
            <dd className="mt-2 leading-relaxed text-ink-950">
              {SITE.address}
            </dd>
          </div>
        </dl>
      </div>

      {/* 右侧表单 */}
      <div className="border-t hairline pt-12 lg:border-t-0 lg:border-l lg:pl-16 lg:pt-0">
        {product ? (
          <p className="mb-10 inline-flex items-center gap-2 bg-ink-950 px-4 py-2 text-[15px] text-white">
            {/* 这个点在暖炭底上，用亮一档的 accent-400 才看得见 */}
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
            You are inquiring about:{" "}
            <span className="font-medium">{product}</span>
          </p>
        ) : null}
        <ContactForm product={product} />
      </div>
    </div>
  );
}
