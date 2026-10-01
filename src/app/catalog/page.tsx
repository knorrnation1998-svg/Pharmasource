import { repository } from "@/lib/repository";
import CatalogClientView from "@/components/CatalogClientView";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  // Fetch products from your repository server-side
  const products = await repository.listProducts();

  return <CatalogClientView initialProducts={products} />;
}