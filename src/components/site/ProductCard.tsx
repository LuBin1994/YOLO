import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/supabase/types";

interface ProductCardProps {
  product: Product;
  /** list 视图时显示描述与参数 */
  variant?: "grid" | "list";
}

/**
 * 产品卡片：画廊质感大图 + 悬停放大，信息极简。
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
        className="group grid grid-cols-1 gap-6 border-b hairline py-10 transition-colors hover:bg-sand-100/60 md:grid-cols-[320px_1fr] md:items-center"
      >
        <div className="frame aspect-[4/3]">
          {cover ? (
            <Image
              src={cover}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="group-hover:scale-[1.03] transition-transform duration-700"
            />
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-3 md:px-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-forest-600">
            {product.category}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {product.title}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-ink-600">
            {product.description}
          </p>
          <p className="text-sm text-ink-600">
            {product.materials.join(" · ")}
          </p>
          <p className="text-sm font-medium text-forest-700">
            {product.price_range}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="frame aspect-[3/4]">
        {cover ? (
          <Image
            src={cover}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="group-hover:scale-[1.03] transition-transform duration-700"
          />
        ) : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-forest-600">
            {product.category}
          </p>
          <h3 className="mt-1 text-base font-medium tracking-tight text-ink-900">
            {product.title}
          </h3>
        </div>
        <p className="shrink-0 text-[13px] text-ink-600">
          {product.price_range}
        </p>
      </div>
    </Link>
  );
}
