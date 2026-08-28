"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteButtonProps {
  endpoint: string;
  confirmText: string;
  onDeleted?: () => void;
}

/**
 * 通用删除按钮：调用 DELETE API，二次确认。
 */
export default function DeleteButton({
  endpoint,
  confirmText,
  onDeleted,
}: DeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmText)) return;
    setDeleting(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      onDeleted?.();
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
    >
      {deleting ? "删除中..." : "删除"}
    </button>
  );
}
