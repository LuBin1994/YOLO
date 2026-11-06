/** slug 生成：小写、空格转连字符、去特殊字符（纯函数，可在客户端使用） */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/* 产品分类的标签已随分类表迁走（2026-11-06）：
   后台显示中文名、前台显示英文名，都从 yolo.categories 读，见 src/lib/categories.ts。
   这里只保留与设备类型有关的常量。 */

/** 设备类型中文标签 */
export const DEVICE_LABELS: Record<string, string> = {
  desktop: "桌面端",
  mobile: "移动端",
  tablet: "平板",
  other: "其他",
  unknown: "未知",
};

export function deviceLabel(value: string): string {
  return DEVICE_LABELS[value] ?? value;
}
