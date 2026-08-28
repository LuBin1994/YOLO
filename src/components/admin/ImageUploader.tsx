"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/supabase/storage";

interface ImageUploaderProps {
  /** 当前图片 URL 列表（来自数据库） */
  images: string[];
  onChange: (images: string[]) => void;
  /** 存储目录，如 products/<slug> */
  folder: string;
  /** 是否支持多图 */
  multiple?: boolean;
}

/**
 * 图片上传组件：直传 Supabase Storage（media 存储桶）。
 * 支持多图、删除、标记封面（第一张）。
 */
export default function ImageUploader({
  images,
  onChange,
  folder,
  multiple = true,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const list = Array.from(files).slice(0, multiple ? 6 : 1);
      const urls = await Promise.all(list.map((f) => uploadImage(f, folder)));
      onChange([...images, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败。");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    // 封面约定为第一张，把目标图移到首位
    if (index === 0) return;
    const next = [...images];
    const [target] = next.splice(index, 1);
    next.unshift(target);
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-[4/5] overflow-hidden bg-sand-100">
            <Image
              src={src}
              alt={`Image ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
            {i === 0 ? (
              <span className="absolute left-2 top-2 bg-forest-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                封面
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              {i !== 0 ? (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  className="text-[11px] text-white hover:underline"
                >
                  设为封面
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="text-[11px] text-white hover:underline"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-outline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? "上传中..." : `+ 上传${multiple ? "图片" : "图片"}`}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-ink-400">
        已上传至 Supabase 存储（media/{folder}）。第一张为封面，单张最大
        10MB。
      </p>
    </div>
  );
}
