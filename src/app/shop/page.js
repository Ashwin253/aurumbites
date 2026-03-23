import Link from "next/link";
import Navbar from "../component/Navbar";
import { getCartState } from "./actions";
import {
  CartNotice,
  CartPanel,
  CollectionFilters,
  MobileCartWidget,
  ProductCard,
  ProductTypeFilters,
  StatusPanel,
  BrandFilters,
  Sublistcategory,
} from "./ShopUi";
import { getShopPageData, getShopifySetup } from "../../lib/shopify";
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
    setup,
    cartState,
  ] = await Promise.all([
    getShopPageData({ first: 9, collectionHandle, brandHandle, productTypeHandle }),
    Promise.resolve(getShopifySetup()),
    getCartState(),
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

  return (
    <>
      <Navbar />

      <main className="bg-neutral-50">
        <section className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
              <CollectionFilters
                collections={collections}
                activeHandle={activeCollection.handle}
                brandHandle={brandHandle}
                productTypeHandle={productTypeHandle}
              />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-2 py-6">
          <CartNotice status={cartStatus} />
          <MobileCartWidget
            cart={cartState.cart}
            isConfigured={cartState.isConfigured}
            redirectTo={redirectTo}
            isEnquiryOnly={storefrontMode.isEnquiryOnly}
          />

          <div className="mt-2 grid gap-10 lg:grid-cols-[1.45fr_0.75fr]">
            <div>
              {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
                    {activeCollection.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-neutral-600">
                    {activeCollection.description ||
                      shop?.description ||
                      "Browse the current storefront catalog and select a product to view full details."}
                  </p>
                </div>
                <p className="text-sm text-neutral-500">
                  {isConfigured && !error
                    ? "Live catalog"
                    : "Preview catalog while the store connection is being finalized"}
                </p>
              </div> */}
               <BrandFilters
                brands={brands}
                activeHandle={activeBrand}
                collectionHandle={collectionHandle}
                productTypeHandle={productTypeHandle}
              />
                {/* All type  */}
              {/* <ProductTypeFilters
                productTypes={productTypes}
                activeHandle={activeProductType}
                collectionHandle={collectionHandle}
                brandHandle={brandHandle}
              /> */}

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      redirectTo={redirectTo}
                      isEnquiryOnly={storefrontMode.isEnquiryOnly}
                    />
                  ))
                ) : (
                  <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-10 text-neutral-600">
                    No products were found in this collection yet.
                  </div>
                )}
              </div>
            </div>

            <CartPanel
              cart={cartState.cart}
              isConfigured={cartState.isConfigured}
              redirectTo={redirectTo}
              isEnquiryOnly={storefrontMode.isEnquiryOnly}
              className="hidden lg:block"
            />
          </div>
        </section>
        <Sublistcategory />
      </main>
    </>
  );
}
