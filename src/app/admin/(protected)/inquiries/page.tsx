import type { Metadata } from "next";
import InquiryList from "@/components/admin/InquiryList";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "询盘管理 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const counts = (inquiries ?? []).reduce(
    (acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1;
      return acc;
    },
    { new: 0, read: 0, replied: 0 } as Record<string, number>
  );

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-forest-600">
        询盘
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">询盘管理</h1>

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-ink-600">
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-moss-500" />
          新询盘: <b>{counts.new ?? 0}</b>
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
          已读: <b>{counts.read ?? 0}</b>
        </span>
        <span>
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-forest-700" />
          已回复: <b>{counts.replied ?? 0}</b>
        </span>
      </div>

      <div className="mt-8">
        <InquiryList inquiries={inquiries ?? []} />
      </div>
    </div>
  );
}
