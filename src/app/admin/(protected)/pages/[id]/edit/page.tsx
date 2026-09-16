import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PageForm from "@/components/admin/PageForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "编辑内容 | 管理后台",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPageEditPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!page) notFound();

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        eyebrow={`内容 · /${page.slug}`}
        title={`编辑：${page.title}`}
        description="编辑页面富文本内容，保存后前台即时生效。"
      />
      <div className="mt-10">
        <PageForm page={page} />
      </div>
    </div>
  );
}
