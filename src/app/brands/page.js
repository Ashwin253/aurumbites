import Link from "next/link";
import Navbar from "../component/Navbar";
import { getShopPageData } from "../../lib/catalog";
import SocialShareButtons from "../component/SocialShareButtons";

export const metadata = {
  title: "All Brands | Aurum Bites",
  description: "Explore all premium dairy and gourmet brands available at Aurum Bites.",
  openGraph: {
    title: "All Brands | Aurum Bites",
    description: "Explore all premium dairy and gourmet brands available at Aurum Bites.",
  },
};

export default async function BrandsPage() {
  const { brands } = await getShopPageData();
  const validBrands = (brands || []).filter((b) => b.handle !== "all");

  return (
    <>
      <Navbar />
      <main className="shop-page-bg min-h-screen">
        <div className="bg-[#fcf8f1] border-b border-[#e9dfcf] pt-12 pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#9a7a3f] mb-2">
                Brand Directory
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Our Partner Brands
              </h1>
              <p className="mt-2 text-neutral-600 max-w-2xl text-sm sm:text-base">
                Discover the world&apos;s leading dairy, cheese, and pantry brands curated for culinary excellence.
              </p>
            </div>
            <SocialShareButtons title="Explore Partner Brands on Aurum Bites" />
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {validBrands.map((brand) => (
              <Link
                key={brand.handle}
                href={`/brand/${brand.handle}`}
                className="group flex flex-col items-center justify-between rounded-2xl border border-[#e9dfcf] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#cbb387] hover:shadow-md"
              >
                <div className="flex h-24 w-full items-center justify-center">
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.title}
                      className="max-h-20 w-auto object-contain transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fcf8f1] text-lg font-bold text-[#9a7a3f]">
                      {brand.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-sm font-bold text-neutral-900 group-hover:text-[#9a7a3f] transition">
                    {brand.title}
                  </h2>
                  <span className="mt-1 inline-block text-xs text-neutral-500 group-hover:underline">
                    View Products &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
