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

        <div className="flex items-center justify-between rounded-[1.4rem] border border-[#eadfc7] bg-[#fbf8f1] px-4 py-3 text-sm">
          <span
            className={
              product.availableForSale
                ? "font-medium text-emerald-700"
                : "font-medium text-amber-700"
            }
          >
            {product.availableForSale ? "Ready to dispatch" : "Back shortly"}
          </span>
          <span className="text-neutral-500">{productTags}</span>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/shop/${product.handle}`}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-700 transition hover:border-[#9a7a3f] hover:text-[#7a5a26]"
          >
            View details
          </Link>
          <form action={addToCartAction} className="flex-1">
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
        </div>
      </div>
    </article>
  );
}
