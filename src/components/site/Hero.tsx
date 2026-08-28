import Image from "next/image";
import Link from "next/link";

/**
 * 首页全屏 Hero：大图背景 + 超大标题 + 双 CTA。
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-end overflow-hidden bg-forest-950">
      <Image
        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2400&q=80"
        alt="Southeast Asia garment factory production floor"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-80"
      />
      {/* 底部渐变压暗，保证文字可读 */}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/25 to-transparent" />

      <div className="container-site relative z-10 pb-20 pt-40 md:pb-28">
        <p className="text-[11px] uppercase tracking-[0.32em] text-sand-200/90">
          Vertically Integrated · Southeast Asia
        </p>
        <h1 className="display-xl mt-6 max-w-5xl text-sand-50">
          Apparel manufacturing,<br />
          from fiber to finished garment.
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-sand-100/85 md:text-lg">
          Own factories across Southeast Asia. Sustainable materials, full
          supply chain control, and programs built for your brand.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-sand-50 px-8 py-4 text-sm font-medium tracking-wide text-forest-950 transition-colors hover:bg-white"
          >
            Explore Products
          </Link>
          <Link
            href="/factory"
            className="inline-flex items-center justify-center border border-sand-50/40 px-8 py-4 text-sm font-medium tracking-wide text-sand-50 transition-colors hover:border-sand-50 hover:bg-sand-50/10"
          >
            Visit Our Factory
          </Link>
        </div>
      </div>
    </section>
  );
}
