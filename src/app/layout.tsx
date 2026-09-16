import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "YOLO APPAREL PTE. LTD. — Apparel Manufacturing in Southeast Asia",
    template: "%s | YOLO APPAREL PTE. LTD.",
  },
  description:
    "Vertically integrated apparel manufacturer in Southeast Asia. Sustainable materials, full supply chain control, B2B wholesale programs.",
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
      </body>
    </html>
  );
}
