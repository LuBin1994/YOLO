"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DeleteButton from "./DeleteButton";
import type { Inquiry, InquiryStatus } from "@/lib/supabase/types";

const STATUS_META: Record<InquiryStatus, { label: string; cls: string }> = {
  new: { label: "新询盘", cls: "bg-moss-500/15 text-moss-600" },
  read: { label: "已读", cls: "bg-amber-500/15 text-amber-600" },
  replied: { label: "已回复", cls: "bg-forest-700/10 text-forest-700" },
};

interface InquiryListProps {
  inquiries: Inquiry[];
}

/**
 * 询盘列表：展开详情、状态流转、删除。
 */
export default function InquiryList({ inquiries }: InquiryListProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: InquiryStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("更新失败");
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "更新失败");
    } finally {
      setUpdating(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-3">
      {inquiries.length === 0 ? (
        <div className="border hairline bg-white/60 px-6 py-16 text-center">
          <p className="text-sm text-ink-400">
            暂无询盘。访客提交联系表单后会显示在这里。
          </p>
        </div>
      ) : null}

      {inquiries.map((inq) => {
        const meta = STATUS_META[inq.status];
        const isOpen = expanded === inq.id;
        return (
          <div
            key={inq.id}
            className="border hairline bg-white/70 transition-colors hover:bg-white"
          >
            {/* 行头 */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : inq.id)}
              className="flex w-full items-center gap-4 px-5 py-4 text-left"
            >
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${meta.cls}`}
              >
                {meta.label}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink-900">
                  {inq.name}
                  <span className="ml-2 font-normal text-ink-400">
                    {inq.email}
                  </span>
                </span>
                <span className="block truncate text-xs text-ink-400">
                  {formatDate(inq.created_at)}
                </span>
              </span>
              <span className="text-xs text-ink-400">{isOpen ? "−" : "+"}</span>
            </button>

            {/* 详情 */}
            {isOpen ? (
              <div className="border-t hairline px-5 py-5">
                <div className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
                  <p className="text-ink-600">
                    <span className="text-xs uppercase tracking-wider text-ink-400">
                      电话
                    </span>
                    <br />
                    {inq.phone || "—"}
                  </p>
                  <p className="text-ink-600">
                    <span className="text-xs uppercase tracking-wider text-ink-400">
                      来源
                    </span>
                    <br />
                    {inq.source || "contact-form"}
                  </p>
                </div>
                <p className="mt-4 whitespace-pre-wrap rounded bg-sand-100/70 p-4 text-sm leading-relaxed text-ink-900">
                  {inq.message}
                </p>

                {/* 操作区 */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="text-[11px] uppercase tracking-wider text-ink-400">
                    标记为：
                  </span>
                  {(
                    [
                      ["new", "新询盘"],
                      ["read", "已读"],
                      ["replied", "已回复"],
                    ] as const
                  ).map(([status, label]) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updating === inq.id || inq.status === status}
                      onClick={() => updateStatus(inq.id, status)}
                      className={`border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        inq.status === status
                          ? "border-forest-700 bg-forest-700 text-white"
                          : "border-ink-900/15 text-ink-600 hover:border-forest-600 hover:text-forest-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <span className="ml-auto">
                    <DeleteButton
                      endpoint={`/api/admin/inquiries/${inq.id}`}
                      confirmText={`确定删除 ${inq.name} 的询盘？`}
                    />
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
