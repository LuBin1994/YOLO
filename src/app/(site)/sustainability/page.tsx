import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CmsPage from "@/components/site/CmsPage";
import { getPage } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "GOTS organic cotton, recycled fibers, closed-loop water recycling and solar-powered production. Our commitment to a cleaner supply chain.",
};

export default async function SustainabilityPage() {
  const page = await getPage("sustainability");
  if (!page) notFound();
  return <CmsPage page={page} />;
}
