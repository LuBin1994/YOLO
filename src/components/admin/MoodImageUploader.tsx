"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/supabase/storage";

interface MoodImageUploaderProps {
  /** 当前氛围图 URL（null = 未设置） */
  value: string | null;
  onChange: (url: string | null) => void;
  /** 桶内目录，如 products/<slug>/mood */
  folder: string;
}

/**
 * 氛围图上传：**单图、替换式**。
 *
 * 【为什么不复用 ImageUploader】
 * 那个组件是为「商品图集」做的：追加而非替换、第一张标"封面"、能"设为封面"、
 * 比例固定 4:5。氛围图是一张独立的场景图，这些语义全是错的。
 * 单独做一只读 `mood_image` 字段的控件，也保证它**永远不会并进 images 数组**
 * —— 那样详情页图集就会多出一张不该出现的图。
 *
 * 【比例用 4:3】氛围图多是横构图/场景照，用竖版 4:5 会把主体切掉；
 * 预览只是给后台看，前台跑马灯里的裁切由 ImageMarquee 统一处理。
 */
export default function MoodImageUploader({
  value,
  onChange,
  folder,
}: MoodImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full max-w-[320px] overflow-hidden border border-ink-900/10 bg-sand-100">
        {value ? (
          <Image
            src={value}
            alt="氛围图预览"
            fill
            sizes="320px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[13px] text-ink-400">
            尚未上传氛围图
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-outline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? "上传中..." : value ? "更换氛围图" : "+ 上传氛围图"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[13px] text-red-600 transition-colors hover:text-red-700"
          >
            移除
          </button>
        ) : null}
      </div>

      {error ? <p className="text-[15px] text-red-600">{error}</p> : null}
      <p className="text-[13px] leading-relaxed text-ink-400">
        氛围图只在<b className="font-medium text-ink-600">首页滚动图组</b>里使用，整格可点进该商品详情；
        <b className="font-medium text-ink-600">不会出现在商品详情页的图集里</b>。
        上传目录 yolo/{folder}，单张最大 10MB。
      </p>
    </div>
  );
}
