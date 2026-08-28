import type { Metadata } from "next";
import ProductBrowser from "@/components/site/ProductBrowser";
import { getProducts } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore our apparel styles — organic cotton basics, knitwear, denim, woven shirts and performance outerwear. Customization and private label available.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="pt-24 md:pt-32">
      <section className="container-site pb-14">
        <p className="text-[11px] uppercase tracking-[0.28em] text-forest-600">
          Product Catalog
        </p>
        <h1 className="display-lg mt-4 max-w-3xl">Styles built for programs.</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-600">
          Every style can be customized — fabric, trims, labels and packaging.
          Minimums from 300 pieces per colorway.
        </p>
      </section>

      <section className="container-site pb-24 md:pb-32">
        <ProductBrowser products={products} />
      </section>
    </div>
  );
}
