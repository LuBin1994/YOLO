import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/supabase/types";

interface ProductCardProps {
  product: Product;
  /** list 视图时显示描述与参数 */
  variant?: "grid" | "list";
}

/**
 * 产品卡片：图上、标题中、元数据下，无边框、等宽比例，靠间距形成秩序。
 * hover 时图片轻推放大 + 标题浮出青柠下划线，是本站主要的微交互点。
 */
export default function ProductCard({
  product,
  variant = "grid",
}: ProductCardProps) {
  const cover = product.cover_image ?? product.images[0];

  if (variant === "list") {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group grid grid-cols-1 gap-6 border-b hairline py-10 transition-colors hover:bg-sand-50 md:grid-cols-[320px_1fr] md:items-center"
      >
        <div className="card-media aspect-[4/3]">
          {cover ? (
            <Image
              src={cover}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-3 md:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-ink-400">
            {product.category}
          </p>
          <h3 className="text-2xl font-medium tracking-tight text-ink-950 underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors duration-300 group-hover:decoration-volt-500 md:text-3xl">
            {product.title}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-ink-600">
            {product.description}
          </p>
          <p className="text-sm text-ink-600">
            {product.materials.join(" · ")}
          </p>
          {product.moq ? (
            <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
              MOQ {product.moq.toLocaleString()} pcs
            </p>
          ) : null}
          <p className="text-sm font-medium text-ink-950">
            {product.price_range}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card-media">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
          />
        ) : null}
      </div>
      <div className="mt-5">
        <h3 className="text-lg font-medium tracking-tight text-ink-950 underline decoration-transparent decoration-2 underline-offset-[5px] transition-colors duration-300 group-hover:decoration-volt-500">
          {product.title}
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-xs uppercase tracking-[0.16em] text-ink-400">
          <span>{product.category}</span>
          {product.moq ? <span>MOQ {product.moq.toLocaleString()}</span> : null}
        </p>
        {product.price_range ? (
          <p className="mt-2 text-sm font-medium text-ink-950">
            {product.price_range}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
