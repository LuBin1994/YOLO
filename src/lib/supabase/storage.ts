"use client";

import { createClient } from "./client";

/**
 * Supabase Storage 媒体工具
 * 所有前后台图片必须经由此处上传/读取，严禁依赖本地文件系统。
 *
 * 存储桶：media（公开读）
 * 目录约定：media/products/<slug>/  media/pages/<slug>/
 */

export const MEDIA_BUCKET = "media";

function publicUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** 上传单个图片文件，返回公开 URL；失败抛错 */
export async function uploadImage(
  file: File,
  folder: string,
  fileName?: string
): Promise<string> {
  const supabase = createClient();

  const safeName = (fileName ?? file.name).toLowerCase().replace(/[^a-z0-9.\-_]/g, "-");
  const uniqueName = `${Date.now()}-${safeName}`;
  const path = `${folder.replace(/^\/+|\/+$/g, "")}/${uniqueName}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { upsert: false, cacheControl: "31536000" });

  if (error) throw new Error(`上传失败：${error.message}`);

  return publicUrl(path);
}

/** 批量上传（如产品图集） */
export async function uploadImages(
  files: File[],
  folder: string
): Promise<string[]> {
  return Promise.all(files.map((f) => uploadImage(f, folder)));
}

/** 删除对象（返回是否成功，对象不存在视为成功） */
export async function deleteImage(pathOrUrl: string): Promise<void> {
  const supabase = createClient();
  const path = pathOrUrl.includes(`${MEDIA_BUCKET}/`)
    ? decodeURIComponent(pathOrUrl.split(`${MEDIA_BUCKET}/`)[1] ?? "")
    : pathOrUrl;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error && error.message !== "The resource was not found") {
    throw new Error(`删除失败：${error.message}`);
  }
}

/** 根据公开 URL 反解存储路径（供删除/替换用） */
export function urlToPath(publicUrlOrPath: string): string {
  return decodeURIComponent(publicUrlOrPath.split(`${MEDIA_BUCKET}/`)[1] ?? "");
}
