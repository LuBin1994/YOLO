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

/** 产品分类中文标签（数据存英文，后台展示中文） */
export const CATEGORY_LABELS: Record<string, string> = {
  apparel: "服装",
  knit: "针织",
  woven: "梭织",
  denim: "牛仔",
  outerwear: "外套",
  other: "其他",
};

export function categoryLabel(value: string): string {
  return CATEGORY_LABELS[value] ?? value;
}

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
