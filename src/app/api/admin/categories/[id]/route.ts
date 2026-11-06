import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  buildCategorySlug,
  collectDescendantIds,
  validateCategoryInput,
  type Category,
} from "@/lib/categories";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/categories/[id] — 更新分类
 *
 * 【为什么改 slug 不用自己搬产品】
 * products.category 上的外键是 `on update cascade`，改这里产品的分类会自动跟着改。
 * 代价是旧 slug 立刻失效，所以后台表单会提示"改别名会同步所有挂在此类下的产品"。
 */
export async function PUT(request: Request, { params }: Params) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const { id } = await params;
  const { supabase } = ctx;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const parsed = validateCategoryInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const value = parsed.value;

    /* 取全表（几十行）做两件事：环检测、拿父级 slug 拼子级 slug */
    const { data: rows, error: rowsError } = await supabase
      .from("categories")
      .select("id, parent_id, slug, name_zh, name_en, sort_order");
    if (rowsError || !rows) {
      return NextResponse.json({ error: "读取分类失败。" }, { status: 500 });
    }
    const all = rows as Category[];

    if (!all.some((c) => c.id === id)) {
      return NextResponse.json({ error: "分类不存在。" }, { status: 404 });
    }

    if (value.parent_id) {
      /* 不能把上级设成自己或自己的子孙，否则树会成环 */
      const doomed = collectDescendantIds(all, id);
      if (doomed.has(value.parent_id)) {
        return NextResponse.json(
          { error: "上级分类不能是自己或自己的下级。" },
          { status: 400 }
        );
      }
      if (!all.some((c) => c.id === value.parent_id)) {
        return NextResponse.json({ error: "上级分类不存在。" }, { status: 400 });
      }
    }

    const parentSlug = value.parent_id
      ? all.find((c) => c.id === value.parent_id)?.slug ?? null
      : null;
    const slug = value.slug || buildCategorySlug(value.name_en, parentSlug);
    if (!slug) {
      return NextResponse.json(
        { error: "英文名无法生成合法的别名，请手工填写。" },
        { status: 400 }
      );
    }

    const duplicate = all.find((c) => c.slug === slug && c.id !== id);
    if (duplicate) {
      return NextResponse.json(
        { error: `别名「${slug}」已被占用。` },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("categories")
      .update({ ...value, slug })
      .eq("id", id);

    if (error) {
      console.error("[admin/categories] update:", error.message);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `别名「${slug}」已被占用。` },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "保存分类失败。" }, { status: 500 });
    }

    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "请求无效。" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/categories/[id] — 删除分类
 * 有子分类或挂着产品时外键会拦住（23503），这里翻译成人类看得懂的话。
 */
export async function DELETE(_request: Request, { params }: Params) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const { id } = await params;

  try {
    const { error } = await ctx.supabase.from("categories").delete().eq("id", id);

    if (error) {
      if (error.code === "23503") {
        return NextResponse.json(
          { error: "该分类下还有子分类或产品，请先移走再删除。" },
          { status: 409 }
        );
      }
      console.error("[admin/categories] delete:", error.message);
      return NextResponse.json({ error: "删除失败。" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "请求无效。" }, { status: 400 });
  }
}
