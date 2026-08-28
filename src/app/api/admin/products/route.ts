import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";

/**
 * POST /api/admin/products — 新建产品
 */
export async function POST(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "标题不能为空。" }, { status: 400 });
    }

    const slug = String(body.slug ?? "").trim() || slugify(title);
    const images = Array.isArray(body.images)
      ? body.images.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];
    const materials = Array.isArray(body.materials)
      ? body.materials.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];

    const { supabase } = ctx;
    // slug 冲突检查
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: `别名「${slug}」已存在。` },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        title,
        slug,
        description: String(body.description ?? "").trim() || null,
        category: String(body.category ?? "apparel").trim() || "apparel",
        images,
        cover_image:
          String(body.cover_image ?? "").trim() || images[0] || null,
        materials,
        moq: Number.isFinite(Number(body.moq)) && Number(body.moq) > 0
          ? Number(body.moq)
          : null,
        price_range: String(body.price_range ?? "").trim() || null,
        featured: Boolean(body.featured),
        published: body.published === undefined ? true : Boolean(body.published),
        sort_order: Number.isFinite(Number(body.sort_order))
          ? Number(body.sort_order)
          : 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[admin/products] insert:", error.message);
      return NextResponse.json(
        { error: "创建产品失败。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "请求无效。" }, { status: 400 });
  }
}
