import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "新建产品 | 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminProductNewPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
        产品目录
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        新建产品
      </h1>
      <div className="mt-10">
        <ProductForm />
      </div>
    </div>
  );
}
