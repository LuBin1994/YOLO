import Link from "next/link";

/**
 * 列表页分类区块标题行：左标题、右「See all / View all / See more」文字链，
 * 与 Primesource 分类列表页的收尾动作一致。
 */
export default function SectionAction({
  title,
  href,
  label = "See all",
}: {
  title: string;
  href: string;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b hairline pb-5">
      <h2 className="text-xl font-medium tracking-tight text-ink-900 md:text-2xl">
        {title}
      </h2>
      <Link
        href={href}
        className="shrink-0 text-xs tracking-[0.12em] text-ink-600 underline-offset-8 transition-colors hover:text-forest-700 hover:underline"
      >
        {label}
      </Link>
    </div>
  );
}
