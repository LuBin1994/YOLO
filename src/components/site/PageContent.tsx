import Image from "next/image";
import type { PageSection } from "@/lib/supabase/types";

/**
 * 渲染 pages.sections 富文本段落（heading / paragraph / image / gallery）。
 */
export default function PageContent({ sections }: { sections: PageSection[] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-10 md:space-y-14">
      {sections.map((section, i) => {
        switch (section.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="pt-4 text-2xl font-semibold tracking-tight md:text-3xl"
              >
                {section.content}
              </h2>
            );
          case "paragraph":
            return (
              <p
                key={i}
                className="text-base leading-relaxed text-ink-600 md:text-lg"
              >
                {section.content}
              </p>
            );
          case "image":
            return (
              <figure key={i}>
                <div className="frame aspect-[16/10]">
                  <Image
                    src={section.content}
                    alt={section.caption ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
                {section.caption ? (
                  <figcaption className="mt-3 text-xs tracking-wide text-ink-400">
                    {section.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "gallery":
            return (
              <div key={i} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {section.content.map((src, j) => (
                  <div key={`${src}-${j}`} className="frame aspect-[4/3]">
                    <Image
                      src={src}
                      alt={`Gallery image ${j + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
