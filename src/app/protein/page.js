import Navbar from "../component/Navbar";
import { ShopCatalog } from "../shop/ShopUi";
import { getShopPageData } from "../../lib/catalog";
import { getStorefrontMode } from "../../lib/storefront";
import { getOffers } from "../data/actions";

export const metadata = {
  title: "High Protein Products | Aurum Bites",
  description: "Browse our curated selection of high-protein dairy, cheese, and pantry essentials.",
};

export default async function ProteinPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const brandHandle = resolvedSearchParams?.brand || "all";
  const productTypeHandle = resolvedSearchParams?.type || "all";

  const storefrontMode = getStorefrontMode();
  
  // Fetch shop data
  const [shopData, offers] = await Promise.all([
    getShopPageData({ collectionHandle: "all", brandHandle, productTypeHandle }),
    getOffers(),
  ]);

  // Filter products for "protein" (case-insensitive) in title, description, or ingredients
  const proteinProducts = shopData.products.filter(p => {
    const searchString = `${p.title} ${p.description} ${p.ingredients} ${p.productType}`.toLowerCase();
    return searchString.includes("protein");
  });

  // Re-build catalog object for Protein products
  const catalog = {
    ...shopData,
    products: proteinProducts,
    activeCollection: { title: "High Protein", handle: "protein" },
    offers,
  };

  const redirectParams = new URLSearchParams();
  if (brandHandle !== "all") {
    redirectParams.set("brand", brandHandle);
  }
  if (productTypeHandle !== "all") {
    redirectParams.set("type", productTypeHandle);
  }

  const redirectTo = redirectParams.toString()
    ? `/protein?${redirectParams.toString()}`
    : `/protein`;

  return (
    <>
      <Navbar />
      <main className="shop-page-bg">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-[#fcf8f1] to-[#f4ead5] border-b border-[#e9dfcf] pt-10 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
              Premium Collection
            </div>
            <h1 className="text-3xl font-bold text-[#9a7a3f] mb-3">High Protein Essentials</h1>
            <p className="text-neutral-600 max-w-2xl text-lg">
              Fuel your day with our specially curated selection of high-protein butter, cheese, and dairy products. Perfect for fitness enthusiasts and healthy lifestyles.
            </p>
          </div>
        </div>

        <section className="mx-auto max-w-7xl p-3 sm:px-6">
          <ShopCatalog
            initialCatalog={catalog}
            initialRedirectTo={redirectTo}
            storefrontMode={storefrontMode}
          />
        </section>
      </main>
    </>
  );
}
