import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryForm from "@/components/admin/CategoryForm";
import type { Category } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "编辑分类 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminCategoryEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [all, current] = await Promise.all([
    supabase
      .from("categories")
      .select("id, parent_id, slug, name_zh, name_en, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("categories")
      .select("id, parent_id, slug, name_zh, name_en, sort_order")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!current.data) notFound();

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        eyebrow="产品目录"
        title="编辑分类"
        description="改上级或别名会影响挂在下面的产品，保存前请确认。"
      />
      <div className="mt-10">
        <CategoryForm
          category={current.data as Category}
          categories={(all.data ?? []) as Category[]}
        />
      </div>
    </div>
  );
}
