import Navbar from "../../component/Navbar";
import { ShopCatalog } from "../../shop/ShopUi";
import { getShopPageData } from "../../../lib/catalog";
import { getStorefrontMode } from "../../../lib/storefront";
import { getOffers } from "../../data/actions";
import SocialShareButtons from "../../component/SocialShareButtons";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { collections } = await getShopPageData();
  const colObj = collections?.find((c) => c.handle === slug);
  const colName = colObj?.title || (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "));

  return {
    title: `${colName} | Aurum Bites`,
    description: colObj?.description || `Browse our finest selection of ${colName} at Aurum Bites.`,
    openGraph: {
      title: `${colName} | Aurum Bites`,
      description: colObj?.description || `Browse our finest selection of ${colName} at Aurum Bites.`,
      images: colObj?.image ? [{ url: colObj.image }] : [],
    },
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

  const categoryName = activeCollection?.title || (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "));

  return (
    <>
      <Navbar />
      <main className="shop-page-bg">
        {/* Category Header */}
        <div className="bg-[#fcf8f1] border-b border-[#e9dfcf] pt-8 pb-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              {activeCollection?.image && (
                <img
                  src={activeCollection.image}
                  alt={categoryName}
                  className="h-16 w-auto object-contain rounded-lg bg-white p-2 border border-[#e9dfcf]"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#9a7a3f] mb-1">{categoryName}</h1>
                <p className="text-neutral-600 text-sm sm:text-base max-w-2xl">
                  {activeCollection?.description || `Explore our curated selection of ${categoryName}.`}
                </p>
              </div>
            </div>
            <SocialShareButtons title={`${categoryName} on Aurum Bites`} />
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
