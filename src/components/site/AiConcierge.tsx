"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

/* =============================================================
   配置
   ============================================================= */

const SDK_SRC = "https://embed.autostaff.cn/sdk/digi-employee.js";
const IFRAME_ORIGIN = "https://embed.autostaff.cn";

/**
 * Station 与 embed token。
 *
 * 这两个值最终都会下发到浏览器：iframe 通过 postMessage 向宿主索取 token，
 * 所以它们不是机密，等同于「可公开的接入凭据」（类似 Stripe 的 publishable key）。
 *
 * 这里给出可用默认值，是为了保证部署到 Vercel 时**无需额外配置就能工作**——
 * 本项目已经踩过「只配了 .env.local、线上缺变量，前台静默降级」的坑。
 * 需要换 station 或轮换 token 时，用 NEXT_PUBLIC_* 覆盖即可，不必改代码。
 */
const STATION_ID =
  process.env.NEXT_PUBLIC_DIGI_EMPLOYEE_STATION_ID ??
  "stn_db9108ac-b733-4633-8d59-d008a43447c2";

const EMBED_TOKEN =
  process.env.NEXT_PUBLIC_DIGI_EMPLOYEE_TOKEN ??
  "stn_eisgaXZB-SxiS3YqZOSjLkDzJuXywlUuSHDqIwH8J6I";

/**
 * 取 embed token。**这是将来唯一需要替换的地方。**
 *
 * 【当前 · 测试期方案】直接返回前端内置的静态 token。
 * 代价要清楚：它会被打进客户端 bundle，任何人打开 devtools 都能拿到；
 * 且无法单独失效（要换只能整站换 station token）。
 * 作为测试期方案可以接受，但不要在这个前提下把 station 的权限开到很大。
 *
 * 【后期 · 后端签发短期令牌】把本函数替换成：
 *
 *   async function getEmbedToken(): Promise<string> {
 *     const res = await fetch("/api/digi-employee-token", { cache: "no-store" });
 *     if (!res.ok) throw new Error(`token endpoint ${res.status}`);
 *     return (await res.json()).token as string;
 *   }
 *
 * 其余代码不用改：SDK 内部是 `await this.config.getEmbedAccessToken()`
 * （源码 `handleEmbedAccessTokenRequest`），本身就支持 Promise，
 * 所以这里提前声明成 async 函数，替换时签名不变。
 * 注意：换后端签发后，`NEXT_PUBLIC_DIGI_EMPLOYEE_TOKEN` 应当从浏览器可见的
 * 变量里移除，避免两套凭据并存。
 */
async function getEmbedToken(): Promise<string> {
  return EMBED_TOKEN;
}

/**
 * 每位访客一个稳定的会话 id。
 *
 * 供应商示例里给的是固定值 "team_aace830f-…"，直接照搬到生产有风险：
 * 所有访客共用同一个 externalConversationId，很可能被归并到同一条会话里。
 * 这里改为 localStorage 持久化的随机 uuid —— 同一访客刷新后接续，不同访客互不可见。
 * 若供应商确认必须使用其指定 id，用 NEXT_PUBLIC_DIGI_EMPLOYEE_CONVERSATION_ID 覆盖。
 */
const CONV_STORAGE_KEY = "digi-employee:conversation";
const FIXED_CONV_ID = process.env.NEXT_PUBLIC_DIGI_EMPLOYEE_CONVERSATION_ID;

function getConversationId(): string | undefined {
  if (FIXED_CONV_ID) return FIXED_CONV_ID;
  try {
    const existing = window.localStorage.getItem(CONV_STORAGE_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(CONV_STORAGE_KEY, id);
    return id;
  } catch {
    /* 隐私模式等 localStorage 不可用的场景：不传 id，交给 iframe 自建会话 */
    return undefined;
  }
}

/* =============================================================
   SDK 类型（该 SDK 无官方类型包，按其实际源码声明）
   ============================================================= */

type LayoutMode = "inline" | "sidebar" | "overlay" | "fullscreen";

interface DigiEmployeeLayout {
  mode?: LayoutMode;
  mountTarget?: string | HTMLElement;
  width?: number;
  height?: number;
  side?: "left" | "right";
  draggable?: boolean;
}

interface DigiEmployeeConfig {
  stationId: string;
  iframeOrigin: string;
  layout?: DigiEmployeeLayout;
  mountTarget?: string | HTMLElement;
  externalConversationId?: string;
  getEmbedAccessToken?: () => string | Promise<string>;
  extendsUiTools?: unknown[];
}

interface DigiEmployeeInstance {
  init(): void;
  close(): void;
}

declare global {
  interface Window {
    DigiEmployee?: new (config: DigiEmployeeConfig) => DigiEmployeeInstance;
  }
}

/* =============================================================
   组件
   ============================================================= */

const PANEL_ID = "ai-concierge-panel";

/**
 * AI 客服（BotWorks / DigiEmployee）接入。
 *
 * 为什么不用 SDK 自带的 `overlay` 模式：
 * 它的 overlay 是**常开**的 420×640 固定面板，没有气泡折叠态。直接启用会在
 * 每个页面长期遮住正文右下角。这里改用 `inline` 模式把 iframe 装进一个由我们
 * 控制的、可收起的浮动面板，交互由本组件负责。
 *
 * 其他实现取舍：
 * - 首次点开才初始化 iframe：不给每个访客的首屏都挂一个第三方 iframe。
 * - SDK 加载失败（被 CSP 拦、网络问题）时**不渲染入口按钮**，避免出现点不动的假按钮。
 * - 关闭用「面板收起 + inert」而不是卸载：会话不中断，重新打开能接上。
 * - 动效只动 transform / opacity，reduced-motion 下直接切换。
 */
export default function AiConcierge() {
  const mountRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const workerRef = useRef<DigiEmployeeInstance | null>(null);

  const [sdkReady, setSdkReady] = useState(false);
  const [open, setOpen] = useState(false);
  /** 首次打开后才允许建 iframe；关闭面板不销毁，会话得以保留 */
  const [everOpened, setEverOpened] = useState(false);

  useEffect(() => {
    if (!sdkReady || !everOpened || workerRef.current) return;

    const target = mountRef.current;
    const Ctor = window.DigiEmployee;
    if (!target || !Ctor) return;

    const worker = new Ctor({
      stationId: STATION_ID,
      iframeOrigin: IFRAME_ORIGIN,
      externalConversationId: getConversationId(),
      layout: { mode: "inline", mountTarget: target },
      /* 测试期为前端静态 token；换后端签发时改 getEmbedToken 一个函数即可 */
      getEmbedAccessToken: getEmbedToken,
      extendsUiTools: [],
    });

    try {
      worker.init();
      workerRef.current = worker;
    } catch (err) {
      console.error("[ai-concierge] 初始化失败：", err);
    }

    return () => {
      worker.close();
      workerRef.current = null;
    };
  }, [sdkReady, everOpened]);

  const openPanel = useCallback(() => {
    setOpen(true);
    setEverOpened(true);
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
    /* 焦点回到入口按钮，键盘用户不会丢失位置 */
    buttonRef.current?.focus();
  }, []);

  /* Esc 关闭 */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closePanel]);

  return (
    <>
      <Script
        src={SDK_SRC}
        strategy="afterInteractive"
        onReady={() => setSdkReady(Boolean(window.DigiEmployee))}
        onError={() => {
          console.error(
            "[ai-concierge] SDK 加载失败，客服入口不渲染。请检查 CSP 的 script-src 是否放行 " +
              IFRAME_ORIGIN
          );
        }}
      />

      {sdkReady ? (
        <>
          {/* 入口按钮：桌面为胶囊带文字，移动端为圆形 */}
          <button
            ref={buttonRef}
            type="button"
            onClick={openPanel}
            aria-expanded={open}
            aria-controls={PANEL_ID}
            aria-label="打开在线客服"
            className={`fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full bg-ink-950 px-4 py-3.5 text-sm font-medium text-white transition-[opacity,transform] duration-300 hover:bg-ink-900 motion-reduce:transition-none md:bottom-6 md:right-6 md:px-5 ${
              open
                ? "pointer-events-none translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path
                d="M21 11.6a8.4 8.4 0 0 1-9 8.4 9.4 9.4 0 0 1-3.4-.6L3 21l1.7-4.6A8.4 8.4 0 0 1 12 3.2a8.4 8.4 0 0 1 9 8.4Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden md:inline">Chat with us</span>
          </button>

          {/* 面板：收起时同时 inert + 透明，避免不可见内容被 Tab 聚焦 */}
          <div
            id={PANEL_ID}
            role="dialog"
            aria-label="在线客服对话"
            inert={!open}
            className={`fixed inset-x-0 bottom-0 z-50 flex h-[82dvh] max-h-[640px] flex-col overflow-hidden border-t border-ink-900/10 bg-white transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none md:inset-x-auto md:bottom-6 md:right-6 md:h-[620px] md:max-h-none md:w-[400px] md:rounded-lg md:border ${
              open
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-3 opacity-0"
            }`}
          >
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-ink-900/10 px-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink-600">
                Talk to our team
              </p>
              <button
                type="button"
                onClick={closePanel}
                aria-label="关闭在线客服"
                className="-mr-2 inline-flex h-9 w-9 items-center justify-center text-ink-600 transition-colors duration-200 hover:text-ink-950 focus-visible:outline-2 focus-visible:outline-ink-950 focus-visible:outline-offset-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* SDK 把 iframe 挂到这里，高度由父级 flex 撑开 */}
            <div ref={mountRef} className="min-h-0 flex-1" />
          </div>
        </>
      ) : null}
    </>
  );
}
