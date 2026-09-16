import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import { SITE } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Request a quote or start a program. Our export sales team responds within 24 hours.",
};

interface Props {
  searchParams: Promise<{ product?: string }>;
}

export default async function ContactPage({ searchParams }: Props) {
  const { product } = await searchParams;

  return (
    <div className="pt-28 md:pt-36">
      <section className="container-site pb-24 md:pb-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          {/* 左侧信息 */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-ink-400">
              Get in Touch
            </p>
            <h1 className="display-xl mt-5">Let&apos;s build your program.</h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-600">
              Tell us about your product type, target quantity and market. Our
              export sales team will respond within 24 hours.
            </p>

            <dl className="mt-12 space-y-8">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
                  Email
                </dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-lg text-ink-950 underline decoration-transparent decoration-2 underline-offset-8 transition-colors duration-300 hover:decoration-volt-500"
                  >
                    {SITE.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
                  Phone / WhatsApp
                </dt>
                <dd className="mt-2 text-lg text-ink-950">{SITE.phone}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.22em] text-ink-400">
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
              <p className="mb-10 inline-flex items-center gap-2 bg-ink-950 px-4 py-2 text-sm text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-volt-400" />
                You are inquiring about:{" "}
                <span className="font-medium">{product}</span>
              </p>
            ) : null}
            <ContactForm product={product} />
          </div>
        </div>
      </section>
    </div>
  );
}
