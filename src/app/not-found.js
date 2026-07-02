import Link from "next/link";
import Navbar from "./component/Navbar";
import NotFoundProducts from "./component/NotFoundProducts";
import { getShopPageData } from "../lib/catalog";
import { getStorefrontMode } from "../lib/storefront";

export const metadata = {
  title: "Page not found | Aurum Bites",
  description: "The page you are looking for could not be found.",
};

export default async function NotFound() {
  const { topSearchedProducts } = await getShopPageData();
  const storefrontMode = getStorefrontMode();

  return (
    <>
      <Navbar />

      <main className="shop-page-bg min-h-[70vh]">
        <section className="mx-auto max-w-7xl p-3 sm:px-6 pb-16">
          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#e6dcc8]/65 bg-white/50 p-5 backdrop-blur-md shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-[#9a7a3f]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h1 className="text-lg font-semibold text-neutral-950 sm:text-xl">
                  Page not found
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  The page you are looking for does not exist or may have been moved.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                Browse shop
              </Link>
              <Link
                href="/"
                className="rounded-full border border-[#e6dcc8] bg-white px-5 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-[#c9b07a] hover:text-[#7a5a26]"
              >
                Go home
              </Link>
            </div>
          </div>

          <NotFoundProducts
            products={topSearchedProducts}
            isEnquiryOnly={storefrontMode.isEnquiryOnly}
          />
        </section>
      </main>
    </>
  );
}