import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
        内容 · /{page.slug}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        编辑：{page.title}
      </h1>
      <div className="mt-10">
        <PageForm page={page} />
      </div>
    </div>
  );
}
