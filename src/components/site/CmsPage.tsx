import PageContent from "./PageContent";
import PageHero from "./PageHero";
import type { Page } from "@/lib/supabase/types";

/**
 * 内容型页面骨架：PageHero 大图头 + 富文本内容。
 * 用于工厂介绍 / 绿色理念 / 社会责任。
 */
export default function CmsPage({ page }: { page: Page }) {
  return (
    <>
      <PageHero title={page.title} image={page.hero_image} />

      <section className="container-site section-pad">
        <PageContent sections={page.sections} />
      </section>
    </>
  );
}
