import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "新建产品 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminProductNewPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, parent_id, slug, name_zh, name_en, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        eyebrow="产品目录"
        title="新建产品"
        description="填写产品信息并发布，前台产品页会即时更新。"
      />
      <div className="mt-10">
        <ProductForm categories={(categories ?? []) as Category[]} />
      </div>
    </div>
  );
}
