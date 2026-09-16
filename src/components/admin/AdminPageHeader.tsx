import type { ReactNode } from "react";

/**
 * 后台页面头：小标 + 放大标题 + 说明 + 右侧操作位。
 * 统一各页头部节奏——之前每页各写一遍，字号与间距都不一致。
 */
export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  /** 分组小标，例如「产品目录」「询盘」 */
  eyebrow?: string;
  title: string;
  description?: string;
  /** 右侧操作区，通常是主按钮 */
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 border-b border-ink-900/8 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            <span aria-hidden className="h-[3px] w-5 bg-volt-400" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-ink-950 md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
}
