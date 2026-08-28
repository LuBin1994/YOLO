import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import type { InquiryStatus } from "@/lib/supabase/types";

interface Params {
  params: Promise<{ id: string }>;
}

const STATUSES: InquiryStatus[] = ["new", "read", "replied"];

/**
 * PATCH /api/admin/inquiries/[id] — 更新询盘状态
 */
export async function PATCH(request: Request, { params }: Params) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const status = String(body.status ?? "");

    if (!STATUSES.includes(status as InquiryStatus)) {
      return NextResponse.json({ error: "无效状态。" }, { status: 400 });
    }

    const { supabase } = ctx;
    const { error } = await supabase
      .from("inquiries")
      .update({ status: status as InquiryStatus })
      .eq("id", id);

    if (error) {
      console.error("[admin/inquiries] update:", error.message);
      return NextResponse.json(
        { error: "更新询盘失败。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "请求无效。" }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/inquiries/[id] — 删除询盘
 */
export async function DELETE(_request: Request, { params }: Params) {
  const ctx = await requireAdmin();
  if (!ctx) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase } = ctx;

  const { error } = await supabase.from("inquiries").delete().eq("id", id);

  if (error) {
    console.error("[admin/inquiries] delete:", error.message);
    return NextResponse.json(
      { error: "删除询盘失败。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
