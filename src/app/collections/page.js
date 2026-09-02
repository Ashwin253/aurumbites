import Link from "next/link";
import Navbar from "../component/Navbar";
import { getShopPageData } from "../../lib/catalog";
import SocialShareButtons from "../component/SocialShareButtons";

export const metadata = {
  title: "All Collections | Aurum Bites",
  description: "Explore all product collections and gourmet categories at Aurum Bites.",
  openGraph: {
    title: "All Collections | Aurum Bites",
    description: "Explore all product collections and gourmet categories at Aurum Bites.",
  },
};

export default async function CollectionsPage() {
  const { collections } = await getShopPageData();
  const validCollections = (collections || []).filter((c) => c.handle !== "all");

  return (
    <>
      <Navbar />
      <main className="shop-page-bg min-h-screen">
        <div className="bg-[#fcf8f1] border-b border-[#e9dfcf] pt-12 pb-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#9a7a3f] mb-2">
                Categories &amp; Collections
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
                Product Collections
              </h1>
              <p className="mt-2 text-neutral-600 max-w-2xl text-sm sm:text-base">
                Browse our curated categories of dairy, cheese, creams, and pantry essentials.
              </p>
            </div>
            <SocialShareButtons title="Explore Collections on Aurum Bites" />
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {validCollections.map((col) => (
              <Link
                key={col.handle}
                href={`/collection/${col.handle}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#e9dfcf] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#cbb387] hover:shadow-md"
              >
                <div className="relative h-44 w-full bg-[#fcf8f1] overflow-hidden flex items-center justify-center p-4">
                  {col.image ? (
                    <img
                      src={col.image}
                      alt={col.title}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9dfcf] text-2xl font-bold text-[#9a7a3f]">
                      🧀
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 group-hover:text-[#9a7a3f] transition">
                      {col.title}
                    </h2>
                    {col.description && (
                      <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2">
                        {col.description}
                      </p>
                    )}
                  </div>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-[#9a7a3f] group-hover:underline">
                    Explore Collection &rarr;
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
