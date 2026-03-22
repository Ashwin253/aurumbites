import Link from "next/link";
import Navbar from "../component/Navbar";
import { getCartState } from "./actions";
import {
  CartNotice,
  CartPanel,
  CollectionFilters,
  MobileCartWidget,
  ProductCard,
  StatusPanel,
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
  const cartStatus = params?.cart || "";

  const storefrontMode = getStorefrontMode();
  const [{ isConfigured, products, shop, error, collections, activeCollection }, setup, cartState] =
    await Promise.all([
      getShopPageData({ first: 9, collectionHandle }),
      Promise.resolve(getShopifySetup()),
      getCartState(),
    ]);

  const redirectTo =
    collectionHandle === "all" ? "/shop" : `/shop?collection=${collectionHandle}`;

  return (
    <>
      <Navbar />

      <main className="bg-neutral-50">
        <section className="border-b border-neutral-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              {/* <p className="text-sm font-medium uppercase tracking-[0.3em] text-neutral-500">
                Shop
              </p> */}
              {/* <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                Product pages, collections, and seamless cart flows.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-neutral-600">
                This storefront now supports collection filtering, individual
                product detail pages, and cart actions that can hand off to
                checkout when your store is connected.
              </p> */}
              <CollectionFilters
                collections={collections}
                activeHandle={activeCollection.handle}
              />
              {/* <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Discuss Store Setup
                </Link>
                {shop?.primaryDomain?.url ? (
                  <a
                    href={shop.primaryDomain.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
                  >
                    Visit Store
                  </a>
                ) : null}
              </div> */}
            </div>

            {/* <StatusPanel
              configured={isConfigured}
              error={error}
              storeDomain={setup.storeDomain}
            /> */}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <CartNotice status={cartStatus} />
          <MobileCartWidget
            cart={cartState.cart}
            isConfigured={cartState.isConfigured}
            redirectTo={redirectTo}
            isEnquiryOnly={storefrontMode.isEnquiryOnly}
          />

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.45fr_0.75fr]">
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
              </div>

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
      </main>
    </>
  );
}
