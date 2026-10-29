import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import JsonLd from "@/components/site/JsonLd";
import { ORGANIZATION_JSON_LD, WEBSITE_JSON_LD } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_NAME = "YOLO APPAREL PTE. LTD.";
const DESCRIPTION =
  "Vertically integrated apparel manufacturer with 16+ own factories across China, Cambodia, Laos, Myanmar and Egypt — down, padded outerwear and jackets for international brands.";

export const metadata: Metadata = {
  /* metadataBase 让所有相对路径（canonical / og:image）自动补成绝对地址；
     不设它时 Next 会警告，且分享卡可能取不到图 */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Apparel Manufacturing, Vertically Integrated`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  category: "manufacturing",

  /* 抓取策略：允许大图预览与长摘要，B2B 站的高质量摘要比缩略更值钱 */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: `${SITE_NAME} — Apparel Manufacturing, Vertically Integrated`,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "YOLO APPAREL production floor",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Apparel Manufacturing`,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },

  alternates: { canonical: "/" },

  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/logo.png", sizes: "512x512" }],
  },

  /* 关掉电话号码自动识别：页面上的 +84 号码在 iOS 上会被蓝链化，打断排版 */
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f0",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* 兜底：JS 未启用/加载失败时，滚动揭示的初始隐藏态会把内容永久藏住 */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Vercel Web Analytics：隐私友好的访客数据追踪 */}
        <Analytics />
        {/* 全站结构化数据：组织 + 站点，页面级面包屑另在各页注入 */}
        <JsonLd data={[ORGANIZATION_JSON_LD, WEBSITE_JSON_LD]} />
      </body>
    </html>
  );
}
