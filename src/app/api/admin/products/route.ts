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
    /* 分类现在来自 yolo.categories，必须选一个真实存在的 slug；
       写死默认值（原来的 "apparel"）会立刻撞外键。 */
    const category = String(body.category ?? "").trim();
    if (!category) {
      return NextResponse.json({ error: "请选择分类。" }, { status: 400 });
    }
    const images = Array.isArray(body.images)
      ? body.images.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];
    const materials = Array.isArray(body.materials)
      ? body.materials.filter((s: unknown) => typeof s === "string" && s.length > 0)
      : [];
    /* 氛围图是独立字段，绝不能并进 images —— 它只供首页图墙用，
       详情页图集只读 images/cover_image。空串统一存 null 便于 where is not null 查询。 */
    const moodImage = String(body.mood_image ?? "").trim() || null;

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
      .insert({ ...row, mood_image: moodImage })
      .select("id")
      .single();

    /* 过渡期兼容：add-mood-image.sql 还没执行时，
       写未知列报 PGRST204（读未知列才是 42703）。退回不含该字段的写入，
       后台不至于整块不能保存（此时氛围图当然也存不进去）。 */
    if (result.error?.code === "PGRST204" || result.error?.code === "42703") {
      console.warn(
        "[admin/products] mood_image 列不存在，已跳过；请先执行 supabase/add-mood-image.sql"
      );
      result = await supabase.from("products").insert(row).select("id").single();
    }
    const { data, error } = result;

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
