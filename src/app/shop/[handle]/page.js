import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../component/Navbar";
import { CartNotice } from "../ShopServerUi";
import { getProductByHandle } from "../../../lib/shopify";
import { getStorefrontMode } from "../../../lib/storefront";
import SocialShareButtons from "../../component/SocialShareButtons";
import { ImageCarousel, VariantSelector } from "../ProductDetail";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const { product } = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product not found | Aurum Bites" };
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
  const [{ product }] = await Promise.all([getProductByHandle(handle)]);

  if (!product) {
    notFound();
  }

  const relatedLabel = product.collectionHandles?.[0] || "all";
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const variants = product.variants?.length ? product.variants : [];

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

            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
              <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
                <ImageCarousel images={images} />
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                    Product detail
                  </p>
                  {product.vendor ? (
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
                      {product.vendor}
                    </p>
                  ) : null}
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950">
                    {product.title}
                  </h1>
                  <SocialShareButtons title={product.title} />
                </div>

                <VariantSelector
                  variants={variants}
                  handle={product.handle}
                  redirectTo={`/shop/${product.handle}`}
                  isEnquiryOnly={storefrontMode.isEnquiryOnly}
                />

                <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                  <div
                    className="mt-3 text-lg text-neutral-600"
                    dangerouslySetInnerHTML={{
                      __html: product.longDescription || product.description,
                    }}
                  />
                  <div className="mt-6">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
