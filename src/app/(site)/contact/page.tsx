import type { Metadata } from "next";
import ContactSection from "@/components/site/ContactSection";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Request a quote or start a program. Our export sales team responds within 24 hours.",
  alternates: { canonical: "/contact" },
};

interface Props {
  searchParams: Promise<{ product?: string }>;
}

export default async function ContactPage({ searchParams }: Props) {
  const { product } = await searchParams;

  return (
    <div className="pt-28 md:pt-36">
      <section className="container-site pb-24 md:pb-32">
        {/* 与首页共用同一份实现，这里用 h1（页面主标题） */}
        <ContactSection product={product} headingLevel="h1" />
      </section>
    </div>
  );
}
