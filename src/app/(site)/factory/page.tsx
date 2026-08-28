import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CmsPage from "@/components/site/CmsPage";
import { getPage } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Our Factory",
  description:
    "Visit our vertically integrated factories across Southeast Asia — sewing floors, dye houses and QC labs under one roof.",
};

export default async function FactoryPage() {
  const page = await getPage("factory");
  if (!page) notFound();
  return <CmsPage page={page} />;
}
