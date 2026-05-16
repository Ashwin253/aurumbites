import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../component/Navbar";
import { CartNotice } from "../ShopServerUi";
import { getProductByHandle, getShopPageData, getCart } from "../../../lib/shopify";
import { getStorefrontMode } from "../../../lib/storefront";
import SocialShareButtons from "../../component/SocialShareButtons";
import { cookies } from "next/headers";
import {
  ImageCarousel,
  ProductDetailUi,
  RelatedProductsTabs,
  VariantSelector,
} from "../ProductDetail";

function toBrandHandle(brand) {
  return (brand || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dedupeProducts(products = [], currentHandle, excludedHandles = new Set()) {
  const seen = new Set(excludedHandles);

  return products.filter((item) => {
    if (!item?.handle || item.handle === currentHandle || seen.has(item.handle)) {
      return false;
    }

    seen.add(item.handle);
    return true;
  });
}

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
  
  const cookieStore = await cookies();
  const cartId = cookieStore.get("aurum_shopify_cart_id")?.value;

  const [{ product }, cart] = await Promise.all([
    getProductByHandle(handle),
    getCart(cartId)
  ]);

  if (!product) {
    notFound();
  }

  const relatedLabel = product.collectionHandles?.[0] || "all";
  const brandHandle = toBrandHandle(product.vendor);
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const variants = product.variants?.length ? product.variants : [];
  const [collectionCatalog, brandCatalog] = await Promise.all([
    relatedLabel !== "all"
      ? getShopPageData({ first: 8, collectionHandle: relatedLabel })
      : Promise.resolve({ products: [] }),
    brandHandle
      ? getShopPageData({ first: 8, brandHandle })
      : Promise.resolve({ products: [] }),
  ]);
  const sameCollectionProducts = dedupeProducts(
    collectionCatalog?.products || [],
    product.handle
  ).slice(0, 6);
  const sameBrandProducts = dedupeProducts(
    brandCatalog?.products || [],
    product.handle,
    new Set(sameCollectionProducts.map((item) => item.handle))
  ).slice(0, 6);

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

            <ProductDetailUi 
              initialCart={cart} 
              isConfigured={product.isConfigured} 
              isEnquiryOnly={storefrontMode.isEnquiryOnly}
            >
              <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
                <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
                  <ImageCarousel images={images} />
                </div>

                <div className="space-y-6">
                  <div>
                    {/* <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                      Product detail
                    </p> */}
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
                  sellingPlanGroups={product.sellingPlanGroups || []}
                />

                  {/* <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
                    <div
                      className="mt-3 text-lg text-neutral-600"
                      dangerouslySetInnerHTML={{
                        __html: product.longDescription || product.description,
                      }}
                    />
                  </div> */}
                </div>
              </div>

              <section className="space-y-6 py-12">
                <RelatedProductsTabs
                  collectionProducts={sameCollectionProducts}
                  brandProducts={sameBrandProducts}
                  collectionTitle={relatedLabel === "all" ? "Related picks" : "From this Brand"}
                  brandTitle={product.vendor || "Related brand"}
                  isEnquiryOnly={storefrontMode.isEnquiryOnly}
                />
              </section>
            </ProductDetailUi>
          </div>
        </section>
      </main>
    </>
  );
}
