import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "编辑产品 | 管理后台",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminProductEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
        产品目录
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        编辑：{product.title}
      </h1>
      <div className="mt-10">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
