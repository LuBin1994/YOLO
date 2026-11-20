import type { Metadata } from "next";
import HeroCollage from "@/components/site/HeroCollage";
import { HOME_REEL, HOME_REEL_INTRO } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Hero preview — collage",
  robots: { index: false, follow: false },
};

/**
 * Hero 原型预览：动态拼贴式（参照 Stridr）。
 *
 * 2026-11-20：中央超大标题 + 四周散落漂移的九张工序卡片。
 * 卡片缓慢漂移，hover 播放视频，点击打开弹层。
 */
export default function HeroCollagePreviewPage() {
  return (
    <main className="min-h-screen bg-paper">
      <HeroCollage clips={HOME_REEL} intro={HOME_REEL_INTRO} />
    </main>
  );
}
