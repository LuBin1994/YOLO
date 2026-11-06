import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { buildCategorySlug, validateCategoryInput } from "@/lib/categories";

/**
 * POST /api/admin/categories — 新建分类
 *
 * 【slug 的生成规则】
 * 表单留空时由后端补：有父级就拼上前缀（`kids` + `jacket` → `kids-jacket`），
 * 没有父级就用英文名本身。保持与迁移前客户素材的命名一致。
 *
 * 【为什么这里只有这一个方法】
 * 路由文件只能导出 HTTP 方法与少量配置，公共校验放在 src/lib/categories.ts。
 */
export async function POST(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "未授权" }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = validateCategoryInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { supabase } = ctx;
    const value = parsed.value;

    /* 上级必须真实存在，而且拿它的 slug 来拼子级 slug */
    let parentSlug: string | null = null;
    if (value.parent_id) {
      const { data: parent } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("id", value.parent_id)
        .maybeSingle();
      if (!parent) {
        return NextResponse.json({ error: "上级分类不存在。" }, { status: 400 });
      }
      parentSlug = parent.slug;
    }

    const slug = value.slug || buildCategorySlug(value.name_en, parentSlug);
    if (!slug) {
      return NextResponse.json(
        { error: "英文名无法生成合法的别名，请手工填写。" },
        { status: 400 }
      );
    }

    const { data: duplicate } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (duplicate) {
      return NextResponse.json(
        { error: `别名「${slug}」已被占用。` },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({ ...value, slug })
      .select("id")
      .single();

    if (error) {
      console.error("[admin/categories] insert:", error.message);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `别名「${slug}」已被占用。` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "创建分类失败。" }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "请求无效。" }, { status: 400 });
  }
}
