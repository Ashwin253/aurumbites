import Navbar from "../component/Navbar";
import { CartNotice } from "./ShopServerUi";
import { ShopCatalog } from "./ShopUi";
import { getShopPageData } from "../../lib/shopify";
import { getStorefrontMode } from "../../lib/storefront";

export const metadata = {
  title: "Shop | Aurum Bites",
  description:
    "Browse Aurum Bites products with product pages, collection filtering, and a complete cart and checkout flow.",
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const collectionHandle = params?.collection || "all";
  const brandHandle = params?.brand || "all";
  const productTypeHandle = params?.type || "all";
  const cartStatus = params?.cart || "";

  const storefrontMode = getStorefrontMode();
  const [
    {
      isConfigured,
      products,
      shop,
      error,
      collections,
      activeCollection,
      brands,
      activeBrand,
      productTypes,
      activeProductType,
    },
  ] = await Promise.all([
    getShopPageData({ first: 9, collectionHandle, brandHandle, productTypeHandle }),
  ]);

  const redirectParams = new URLSearchParams();
  if (collectionHandle !== "all") {
    redirectParams.set("collection", collectionHandle);
  }
  if (brandHandle !== "all") {
    redirectParams.set("brand", brandHandle);
  }
  if (productTypeHandle !== "all") {
    redirectParams.set("type", productTypeHandle);
  }

  const redirectTo = redirectParams.toString()
    ? `/shop?${redirectParams.toString()}`
    : "/shop";

  const introCopy =
    activeCollection.description ||
    shop?.description ||
    "Curated dairy, cheese, and pantry essentials selected for hospitality teams, gourmet retail, and premium kitchens.";

  return (
    <>
      <Navbar />

      <main className="shop-page-bg">
        
        <section className="mx-auto max-w-7xl p-3 sm:px-6">
          {/* <CartNotice status={cartStatus} /> */}
          <ShopCatalog
            initialCatalog={{
              isConfigured,
              products,
              shop,
              error,
              collections,
              activeCollection,
              brands,
              activeBrand,
              productTypes,
              activeProductType,
            }}
            initialRedirectTo={redirectTo}
            storefrontMode={storefrontMode}
          />
        </section>
        {/* <Sublistcategory /> */}
      </main>
    </>
  );
}
