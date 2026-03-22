import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../component/Navbar";
import { getCartState } from "../actions";
import { addToCartAction } from "../actions";
import { CartNotice, CartPanel, MobileCartWidget } from "../ShopUi";
import { getProductByHandle } from "../../../lib/shopify";
import { getStorefrontMode } from "../../../lib/storefront";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const { product } = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Product not found | Aurum Bites",
    };
  }

  return {
    title: `${product.title} | Aurum Bites`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params, searchParams }) {
  const storefrontMode = getStorefrontMode();
  const { handle } = await params;
  const query = await searchParams;
  const cartStatus = query?.cart || "";
  const [{ product, error, isConfigured }, cartState] = await Promise.all([
    getProductByHandle(handle),
    getCartState(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedLabel = product.collectionHandles?.[0] || "all";

  return (
    <>
      <Navbar />

      <main className="bg-neutral-50">
        <section className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <Link href="/shop" className="hover:text-neutral-900">
                Shop
              </Link>
              <span>/</span>
              <span className="text-neutral-900">{product.title}</span>
            </div>

            <CartNotice status={cartStatus} />
            <MobileCartWidget
              cart={cartState.cart}
              isConfigured={cartState.isConfigured}
              redirectTo={`/shop/${product.handle}`}
              isEnquiryOnly={storefrontMode.isEnquiryOnly}
            />

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
              <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
                <div className="relative h-[28rem] bg-neutral-100">
                  {product.image ? (
                    <Image
                      src={product.image.url}
                      alt={product.image.altText}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.32),_transparent_45%),linear-gradient(135deg,_#faf5e8,_#f5efe2_55%,_#ebe1cc)] p-8">
                      <span className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-600">
                        Aurum Bites
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                    Product detail
                  </p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
                    {product.title}
                  </h1>
                  <p className="mt-3 text-lg text-neutral-600">
                    {product.longDescription || product.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Price</p>
                    <p className="mt-2 text-xl font-semibold text-neutral-950">
                      {product.price}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Status</p>
                    <p className="mt-2 text-xl font-semibold text-neutral-950">
                      {product.availableForSale ? "Available" : "Made to order"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-neutral-200 bg-white p-5">
                    <p className="text-sm text-neutral-500">Collection</p>
                    <p className="mt-2 text-xl font-semibold capitalize text-neutral-950">
                      {relatedLabel.replaceAll("-", " ")}
                    </p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-neutral-500">
                    {product.featured || "Storefront product"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {storefrontMode.isEnquiryOnly
                      ? "This product can be added to your enquiry list and shared through the contact form."
                      : error
                      ? "The page is showing preview content because the store could not be reached right now."
                      : isConfigured
                      ? "This product is connected to the live store and can be added directly to the cart."
                      : "This product is currently using preview content until the store connection is complete."}
                  </p>

                  <form action={addToCartAction} className="mt-6 flex flex-col gap-4 sm:flex-row">
                    <input type="hidden" name="handle" value={product.handle} />
                    <input
                      type="hidden"
                      name="variantId"
                      value={product.variantId || ""}
                    />
                    <input
                      type="hidden"
                      name="redirectTo"
                      value={`/shop/${product.handle}`}
                    />
                    <label className="flex items-center gap-3 rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-700">
                      <span>Qty</span>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        defaultValue="1"
                        className="w-16 bg-transparent outline-none"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      {storefrontMode.isEnquiryOnly ? "Add to enquiry" : "Add to cart"}
                    </button>
                    <Link
                      href={
                        relatedLabel === "all"
                          ? "/shop"
                          : `/shop?collection=${relatedLabel}`
                      }
                      className="rounded-full border border-neutral-300 px-6 py-3 text-center text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
                    >
                      Back to collection
                    </Link>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <CartPanel
            cart={cartState.cart}
            isConfigured={cartState.isConfigured}
            redirectTo={`/shop/${product.handle}`}
            isEnquiryOnly={storefrontMode.isEnquiryOnly}
            className="hidden lg:block"
          />
        </section>
      </main>
    </>
  );
}
