"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 后台错误边界。
 *
 * 放在 admin/ 段上，用于兜住 (protected)/layout.tsx 及其子页面抛出的服务端异常。
 * 生产构建下 React 不会把具体报错文案下发到浏览器，只给一个 digest，
 * 控制台里就变成没有任何信息的 "Minified React error #441"。
 * 这里把 digest 显性展示出来，配合 Vercel 日志即可定位真实堆栈。
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 浏览器控制台留一份，方便直接复制
    console.error("[admin] render failed:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-2xl">
        <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-ink-400">
          <span aria-hidden className="h-[3px] w-6 bg-volt-400" />
          管理后台
        </p>

        <h1 className="mt-6 text-3xl font-medium tracking-tight text-ink-950 md:text-4xl">
          后台加载失败
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          服务端组件渲染时抛出了异常。生产构建下 React 不会下发具体文案，只给一个错误摘要。
          拿下面的 digest 到{" "}
          <strong className="font-medium text-ink-950">
            Vercel → 项目 → Deployments → 当前部署 → Logs
          </strong>{" "}
          里搜索，就能看到真实堆栈。
        </p>

        {error.digest ? (
          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-400">
              错误摘要 digest
            </p>
            <code className="mt-2 block break-all rounded bg-sand-100 px-3 py-2 text-xs text-ink-950">
              {error.digest}
            </code>
          </div>
        ) : null}

        <div className="mt-8 border border-ink-900/8 bg-white p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-ink-400">
            按顺序排查
          </p>
          <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-ink-600">
            <li>
              1. Vercel 项目是否配置了{" "}
              <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_URL
              </code>{" "}
              与{" "}
              <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
              ——{" "}
              <code className="rounded bg-sand-100 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
              不会随代码部署上去
            </li>
            <li>2. 勾选的环境是否覆盖当前部署（Production / Preview 是分开的）</li>
            <li>
              3. 改完环境变量
              <strong className="font-medium text-ink-950">要重新部署</strong>
              ，已有部署不会热更新
            </li>
            <li>4. supabase/ 下的迁移脚本是否已在对应项目执行</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <button type="button" onClick={reset} className="btn-primary">
            重试
          </button>
          <Link
            href="/"
            className="text-xs tracking-wide text-ink-400 underline decoration-transparent decoration-2 underline-offset-4 transition-colors duration-200 hover:text-ink-950 hover:decoration-volt-500"
          >
            ← 返回官网
          </Link>
        </div>
      </div>
    </div>
  );
}
