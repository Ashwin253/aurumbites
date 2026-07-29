import Navbar from "../../component/Navbar";
import { ShopCatalog } from "../../shop/ShopUi";
import { getShopPageData } from "../../../lib/catalog";
import { getStorefrontMode } from "../../../lib/storefront";
import { getOffers } from "../../data/actions";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Products | Aurum Bites`,
    description: `Shop the finest ${slug} products at Aurum Bites.`,
  };
}

export default async function BrandPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;
  const collectionHandle = resolvedSearchParams?.collection || "all";
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
    getShopPageData({ first: 9, collectionHandle, brandHandle: slug, productTypeHandle }),
    getOffers(),
  ]);

  const redirectParams = new URLSearchParams();
  if (collectionHandle !== "all") {
    redirectParams.set("collection", collectionHandle);
  }
  if (productTypeHandle !== "all") {
    redirectParams.set("type", productTypeHandle);
  }

  const redirectTo = redirectParams.toString()
    ? `/brand/${slug}?${redirectParams.toString()}`
    : `/brand/${slug}`;

  // activeBrand is the slug
  const brandObj = brands?.find(b => b.handle === slug);
  const brandName = brandObj?.title || (slug.charAt(0).toUpperCase() + slug.slice(1));

  return (
    <>
      <Navbar />
      <main className="shop-page-bg">
        {/* Brand Header */}
        <div className="bg-[#fcf8f1] border-b border-[#e9dfcf] pt-8 pb-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-6">
            {brandObj?.image && (
              <img src={brandObj.image} alt={brandName} className="h-16 w-auto object-contain rounded-lg" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-[#9a7a3f] mb-2">{brandName}</h1>
              <p className="text-neutral-600 max-w-2xl">
                Shop all premium products from {brandName}.
              </p>
            </div>
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
              activeBrand: slug,
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
