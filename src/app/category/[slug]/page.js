import Navbar from "../../component/Navbar";
import { ShopCatalog } from "../../shop/ShopUi";
import { getShopPageData } from "../../../lib/catalog";
import { getStorefrontMode } from "../../../lib/storefront";
import { getOffers } from "../../data/actions";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} | Aurum Bites`,
    description: `Browse our finest selection of ${slug} at Aurum Bites.`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const brandHandle = resolvedSearchParams?.brand || "all";
  const productTypeHandle = resolvedSearchParams?.type || "all";

  const storefrontMode = getStorefrontMode();
  const [
    {
      isConfigured,
      products,
      topSearchedProducts,
      shop,
      error,
      collections,
      activeCollection,
      brands,
      activeBrand,
      productTypes,
      activeProductType,
    },
    offers,
  ] = await Promise.all([
    getShopPageData({ first: 9, collectionHandle: slug, brandHandle, productTypeHandle }),
    getOffers(),
  ]);

  const redirectParams = new URLSearchParams();
  if (brandHandle !== "all") {
    redirectParams.set("brand", brandHandle);
  }
  if (productTypeHandle !== "all") {
    redirectParams.set("type", productTypeHandle);
  }

  const redirectTo = redirectParams.toString()
    ? `/category/${slug}?${redirectParams.toString()}`
    : `/category/${slug}`;

  const categoryName = activeCollection?.title || (slug.charAt(0).toUpperCase() + slug.slice(1));

  return (
    <>
      <Navbar />
      <main className="shop-page-bg">
        {/* Category Header */}
        <div className="bg-[#fcf8f1] border-b border-[#e9dfcf] pt-8 pb-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-[#9a7a3f] mb-2">{categoryName}</h1>
            <p className="text-neutral-600 max-w-2xl">
              {activeCollection?.description || `Explore our curated selection of ${categoryName}.`}
            </p>
          </div>
        </div>

        <section className="mx-auto max-w-7xl p-3 sm:px-6">
          <ShopCatalog
            initialCatalog={{
              isConfigured,
              products,
              topSearchedProducts,
              shop,
              error,
              collections,
              activeCollection,
              brands,
              activeBrand,
              productTypes,
              activeProductType,
              offers,
            }}
            initialRedirectTo={redirectTo}
            storefrontMode={storefrontMode}
          />
        </section>
      </main>
    </>
  );
}
