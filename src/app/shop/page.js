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
        <section className="relative overflow-hidden border-b border-[#e8deca]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,168,83,0.2),_transparent_28%),radial-gradient(circle_at_85%_20%,_rgba(255,255,255,0.65),_transparent_24%),linear-gradient(180deg,_#f8f3ea_0%,_#f3ecdf_55%,_#f8f5ef_100%)]" />
          <div className="relative mx-auto max-w-7xl px-6 py-10 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
              <div>
                {/* <span className="inline-flex rounded-full border border-[#dcc79d] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8b6a2c] backdrop-blur">
                  Aurum Bites Collection
                </span> */}
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
                  Premium pantry sourcing with a cleaner, faster storefront.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg">
                  {introCopy}
                </p>

                {/* <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-700">
                  <span className="rounded-full border border-white/70 bg-white/85 px-4 py-2 shadow-sm backdrop-blur">
                    Collection: {activeCollection.title}
                  </span>
                  <span className="rounded-full border border-white/70 bg-white/85 px-4 py-2 shadow-sm backdrop-blur">
                    {isConfigured && !error ? "Live product feed" : "Optimized preview catalog"}
                  </span>
                  <span className="rounded-full border border-white/70 bg-white/85 px-4 py-2 shadow-sm backdrop-blur">
                    {storefrontMode.isEnquiryOnly ? "Manual enquiry flow" : "Direct cart enabled"}
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

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
