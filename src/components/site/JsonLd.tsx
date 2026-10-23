/**
 * 结构化数据注入。
 *
 * 用原生 <script type="application/ld+json">，不走 next/script：
 * JSON-LD 必须出现在初始 HTML 里，异步注入的爬虫可能读不到。
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      // 内容是我们自己构造的对象，非用户输入
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
