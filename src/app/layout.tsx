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
    default: "Meridian Apparel Group — Apparel Manufacturing in Southeast Asia",
    template: "%s | Meridian Apparel Group",
  },
  description:
    "Vertically integrated apparel manufacturer in Southeast Asia. Sustainable materials, full supply chain control, B2B wholesale programs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        {/* Vercel Web Analytics：隐私友好的访客数据追踪 */}
        <Analytics />
      </body>
    </html>
  );
}
