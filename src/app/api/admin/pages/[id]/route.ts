import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import type { PageSection } from "@/lib/supabase/types";

interface Params {
  params: Promise<{ id: string }>;
}

const SECTION_TYPES = ["heading", "paragraph", "image", "gallery"] as const;

function sanitizeSections(value: unknown): PageSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
    .map((s) => {
      const type = SECTION_TYPES.includes(s.type as never)
        ? (s.type as PageSection["type"])
        : "paragraph";
      const content = Array.isArray(s.content)
        ? s.content.filter((x): x is string => typeof x === "string")
        : typeof s.content === "string"
          ? s.content
          : "";
      return { type, content, caption: typeof s.caption === "string" ? s.caption : undefined } as PageSection;
    });
}

/**
 * PUT /api/admin/pages/[id] — 更新页面内容
 */
export async function PUT(request: Request, { params }: Params) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "标题不能为空。" }, { status: 400 });
    }

    const { supabase } = ctx;
    const { error } = await supabase
      .from("pages")
      .update({
        title,
        hero_image: String(body.hero_image ?? "").trim() || null,
        sections: sanitizeSections(body.sections),
        published: body.published === undefined ? true : Boolean(body.published),
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/pages] update:", error.message);
      return NextResponse.json({ error: "保存页面失败。" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "请求无效。" }, { status: 400 });
  }
}
