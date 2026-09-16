import type { Metadata } from "next";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import InquiryList from "@/components/admin/InquiryList";
import { createClient } from "@/lib/supabase/server";
import { endOfDayISO, isDateInput, startOfDayISO } from "@/lib/datetime";

export const metadata: Metadata = {
  title: "询盘管理 | 管理后台",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** 每页条数 */
const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{
    q?: string;
    page?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function AdminInquiriesPage({ searchParams }: Props) {
  const { q = "", page = "1", from = "", to = "" } = await searchParams;
  const keyword = q.trim();

  /* 时间段：非法格式直接忽略，而不是拿它去查询 */
  let fromDate = isDateInput(from) ? from : "";
  let toDate = isDateInput(to) ? to : "";
  /* 起止写反了就自动纠正，省得查出空结果还以为是没数据 */
  if (fromDate && toDate && fromDate > toDate) {
    [fromDate, toDate] = [toDate, fromDate];
  }

  const parsedPage = Number.parseInt(page, 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const fromRow = (requestedPage - 1) * PAGE_SIZE;
  const toRow = fromRow + PAGE_SIZE - 1;

  const supabase = await createClient();

  let listQuery = supabase
    .from("inquiries")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (keyword) {
    /* PostgREST 的 or 语法里逗号、括号、反斜杠都是分隔/转义符，
       关键词里带上它们会把过滤条件解析坏，先替换成空格 */
    const safe = keyword.replace(/[,()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (safe) {
      const like = `%${safe}%`;
      listQuery = listQuery.or(
        `name.ilike.${like},email.ilike.${like},phone.ilike.${like},message.ilike.${like}`
      );
    }
  }

  /* 日期按 UTC+8 的整天边界换算成绝对时间戳，避免漏掉当天早/晚的提交 */
  const fromISO = fromDate ? startOfDayISO(fromDate) : null;
  const toISO = toDate ? endOfDayISO(toDate) : null;
  if (fromISO) listQuery = listQuery.gte("created_at", fromISO);
  if (toISO) listQuery = listQuery.lte("created_at", toISO);

  /* 列表 + 各状态总数并行拉取；状态计数走 head:true，只取 count 不取行 */
  const [listResult, newResult, readResult, repliedResult] = await Promise.all([
    listQuery.range(fromRow, toRow),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "read"),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "replied"),
  ]);

  const counts = {
    new: newResult.count ?? 0,
    read: readResult.count ?? 0,
    replied: repliedResult.count ?? 0,
  };

  const total = listResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  /* 页码越界（比如筛选后总数变少）时收敛到最后一页 */
  const currentPage = Math.min(requestedPage, totalPages);

  return (
    <div>
      <AdminPageHeader
        eyebrow="询盘"
        title="询盘管理"
        description="查看并回复来自官网联系表单的客户询盘。"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "新询盘", value: counts.new, dot: "bg-ink-400" },
          { label: "已读", value: counts.read, dot: "bg-amber-500" },
          { label: "已回复", value: counts.replied, dot: "bg-moss-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between border border-ink-900/8 bg-white px-6 py-5"
          >
            <span className="flex items-center gap-2.5 text-sm text-ink-600">
              <span className={`inline-block h-2 w-2 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            <span className="text-2xl font-medium tracking-tight text-ink-950">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <InquiryList
          inquiries={listResult.data ?? []}
          total={total}
          page={currentPage}
          pageSize={PAGE_SIZE}
          keyword={keyword}
          fromDate={fromDate}
          toDate={toDate}
        />
      </div>
    </div>
  );
}
