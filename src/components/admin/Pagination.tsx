import Link from "next/link";

/**
 * 后台通用分页条。
 * 不依赖客户端状态：翻页是纯链接跳转，页码由服务端从 URL 读取。
 * 不需要翻页时（只有一页）自动不渲染。
 */
export default function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  /** 由调用方决定如何拼 URL（保留各自的筛选参数） */
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="分页"
      className="mt-8 flex flex-wrap items-center justify-between gap-4"
    >
      <p className="text-xs text-ink-400">
        第 {page} / {totalPages} 页
      </p>

      <div className="flex items-center gap-1">
        <PageLink href={buildHref(page - 1)} disabled={page <= 1}>
          上一页
        </PageLink>

        {paginationItems(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-2 text-xs text-ink-400">
              …
            </span>
          ) : (
            <PageLink
              key={item}
              href={buildHref(item)}
              active={item === page}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </PageLink>
          )
        )}

        <PageLink href={buildHref(page + 1)} disabled={page >= totalPages}>
          下一页
        </PageLink>
      </div>
    </nav>
  );
}

/** 页码序列：页数多时折叠成 1 … 当前±1 … 末页 */
export function paginationItems(current: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const wanted = new Set([1, totalPages, current - 1, current, current + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (prev && p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

function PageLink({
  href,
  disabled,
  active,
  children,
  ...rest
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
} & React.AriaAttributes) {
  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-xs transition-colors duration-200";

  if (disabled) {
    return (
      <span className={`${base} border-ink-900/10 text-ink-400/50`} aria-disabled>
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} ${
        active
          ? "border-ink-950 bg-ink-950 font-medium text-white"
          : "border-ink-900/15 bg-white text-ink-600 hover:border-ink-950 hover:text-ink-950"
      }`}
      {...rest}
    >
      {children}
    </Link>
  );
}
