"use client";

import { useEffect, useRef, useState } from "react";
import {
  WORLD_LAND_PATH,
  WORLD_MAP_HEIGHT,
  WORLD_MAP_WIDTH,
  WORLD_VIEWBOX,
  projectToMap,
} from "@/lib/world-land";
import type { OfficeNode, OfficeRole } from "@/lib/site-data";

/**
 * 点阵世界地图 + 绿色定位图钉 + 点击弹信息（2026-11-05 改版）。
 *
 * 【这一版去掉了什么】
 * 客户 2026-11-05 看过首页截图后说"坐标系什么不要了"，指的是 2026-10-29 那版
 * 技术图纸语汇：30° 经纬网、边缘经纬刻度、赤道加重线、左下角三行读数条、
 * 底部 "EQUIRECTANGULAR · WGS-84 / SITES 01–09" 图脚，以及地图外框。
 * 全部移除，只留点阵陆地 —— 地图从"图纸"回到"底色"。
 *
 * 【换成了什么】
 * 按客户给的目标版式：每个站点一枚**深绿水滴图钉 + 白色内点**，
 * 名称文字紧贴图钉，点图钉在钉旁弹出信息卡。
 *
 * 【图钉为什么是 HTML，不画进 SVG】
 * SVG 里的一切随容器宽度缩放：map 实际 1300px 时 1 单位 ≈ 1.3px，
 * 到 390px 手机上只有 0.39px。图钉若用地图单位画，手机端会缩成色斑。
 * 所以图钉是 HTML + 固定像素尺寸（桌面 20×28、手机 15×21）。
 *
 * 【钉尖才是坐标，不是钉心】
 * 定位用 `translate(-50%, -100%)`，把整枚钉推到锚点上方。
 * 标签偏移（labelDx/Dy）相对**钉尖**计量，与图钉尺寸解耦。
 *
 * 【为什么中国集群不画图钉】
 * 杭州(120.2,30.3) 与四省中心(117,33) 只差 11.7 个地图单位 —— 1300px 的地图上
 * 是 15px，而图钉宽 20px，两枚钉会叠成一坨墨。所以集群（带 clusterRadius）
 * 只画虚线圈表示"一个点代表四个省"；杭州照常出钉，视觉上正好是
 * "一枚钉落在虚线圈里"，与参考图一致。命中仍按圈心算。
 *
 * 【命中为什么用"最近点"而不是逐元素】
 * 东南亚三点（缅甸 96 / 老挝 102.5 / 柬埔寨 104.9）在 1300px 地图上相距
 * 8–10px，而触摸目标要 32px —— 三个按钮方框必然互相覆盖，DOM 靠后的赢，
 * 实测点柬埔寨会激活缅甸。所以指针命中挂在整幅图面上算最近点，
 * 图钉是纯装饰（aria-hidden / pointer-events-none），按钮只服务键盘 Tab。
 *
 * 【信息卡的两种存在方式，不能共用一套定位】
 * 桌面：贴钉弹出，钉上方为主，太靠顶部（< 26%）翻到下方。
 * 手机：地图只有约 147px 高，任何贴钉的卡都会溢出或盖掉半个东南亚，
 *       所以卡片走**流内**、排在地图下方。不覆盖地图，代价是展开时页面
 *       下沉约 60px —— 但这比盖住地图好，而且只在用户主动点击时发生。
 *
 * 【坐标换算】
 * 投影给出 0..1000 / 0..500，但 viewBox 是 "0 16 1000 410"。
 * 算百分比必须扣掉 y 的 16 偏移、除以 410 而不是 500，否则点位整体偏下。
 */

const DOT_ID = "wf-land-dots";
const CLIP_ID = "wf-land-clip";

const INK_900 = "var(--color-ink-900)";
const ACCENT_600 = "var(--color-accent-600)";

/* viewBox 的可视区域（与 WORLD_VIEWBOX 一致，改那边要同步改这里） */
const VB_TOP = 16;
const VB_HEIGHT = 410;

const ROLE_LABEL: Record<OfficeRole, string> = {
  hq: "Headquarters",
  design: "Design studio",
  sales: "Sales centre",
  production: "Production",
};

function toPercent(office: OfficeNode) {
  const [x, y] = projectToMap(office.lon, office.lat);
  return {
    left: (x / WORLD_MAP_WIDTH) * 100,
    top: ((y - VB_TOP) / VB_HEIGHT) * 100,
  };
}

/**
 * 标签偏移用**像素**，不是地图单位。
 *
 * 【为什么】地图会随容器缩放，而图钉（20×28px）和标签字号（11px）都是固定像素 ——
 * 三者若用同一种单位就必然对不上：按地图单位算，390px 手机上 1 单位只有 0.36px，
 * 偏移 16 单位不到 6px，文字会直接压在钉子上。
 * 用 px 之后，无论容器多宽，"文字离钉多远"都是个常数。
 *
 * 【为什么不用百分比】百分比同样随地图缩放，问题跟地图单位一样。
 */
function labelShift(office: OfficeNode) {
  return { dx: office.labelDx ?? 0, dy: office.labelDy ?? 0 };
}

/**
 * 命中半径（CSS 像素）。
 * 26 = 钉头离钉尖约 14px + 余量，点在图钉头部也能选中它自己。
 * 再大就会跨到邻近站点（东南亚三点只隔 8–10px）。
 */
const HIT_RADIUS = 26;

/** 卡片宽度（px）。手机、桌面同宽 —— 手机 358px 的地图放 200px 卡片刚好。 */
const CARD_W = 200;

/**
 * 卡片高度估算（px）。
 *
 * 【为什么用估算而不是渲染后量】量高要两趟渲染：先渲染到不可见位置、量完再挪，
 * 中间会闪一下。而这里只需要一个"够用的上界"来做避让判断 —— 差 4px 无感。
 * 拆成"基础 + 备注"两段，因为 note 会多一条分隔线和一行小字。
 */
const CARD_H_BASE = 64;
const CARD_H_NOTE = 93;

/** 卡片与钉子的间隙（px）。太小会像贴纸，太大读不出是从哪颗钉弹出来的。 */
const CARD_GAP = 12;

type Box = { l: number; r: number; t: number; b: number };

function overlapArea(a: Box, b: Box) {
  const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
  const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
  return w > 0 && h > 0 ? w * h : 0;
}

/** 单枚图钉。纯装饰，交互在父层。 */
function PinMark({ dim }: { dim: boolean }) {
  return (
    <svg
      viewBox="0 0 24 32"
      aria-hidden="true"
      className={`block h-full w-full drop-shadow-[0_1px_2px_rgba(27,26,23,0.3)] transition-opacity duration-200 ${
        dim ? "opacity-40" : "opacity-100"
      }`}
    >
      {/* 白色描边不能省：手机端东南亚三点在 358px 的地图上只差 2–6px，
          图钉必然叠在一起。有这圈白边，重叠时仍看得出是"几枚针挨着"，
          而不是糊成一块绿斑。桌面宽屏下这圈白边几乎看不见，不影响。 */}
      <path
        d="M12 0.9C6 0.9 1.1 5.8 1.1 11.8c0 8.3 10.9 19.3 10.9 19.3s10.9-11 10.9-19.3C22.9 5.8 18 0.9 12 0.9Z"
        fill={ACCENT_600}
        stroke="var(--color-paper)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* 参考图是"浅绿环 + 白心"，这里压成细环 + 白点：
          在 14px 的手机尺寸下也得看得出是一枚定位针，而不是一团绿 */}
      <circle cx="12" cy="11.6" r="4.2" fill="#ffffff" fillOpacity="0.3" />
      <circle cx="12" cy="11.6" r="3.1" fill="#ffffff" />
    </svg>
  );
}

export default function WorldMap({
  offices,
  className = "",
}: {
  offices: readonly OfficeNode[];
  className?: string;
}) {
  /* 默认不弹：这一版没有常驻读数条，没有理由一进页面就把卡压在地图上。
     点图钉才出，点空白 / Esc 收起。 */
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = offices.find((office) => office.id === activeId) ?? null;

  /** 指针命中用（见 HIT_RADIUS 注释） */
  const frameRef = useRef<HTMLDivElement>(null);

  /**
   * 地图当前的实际像素尺寸。
   *
   * 【为什么要量】卡片是固定 200px 宽，而钉位是百分比 —— 要做"贴钉 + 避让"的
   * 几何计算，必须把两边换算到同一个像素坐标系。用 ResizeObserver 而不是
   * 读一次 window.innerWidth：地图宽度由容器决定，窗口变了地图未必变。
   */
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  /** 钉子的实际像素尺寸随断点变（见下方 className 的 md:），避让计算要用对 */
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setFrame({ w: rect.width, h: rect.height });
    });
    ro.observe(el);

    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  const pickNearest = (clientX: number, clientY: number) => {
    const frame = frameRef.current;
    if (!frame) return null;

    const rect = frame.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    let bestId: string | null = null;
    let bestDist = Infinity;

    for (const office of offices) {
      const { left, top } = toPercent(office);
      const cx = rect.left + (left / 100) * rect.width;
      const cy = rect.top + (top / 100) * rect.height;
      const dist = Math.hypot(clientX - cx, clientY - cy);
      if (dist < bestDist) {
        bestDist = dist;
        bestId = office.id;
      }
    }

    return bestDist <= HIT_RADIUS ? bestId : null;
  };

  /**
   * 信息卡贴钉摆放（像素坐标）。
   *
   * 【为什么不是"钉子上方居中"一句话搞定】
   * 九枚钉里有三处挤在一起：巴黎/西班牙隔 21px、杭州/中国四省隔 15px、
   * 缅甸/老挝/柬埔寨互隔 8–27px。固定朝一个方向摆，必然盖住邻居。
   *
   * 【算法：首次适配，不是打分】
   * 按「右 → 左 → 上 → 下 → 四个斜角」的顺序逐个试，**取第一个
   * 既不压别的图钉、也不出画框的**。
   *
   * 试过加权打分（越界重罚 + 压钉按面积罚 + 距离罚），结果不好：
   * 分数差异被距离项抹平，老挝的卡片会被推到 220px 外的左下方 ——
   * 数学上"最优"，观感上完全看不出是从哪颗钉弹出来的。
   * 首次适配的好处是**默认行为稳定可预期**：多数站点就是右侧（贴钉最近的方向），
   * 只有右侧确实被占/出界时才翻转，用户不会觉得卡片在乱跳。
   *
   * 【障碍只算图钉】虚线圈和标签都不算 —— 卡片本来就该盖住自己的标签，
   * 圈是虚线装饰，压上去不构成误读。
   */
  const cardPos = (() => {
    if (!active || frame.w === 0 || frame.h === 0) return null;

    const pinW = isDesktop ? 20 : 14;
    const pinH = isDesktop ? 28 : 20;
    const cardH = active.note ? CARD_H_NOTE : CARD_H_BASE;

    /* 地图太小（手机竖屏）贴钉放不下，交给下方流内那张卡 */
    if (frame.w < CARD_W + 40 || frame.h < cardH + 40) return null;

    const { left: pctL, top: pctT } = toPercent(active);
    const ax = (pctL / 100) * frame.w; // 钉尖 x
    const ay = (pctT / 100) * frame.h; // 钉尖 y

    /* 别的图钉占的矩形 */
    const pins: Box[] = [];
    for (const o of offices) {
      if (o.id === active.id || o.clusterRadius) continue;
      const { left, top } = toPercent(o);
      const ox = (left / 100) * frame.w;
      const oy = (top / 100) * frame.h;
      pins.push({ l: ox - pinW / 2, r: ox + pinW / 2, t: oy - pinH, b: oy });
    }

    const candidates = [
      { left: ax + pinW / 2 + CARD_GAP, top: ay - cardH / 2 }, // 右
      { left: ax - pinW / 2 - CARD_GAP - CARD_W, top: ay - cardH / 2 }, // 左
      { left: ax - CARD_W / 2, top: ay - pinH - CARD_GAP - cardH }, // 上
      { left: ax - CARD_W / 2, top: ay + CARD_GAP }, // 下
      { left: ax + pinW / 2 + CARD_GAP, top: ay - pinH - CARD_GAP - cardH }, // 右上
      { left: ax - pinW / 2 - CARD_GAP - CARD_W, top: ay - pinH - CARD_GAP - cardH }, // 左上
      { left: ax + pinW / 2 + CARD_GAP, top: ay + CARD_GAP }, // 右下
      { left: ax - pinW / 2 - CARD_GAP - CARD_W, top: ay + CARD_GAP }, // 左下
    ];

    for (const c of candidates) {
      const box: Box = { l: c.left, r: c.left + CARD_W, t: c.top, b: c.top + cardH };
      const inFrame =
        box.l >= 0 && box.t >= 0 && box.r <= frame.w && box.b <= frame.h;
      if (!inFrame) continue;
      /* 容差 40px²：钉子 20×28=560，40 相当于"边缘蹭到 2px"。
         不给容差的话，巴黎/西班牙这种只差 1px 的邻居会把卡片逼到另一侧
         （实测西班牙的右侧位因为与巴黎钉重叠 1.1px 被否决，只好翻到左边
         又压住自己的标签，比蹭 1px 难看）。 */
      if (pins.some((p) => overlapArea(box, p) > 40)) continue;

      return { left: c.left, top: c.top };
    }

    /* 八处都不理想（钉贴边 + 邻居环绕）：选"压钉最少 + 离自己最近"的，
       最后夹进画框。这一步只为保证卡片不飞出画面，不追求完美。 */
    let best = candidates[0];
    let bestScore = Infinity;
    for (const c of candidates) {
      const box: Box = { l: c.left, r: c.left + CARD_W, t: c.top, b: c.top + cardH };
      const outX = Math.max(0, -box.l) + Math.max(0, box.r - frame.w);
      const outY = Math.max(0, -box.t) + Math.max(0, box.b - frame.h);
      let score = (outX * cardH + outY * CARD_W) * 2;
      for (const p of pins) score += overlapArea(box, p) * 3;
      score +=
        Math.hypot(box.l + CARD_W / 2 - ax, box.t + cardH / 2 - ay) * 0.3;
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }

    return {
      left: Math.min(Math.max(4, best.left), frame.w - CARD_W - 4),
      top: Math.min(Math.max(4, best.top), frame.h - cardH - 4),
    };
  })();

  return (
    <div
      className={`relative w-full ${className}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveId(null);
      }}
    >
      <div
        ref={frameRef}
        className="relative w-full select-none"
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setActiveId(null);
        }}
        onClick={(event) => {
          /* 触屏没有 hover，点击即展开/收起；命中统一走最近点 */
          const id = pickNearest(event.clientX, event.clientY);
          setActiveId((current) => (current === id ? null : id));
        }}
      >
        {/* ---- 地图本体：只有陆地点阵 ---- */}
        <svg
          viewBox={WORLD_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="block h-auto w-full"
        >
          <defs>
            <pattern
              id={DOT_ID}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1.5"
                cy="1.5"
                r="1.35"
                fill={INK_900}
                fillOpacity="0.52"
              />
            </pattern>
            <clipPath id={CLIP_ID}>
              <path d={WORLD_LAND_PATH} />
            </clipPath>
          </defs>

          <rect
            x="0"
            y="0"
            width={WORLD_MAP_WIDTH}
            height={WORLD_MAP_HEIGHT}
            fill={`url(#${DOT_ID})`}
            clipPath={`url(#${CLIP_ID})`}
          />

          {/* 集群虚线圈：只给带 clusterRadius 的站点（中国四省）。
              画在图钉之下，所以杭州那枚钉看起来正好落在圈里。 */}
          {offices.map((office) => {
            if (!office.clusterRadius) return null;
            const [x, y] = projectToMap(office.lon, office.lat);
            const isActive = activeId === office.id;
            return (
              <circle
                key={`ring-${office.id}`}
                cx={x}
                cy={y}
                r={office.clusterRadius}
                fill="none"
                stroke={ACCENT_600}
                strokeOpacity={isActive ? 0.7 : 0.4}
                strokeWidth={isActive ? 1.4 : 1}
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
                className="transition-all duration-200"
              />
            );
          })}
        </svg>

        {/* ---- 图钉（HTML，固定像素尺寸） ----
            外层负责"钉尖对齐坐标"，内层负责激活时的放大 ——
            两者都要用 transform，叠在一个元素上会互相覆盖。 */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {offices.map((office) => {
            if (office.clusterRadius) return null; /* 集群只画圈，见顶部注释 */
            const { left, top } = toPercent(office);
            const isActive = activeId === office.id;

            return (
              <span
                key={`pin-${office.id}`}
                className="absolute h-[20px] w-[14px] md:h-[28px] md:w-[20px]"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <span
                  className={`block h-full w-full origin-bottom transition-transform duration-200 ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                >
                  <PinMark dim={activeId !== null && !isActive} />
                </span>
              </span>
            );
          })}
        </div>

        {/* ---- 文字标签（HTML，字号锁 11px） ----
            只在 lg 以上出。
            【为什么】地图横向随容器压缩，图钉与字号却是固定像素 ——
            窄屏下东南亚三点（缅甸 6.5 经度 / 老挝 / 柬埔寨）会挤到
            「标签必然压到邻居图钉」的地步。脚本按投影算过：896px 是
            干净的下限（= lg 断点的容器内容宽），再窄就撞。
            窄屏只留图钉，名字靠点击后的信息卡给 —— 信息一点没丢。 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {offices.map((office) => {
            const { left, top } = toPercent(office);
            const { dx, dy } = labelShift(office);
            const anchor = office.labelAnchor ?? "start";
            const dim = activeId !== null && activeId !== office.id;

            return (
              <span
                key={`label-${office.id}`}
                className={`map-label absolute ${dim ? "opacity-35" : "opacity-100"}`}
                style={{
                  left: `calc(${left}% + ${dx}px)`,
                  top: `calc(${top}% + ${dy}px)`,
                  transform: `translate(${
                    anchor === "start" ? "0" : anchor === "end" ? "-100%" : "-50%"
                  }, -50%)`,
                }}
              >
                {office.label}
              </span>
            );
          })}
        </div>

        {/* ---- 键盘入口：按钮只服务 Tab/Enter，不参与指针命中 ---- */}
        {offices.map((office) => {
          const { left, top } = toPercent(office);
          const isActive = activeId === office.id;

          return (
            <button
              key={`hit-${office.id}`}
              type="button"
              aria-label={`${office.name} — ${office.roles
                .map((role) => ROLE_LABEL[role])
                .join(" · ")}`}
              aria-expanded={isActive}
              /* pointer-events-none 不能去掉：命中交给图面的最近点算法，
                 留着可点会把东南亚三点互相盖住的老问题带回来。
                 Tab 聚焦不受 pointer-events 影响，键盘仍可达。 */
              onFocus={() => setActiveId(office.id)}
              style={{ left: `${left}%`, top: `${top}%` }}
              className="pointer-events-none absolute z-20 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950"
            />
          );
        })}

        {/* ---- 信息卡（桌面：贴钉弹出） ----
            位置由上面的 cardPos 算法给出（首次适配：右→左→上→下→斜角，
            取第一个不压邻居图钉且不出画框的）。
            地图太小（手机）时 cardPos 返回 null，改走下方流内那张。 */}
        {active && cardPos ? (
          <div
            role="dialog"
            aria-label={`${active.name} details`}
            className="absolute z-30 hidden border border-ink-900/14 bg-paper shadow-[0_12px_32px_-14px_rgba(27,26,23,0.4)] md:block"
            style={{ width: CARD_W, left: cardPos.left, top: cardPos.top }}
            /* 卡片自己吃掉点击，否则冒泡到图面又跑一次最近点、把卡关掉 */
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-3.5 py-3">
              <p className="text-[15px] font-medium leading-snug tracking-tight text-ink-950">
                {active.name}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-400">
                {active.roles.map((role) => ROLE_LABEL[role]).join(" · ")}
              </p>
              {active.note ? (
                <p className="mt-1.5 border-t border-ink-900/10 pt-1.5 text-[12px] leading-snug text-ink-600">
                  {active.note}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* ---- 信息卡（手机：流内排在地图下方，不覆盖地图） ----
          只画一条上边线：地图这一版没有外框，四条边的卡片会像"贴上去的补丁"。 */}
      {active ? (
        <div
          role="dialog"
          aria-label={`${active.name} details`}
          className="mt-1 border-t border-ink-900/12 px-1 py-3 md:hidden"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[14px] font-medium tracking-tight text-ink-950">
              {active.name}
            </p>
            <p className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-ink-400">
              {active.roles.map((role) => ROLE_LABEL[role]).join(" · ")}
            </p>
          </div>
          {active.note ? (
            <p className="mt-1 text-[11px] leading-snug text-ink-600">
              {active.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
