import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CmsPage from "@/components/site/CmsPage";
import { getPage } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Social Responsibility",
  description:
    "Fair wages, dormitory housing, on-site clinics and community programs. How we care for our 3,800+ workers and the regions we operate in.",
};

export default async function ResponsibilityPage() {
  const page = await getPage("social-responsibility");
  if (!page) notFound();
  return <CmsPage page={page} />;
}
