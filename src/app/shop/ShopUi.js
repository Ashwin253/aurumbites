import Image from "next/image";
import Link from "next/link";
import { addToCartAction, removeFromCartAction } from "./actions";

export function StatusPanel({ configured, error, storeDomain }) {
  if (configured && !error) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
        <p className="font-semibold">Live catalog connected</p>
        <p className="mt-2">
          Products on this page are loading live from{" "}
          <span className="font-medium">{storeDomain}</span>.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">Store connection needs attention</p>
        <p className="mt-2">{error}</p>
        <p className="mt-3">
          The storefront is falling back to preview data so the shopping flow
          stays usable while the connection is being finalized.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-700">
      <p className="font-semibold text-neutral-900">Store setup is ready</p>
      <p className="mt-2">
        Add the store environment variables below and this storefront will begin
        pulling live products, collections, and cart data.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <code className="rounded-2xl bg-neutral-950 px-4 py-3 text-neutral-100">
          SHOPIFY_STORE_DOMAIN
        </code>
        <code className="rounded-2xl bg-neutral-950 px-4 py-3 text-neutral-100">
          SHOPIFY_STOREFRONT_ACCESS_TOKEN
        </code>
      </div>
      <p className="mt-3 text-neutral-500">
        Optional: <code>SHOPIFY_STOREFRONT_API_VERSION</code>
      </p>
    </div>
  );
}

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

export function CollectionFilters({ collections, activeHandle }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {collections.map((collection) => {
        const isActive = collection.handle === activeHandle;
        return (
          <Link
            key={collection.id}
            href={
              collection.handle === "all"
                ? "/shop"
                : `/shop?collection=${collection.handle}`
            }
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-neutral-950 text-white"
                : "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {collection.title}
          </Link>
        );
      })}
    </div>
  );
}

export function ProductCard({ product, redirectTo }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
      <Link href={`/shop/${product.handle}`} className="block">
        <div className="relative h-72 bg-neutral-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.altText}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.32),_transparent_45%),linear-gradient(135deg,_#faf5e8,_#f5efe2_55%,_#ebe1cc)] p-6">
              <span className="text-sm font-medium uppercase tracking-[0.25em] text-neutral-600">
                Aurum Bites
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/shop/${product.handle}`}
              className="text-xl font-semibold text-neutral-950 hover:text-neutral-700"
            >
              {product.title}
            </Link>
            <p className="mt-1 text-sm text-neutral-500">{product.featured}</p>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
            {product.price}
          </span>
        </div>

        <p className="min-h-16 text-sm leading-6 text-neutral-600">
          {product.description || "Product details will appear here."}
        </p>

        <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-sm">
          <span
            className={
              product.availableForSale
                ? "font-medium text-emerald-700"
                : "font-medium text-amber-700"
            }
          >
            {product.availableForSale ? "Available" : "Unavailable"}
          </span>
          <span className="text-neutral-500">
            {product.tags?.slice(0, 2).join(" | ") || "Catalog item"}
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/shop/${product.handle}`}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
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
              className="w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Add to cart
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

export function CartPanel({ cart, isConfigured, redirectTo }) {
  return (
    <aside className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Cart
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-neutral-950">
            {cart.totalQuantity > 0
              ? `${cart.totalQuantity} item${cart.totalQuantity > 1 ? "s" : ""}`
              : "Your cart is empty"}
          </h3>
        </div>
        {cart.subtotal ? (
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
            {cart.subtotal}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-neutral-600">
        {isConfigured
          ? "Cart lines are synced with your store, and checkout will continue there."
          : "Preview mode stores cart items locally until the store connection is complete."}
      </p>

      <div className="mt-6 space-y-4">
        {cart.lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500">
            Add a product to start the checkout flow.
          </div>
        ) : (
          cart.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4"
            >
              <div>
                <p className="font-medium text-neutral-950">{line.title}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Qty {line.quantity}
                  {line.variantTitle ? ` | ${line.variantTitle}` : ""}
                </p>
                <p className="mt-1 text-sm text-neutral-700">{line.price}</p>
              </div>
              <form action={removeFromCartAction}>
                <input type="hidden" name="lineId" value={line.id} />
                <input type="hidden" name="handle" value={line.productHandle} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button
                  type="submit"
                  className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
                >
                  Remove
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        {isConfigured && cart.checkoutUrl ? (
          <a
            href={cart.checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Continue to checkout
          </a>
        ) : (
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-full border  px-5 py-3 text-sm font-extrabold border-black text-black transition hover:border-neutral-400"
          >
            For larger orders, please get in touch.
          </Link>
        )}
      </div>
    </aside>
  );
}
