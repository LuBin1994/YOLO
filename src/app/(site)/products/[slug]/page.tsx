import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumb } from "@/lib/seo";
import { getProductBySlug } from "@/lib/site-data";
import { absoluteUrl } from "@/lib/site-url";

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
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "article",
      title: product.title,
      description: product.description ?? undefined,
      url: `/products/${product.slug}`,
      images: product.cover_image
        ? [{ url: product.cover_image, alt: product.title }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const gallery = product.images.length > 0 ? product.images : [product.cover_image];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: gallery
      .filter((src): src is string => Boolean(src))
      .map((src) => absoluteUrl(src)),
    category: "Apparel",
    url: absoluteUrl(`/products/${product.slug}`),
    manufacturer: { "@id": `${absoluteUrl("/")}#organization` },
  };

  return (
    <div className="pt-24 md:pt-28">
      <JsonLd
        data={[
          productJsonLd,
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.title, path: `/products/${product.slug}` },
          ]),
        ]}
      />
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
            className="text-[13px] tracking-wide text-ink-400 transition-colors hover:text-ink-950"
          >
            ← All products
          </Link>

          <p className="mt-8 text-[12px] font-medium uppercase tracking-[0.3em] text-ink-400">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight text-ink-950 md:text-5xl">
            {product.title}
          </h1>

          {product.price_range ? (
            <p className="mt-5 text-lg font-medium text-ink-950">
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
                <dt className="w-28 shrink-0 text-[12px] uppercase tracking-[0.2em] text-ink-400">
                  Materials
                </dt>
                <dd className="text-[15px] text-ink-950">
                  {product.materials.join(" · ")}
                </dd>
              </div>
            ) : null}
            {product.moq ? (
              <div className="flex gap-6 border-b hairline py-4">
                <dt className="w-28 shrink-0 text-[12px] uppercase tracking-[0.2em] text-ink-400">
                  MOQ
                </dt>
                <dd className="text-[15px] text-ink-950">
                  {product.moq.toLocaleString()} pcs / colorway
                </dd>
              </div>
            ) : null}
            <div className="flex gap-6 border-b hairline py-4">
              <dt className="w-28 shrink-0 text-[12px] uppercase tracking-[0.2em] text-ink-400">
                Customization
              </dt>
              <dd className="text-[15px] text-ink-950">
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
