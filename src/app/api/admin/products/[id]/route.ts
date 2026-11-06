import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/products/[id] — 更新产品
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

    const slug = String(body.slug ?? "").trim() || slugify(title);
    const images = Array.isArray(body.images)
      ? body.images.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];
    const materials = Array.isArray(body.materials)
      ? body.materials.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];
    /* 空串存 null：删掉氛围图时该商品自动退出首页图墙 */
    const moodImage = String(body.mood_image ?? "").trim() || null;

    const { supabase } = ctx;
    // slug 冲突检查（排除自身）
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: `别名「${slug}」已存在。` },
        { status: 409 }
      );
    }

    /* 分类必须来自 yolo.categories（外键保证），不允许留空或写死默认值 */
    const category = String(body.category ?? "").trim();
    if (!category) {
      return NextResponse.json({ error: "请选择分类。" }, { status: 400 });
    }

    const row = {
      title,
      slug,
      description: String(body.description ?? "").trim() || null,
      category,
      images,
      cover_image: String(body.cover_image ?? "").trim() || images[0] || null,
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
    };

    let result = await supabase
      .from("products")
      .update({ ...row, mood_image: moodImage })
      .eq("id", id);

    /* 过渡期兼容：见 POST 路由同段注释（写未知列 PGRST204 / 读未知列 42703） */
    if (result.error?.code === "PGRST204" || result.error?.code === "42703") {
      console.warn(
        "[admin/products] mood_image 列不存在，已跳过；请先执行 supabase/add-mood-image.sql"
      );
      result = await supabase.from("products").update(row).eq("id", id);
    }
    const { error } = result;

    if (error) {
      console.error("[admin/products] update:", error.message);
      return NextResponse.json(
        { error: "更新产品失败。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "请求无效。" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/products/[id] — 删除产品
 */
export async function DELETE(_request: Request, { params }: Params) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase } = ctx;

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("[admin/products] delete:", error.message);
    return NextResponse.json({ error: "删除产品失败。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
