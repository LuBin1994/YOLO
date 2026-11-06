import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "编辑产品 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("categories")
      .select("id, parent_id, slug, name_zh, name_en, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        eyebrow="产品目录"
        title={`编辑：${product.title}`}
        description="修改后保存，前台产品页会即时更新。"
      />
      <div className="mt-10">
        <ProductForm product={product} categories={(categories ?? []) as Category[]} />
      </div>
    </div>
  );
}
