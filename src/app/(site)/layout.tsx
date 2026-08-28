import type { Metadata } from "next";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

/**
 * 前台站点布局：Header + Footer 包裹所有公开页面。
 */
export const metadata: Metadata = {
  title: {
    default: "Meridian Apparel Group",
    template: "%s | Meridian Apparel Group",
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
    </div>
  );
}
