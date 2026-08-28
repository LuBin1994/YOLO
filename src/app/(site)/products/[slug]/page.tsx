import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/site-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.title,
    description: product.description ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const gallery = product.images.length > 0 ? product.images : [product.cover_image];

  return (
    <div className="pt-24 md:pt-28">
      <div className="container-site grid gap-14 pb-24 lg:grid-cols-[1.2fr_1fr] lg:gap-20 md:pt-8">
        {/* 图片画廊 */}
        <div className="space-y-6">
          {gallery.map((src, i) =>
            src ? (
              <div key={src} className="frame aspect-[4/5]">
                <Image
                  src={src}
                  alt={`${product.title} — view ${i + 1}`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            ) : null
          )}
        </div>

        {/* 信息区 */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Link
            href="/products"
            className="text-xs tracking-wide text-ink-400 transition-colors hover:text-forest-700"
          >
            ← All products
          </Link>

          <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-forest-600">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {product.title}
          </h1>

          {product.price_range ? (
            <p className="mt-5 text-lg font-medium text-forest-700">
              {product.price_range}
            </p>
          ) : null}

          {product.description ? (
            <p className="mt-8 text-base leading-relaxed text-ink-600">
              {product.description}
            </p>
          ) : null}

          {/* 参数表 */}
          <dl className="mt-10 space-y-0 border-t hairline">
            {product.materials.length > 0 ? (
              <div className="flex gap-6 border-b hairline py-4">
                <dt className="w-28 shrink-0 text-[11px] uppercase tracking-[0.2em] text-ink-400">
                  Materials
                </dt>
                <dd className="text-sm text-ink-900">
                  {product.materials.join(" · ")}
                </dd>
              </div>
            ) : null}
            {product.moq ? (
              <div className="flex gap-6 border-b hairline py-4">
                <dt className="w-28 shrink-0 text-[11px] uppercase tracking-[0.2em] text-ink-400">
                  MOQ
                </dt>
                <dd className="text-sm text-ink-900">
                  {product.moq.toLocaleString()} pcs / colorway
                </dd>
              </div>
            ) : null}
            <div className="flex gap-6 border-b hairline py-4">
              <dt className="w-28 shrink-0 text-[11px] uppercase tracking-[0.2em] text-ink-400">
                Customization
              </dt>
              <dd className="text-sm text-ink-900">
                Fabric · trims · labels · packaging
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/contact?product=${product.slug}`}
              className="btn-primary"
            >
              Request a Quote
            </Link>
            <Link href="/factory" className="btn-outline">
              About Our Factory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
