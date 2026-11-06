"use client";

import { createClient } from "./client";

/**
 * Supabase Storage 媒体工具
 * 所有前后台图片必须经由此处上传/读取，严禁依赖本地文件系统。
 *
 * 存储桶：**yolo**（公开读；2026-11-06 从 media 改名）
 * 目录约定：yolo/products/<slug>/
 *
 * 【桶名为什么改成 yolo】
 * 与数据库 schema、项目名对齐，Supabase 里一眼能看出这些文件属于这个站，
 * 不会和同账号下别的项目的 media 桶混淆。
 *
 * 【注意别和 `/media/...` 搞混】仓库里的 `public/media/` 是 Next 的静态资源
 * （产品图、首页视频等，随代码发布），跟这里的对象存储毫无关系。
 */

export const MEDIA_BUCKET = "yolo";

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

/**
 * 从「公开 URL」或「桶内路径」里取出桶内路径。
 *
 * 【为什么要按 /object/ 分段找，而不是 split 桶名】
 * 桶名改成 yolo 之后，`.../object/public/yolo/products/a.jpg` 里的 "yolo"
 * 只出现一次还好说，但对象名本身也可能含同样的词（如 products/yolo-2026/…），
 * 简单 split 会切到错的位置。按 storage 的 URL 结构定位才稳。
 * 同时兼容旧桶名（media）留下的老 URL，避免历史数据删不掉。
 */
function toStoragePath(publicUrlOrPath: string): string {
  /* 去掉 query/hash：签名 URL 带 ?token=…，不剥掉会当成对象名的一部分 */
  const clean = publicUrlOrPath.split("?")[0].split("#")[0];
  const marker = clean.match(/\/object\/(?:public|sign|authenticated)\/[^/]+\/(.+)$/);
  if (marker) return decodeURIComponent(marker[1]);
  return decodeURIComponent(clean.replace(new RegExp(`^${MEDIA_BUCKET}/`), ""));
}

/** 删除对象（返回是否成功，对象不存在视为成功） */
export async function deleteImage(pathOrUrl: string): Promise<void> {
  const supabase = createClient();
  const path = toStoragePath(pathOrUrl);

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error && error.message !== "The resource was not found") {
    throw new Error(`删除失败：${error.message}`);
  }
}

/** 根据公开 URL 反解存储路径（供删除/替换用） */
export function urlToPath(publicUrlOrPath: string): string {
  return toStoragePath(publicUrlOrPath);
}
