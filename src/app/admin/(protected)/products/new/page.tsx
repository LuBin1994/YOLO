import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "新建产品 | 管理后台",
  robots: { index: false, follow: false },
};

export default function AdminProductNewPage() {
  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        eyebrow="产品目录"
        title="新建产品"
        description="填写产品信息并发布，前台产品页会即时更新。"
      />
      <div className="mt-10">
        <ProductForm />
      </div>
    </div>
  );
}
