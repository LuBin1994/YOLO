"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageUploader from "./ImageUploader";
import type { Page, PageSection } from "@/lib/supabase/types";

interface PageFormProps {
  page: Page;
}

const SECTION_OPTIONS: { value: PageSection["type"]; label: string }[] = [
  { value: "heading", label: "标题" },
  { value: "paragraph", label: "段落" },
  { value: "image", label: "图片" },
  { value: "gallery", label: "图集" },
];

function newSection(type: PageSection["type"]): PageSection {
  switch (type) {
    case "heading":
      return { type, content: "新标题" };
    case "paragraph":
      return { type, content: "新段落文字..." };
    case "image":
      return { type, content: "", caption: "" };
    case "gallery":
      return { type, content: [] };
  }
}

/**
 * 页面内容编辑器：hero 图 + sections 富文本块管理。
 */
export default function PageForm({ page }: PageFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(page.title);
  const [heroImage, setHeroImage] = useState<string[]>(
    page.hero_image ? [page.hero_image] : []
  );
  const [sections, setSections] = useState<PageSection[]>(page.sections);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSection(index: number, patch: Partial<PageSection>) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? ({ ...s, ...patch } as PageSection) : s))
    );
  }

  function changeType(index: number, type: PageSection["type"]) {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? newSection(type) : s))
    );
  }

  function removeSection(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSection(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          hero_image: heroImage[0] ?? null,
          sections,
          published: true,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "保存失败。");

      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败。");
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full border border-ink-900/15 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-forest-600";
  const labelCls = "mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-ink-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Hero */}
      <section className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
          头部大图
        </p>
        <div>
          <label htmlFor="p-title" className={labelCls}>标题 *</label>
          <input
            id="p-title"
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <p className={labelCls}>头部大图</p>
          <ImageUploader
            images={heroImage}
            onChange={(imgs) => setHeroImage(imgs.slice(0, 1))}
            folder={`pages/${page.slug}`}
            multiple={false}
          />
        </div>
      </section>

      {/* Sections */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
            内容块
          </p>
          <div className="flex items-center gap-2">
            {SECTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSections((prev) => [...prev, newSection(opt.value)])}
                className="border hairline px-2.5 py-1 text-xs text-ink-600 transition-colors hover:border-forest-600 hover:text-forest-700"
              >
                + {opt.label}
              </button>
            ))}
          </div>
        </div>

        {sections.length === 0 ? (
          <p className="border hairline bg-white/60 px-4 py-8 text-center text-sm text-ink-400">
            暂无内容块，点击上方按钮添加标题、段落或图片。
          </p>
        ) : null}

        {sections.map((section, i) => (
          <div key={i} className="border hairline bg-white/70 p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={section.type}
                  onChange={(e) =>
                    changeType(i, e.target.value as PageSection["type"])
                  }
                  className="border border-ink-900/15 bg-white px-2 py-1.5 text-xs"
                  aria-label="Section type"
                >
                  {SECTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-ink-400">块 {i + 1}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => moveSection(i, -1)}
                  disabled={i === 0}
                  className="text-xs text-ink-400 hover:text-ink-900 disabled:opacity-30"
                  aria-label="上移"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(i, 1)}
                  disabled={i === sections.length - 1}
                  className="text-xs text-ink-400 hover:text-ink-900 disabled:opacity-30"
                  aria-label="下移"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>

            {section.type === "heading" || section.type === "paragraph" ? (
              <textarea
                rows={section.type === "paragraph" ? 4 : 2}
                value={section.content}
                onChange={(e) => updateSection(i, { content: e.target.value })}
                className={`${inputCls} resize-y`}
              />
            ) : null}

            {section.type === "image" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-sand-100">
                    {typeof section.content === "string" && section.content ? (
                      <Image
                        src={section.content}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <input
                    className={inputCls}
                    value={typeof section.content === "string" ? section.content : ""}
                    onChange={(e) => updateSection(i, { content: e.target.value })}
                    placeholder="图片地址（或通过存储上传）"
                  />
                </div>
                <div className="sm:w-1/2">
                  <ImageUploader
                    images={
                      typeof section.content === "string" && section.content
                        ? [section.content]
                        : []
                    }
                    onChange={(imgs) =>
                      updateSection(i, { content: imgs[0] ?? "" })
                    }
                    folder={`pages/${page.slug}`}
                    multiple={false}
                  />
                </div>
                <input
                  className={inputCls}
                  value={section.caption ?? ""}
                  onChange={(e) => updateSection(i, { caption: e.target.value })}
                  placeholder="说明文字（可选）"
                />
              </div>
            ) : null}

            {section.type === "gallery" ? (
              <ImageUploader
                images={Array.isArray(section.content) ? section.content : []}
                onChange={(imgs) => updateSection(i, { content: imgs })}
                folder={`pages/${page.slug}`}
              />
            ) : null}
          </div>
        ))}
      </section>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <div className="flex items-center gap-4 border-t hairline pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "保存中..." : "保存页面"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/pages")}
          className="btn-ghost text-sm"
        >
          取消
        </button>
      </div>
    </form>
  );
}
