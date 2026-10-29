import type { Metadata } from "next";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import AiConcierge from "@/components/site/AiConcierge";

/**
 * 前台站点布局：Header + Footer 包裹所有公开页面。
 *
 * AI 客服挂在这里而不是根布局：后台（/admin）是内部工作台，
 * 不需要也不应该出现对外的客服入口。
 */
export const metadata: Metadata = {
  title: {
    default: "YOLO APPAREL PTE. LTD.",
    template: "%s | YOLO APPAREL PTE. LTD.",
  },
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AiConcierge />
    </div>
  );
}
