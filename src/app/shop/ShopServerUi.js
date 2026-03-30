import Image from "next/image";
import Link from "next/link";
import { addToCartAction } from "./actions";

export function CartNotice({ status }) {
  const messages = {
    added: "Added to cart.",
    removed: "Item removed from cart.",
    "preview-added": "Added to cart.",
    "preview-removed": "Item removed from preview cart.",
    error: "There was a problem updating the cart.",
    "missing-product": "Unable to identify the selected product.",
    "missing-variant": "This product needs a valid variant before it can be added.",
    "missing-line": "The selected cart line could not be removed.",
  };

  if (!status || !messages[status]) {
    return null;
  }

  const isError = status === "error" || status.startsWith("missing");

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        isError
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {messages[status]}
    </div>
  );
}

function getProductEyebrow(product) {
  if (product.vendor && product.featured) {
    return `${product.vendor} selection`;
  }

  return product.vendor || "Aurum Bites";
}

export function ProductCard({ product, redirectTo, isEnquiryOnly }) {
  const productTags = product.tags?.slice(0, 2).join(" | ") || "Catalog item";

  return (
    <article className="premium-card group overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
      <Link href={`/shop/${product.handle}`} className="block">
        <div className="relative h-72 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(212,168,83,0.2),_transparent_48%),linear-gradient(135deg,_#f7f2e8,_#f1eadb_55%,_#e6dcc8)]">
          <div className="absolute top-4 left-4 z-10">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              product.availableForSale 
                ? "bg-emerald-500/90 text-white" 
                : "bg-amber-500/90 text-white"
            }`}>
              {product.availableForSale ? "Available" : "Out of Stock"}
            </span>
          </div>

          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.altText || product.title}
              fill
              loading="lazy"
              sizes="(min-width: 1280px) 26vw, (min-width: 768px) 42vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-end p-6">
              <span className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-700 backdrop-blur">
                Aurum Reserve
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/75">
                {getProductEyebrow(product)}
              </p>
              <p className="mt-2 max-w-[16rem] text-sm text-white/90">
                {product.featured || "Curated for premium kitchens and service."}
              </p>
            </div>
            <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-sm font-medium backdrop-blur-md">
              {product.price}
            </span>
          </div>
        </div>
      </Link>

      <div className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a7a3f]">
              {product.vendor || "Curated Collection"}
            </p>
            <Link
              href={`/shop/${product.handle}`}
              className="mt-2 block text-[1.35rem] font-semibold leading-tight text-neutral-950 transition hover:text-[#7a5a26]"
            >
              {product.title}
            </Link>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/shop/${product.handle}`}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-700 transition hover:border-[#9a7a3f] hover:text-[#7a5a26]"
          >
            View details
          </Link>
          <div className="flex-1">
            {product.availableForSale ? (
              <form action={addToCartAction}>
                <input type="hidden" name="handle" value={product.handle} />
                <input type="hidden" name="variantId" value={product.variantId || ""} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="quantity" value="1" />
                <button
                  type="submit"
                  className="w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-[#7a5a26]"
                >
                  {isEnquiryOnly ? "Proceed to enquire" : "Add to cart"}
                </button>
              </form>
            ) : (
              <a
                href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(`Hi, I'm interested in ${product.title} for bulk quick order. Please notify me when it's back in stock.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#20bd5c] shadow-sm"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.88 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Notify for Bulk
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
