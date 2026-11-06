import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import CategoryForm from "@/components/admin/CategoryForm";
import type { Category } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "新建分类 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoryNewPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, parent_id, slug, name_zh, name_en, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        eyebrow="产品目录"
        title="新建分类"
        description="上级留空就是顶级分类；层级不限，商品可以挂在任意一级。"
      />
      <div className="mt-10">
        <CategoryForm categories={(data ?? []) as Category[]} />
      </div>
    </div>
  );
}
