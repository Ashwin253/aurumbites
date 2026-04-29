"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { addToCart } from "./actions";
import { CartProvider, useCartChange } from "./CartContext";
import { MobileCartWidget, CartPanel } from "./ShopUi";

function cleanVariantLabel(value, fallback = "Variant") {
  const normalized =
    typeof value === "string"
      ? value.trim()
      : value && typeof value === "object"
      ? value.title || value.label || value.name || value.value || ""
      : "";

  if (!normalized) {
    return fallback;
  }

  return /^(title|option\s*\d+)$/i.test(normalized) ? fallback : normalized;
}

export function ProductDetailUi({ 
  initialCart, 
  isConfigured, 
  isEnquiryOnly, 
  children 
}) {
  const [cart, setCart] = useState(initialCart);
  const [isPending, startTransition] = useTransition();

  const handleCartChange = (nextState) => {
    if (nextState?.cart) {
      setCart(nextState.cart);
    }
  };

  return (
    <CartProvider onCartChange={handleCartChange}>
      {children}
      <MobileCartWidget cart={cart} isConfigured={isConfigured} isEnquiryOnly={isEnquiryOnly} />
    </CartProvider>
  );
}

export function ImageCarousel({ images }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.32),_transparent_45%),linear-gradient(135deg,_#faf5e8,_#f5efe2_55%,_#ebe1cc)] p-8" />
    );
  }

  return (
    <div>
      <div className="relative h-[28rem] bg-neutral-100">
        <Image
          src={images[active].url}
          alt={images[active].altText}
          fill
          className="object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="Next image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-neutral-950" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt={img.altText} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VariantSelector({ variants, handle, redirectTo, isEnquiryOnly }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const onCartChange = useCartChange();
  const selected = variants[selectedIdx];
  const hasMultiple = variants.length > 1;
  const optionLabel = cleanVariantLabel(variants[0]?.selectedOptions?.[0]?.name);

  const handleAdd = async () => {
    setAdding(true);
    try {
      const result = await addToCart({
        handle,
        variantId: selected.id,
        quantity: qty,
      });
      if (onCartChange) onCartChange(result);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {hasMultiple && (
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">
            {optionLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedIdx(i)}
                className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                  i === selectedIdx
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : v.availableForSale
                    ? "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                    : "border-neutral-200 bg-neutral-100 text-neutral-400 line-through cursor-not-allowed"
                }`}
                disabled={!v.availableForSale}
              >
                {cleanVariantLabel(v.title, "Default")}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-3">
          <span className="text-neutral-500">Price </span>
          <span className="font-semibold text-neutral-950">{selected.price}</span>
        </div>
        {selected.weight && (
          <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-3">
            <span className="text-neutral-500">Weight </span>
            <span className="font-semibold text-neutral-950">{selected.weight}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex items-center gap-3 rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-700">
          <span>Qty</span>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 bg-transparent outline-none"
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected.availableForSale || adding}
          className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {adding
            ? "Adding…"
            : !selected.availableForSale
            ? "Unavailable"
            : isEnquiryOnly
            ? "Add to enquiry"
            : (
              <div className="flex items-center justify-center" aria-label="Add to bucket">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18l-2 11H5L3 9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9a4 4 0 018 0" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12v4m-2-2h4" />
                </svg>
              </div>
            )}
        </button>
      </div>
    </div>
  );
}

export function DetailRelatedCard({ product, isEnquiryOnly }) {
  const onCartChange = useCartChange();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const result = await addToCart({
        handle: product.handle,
        variantId: product.variantId || "",
        quantity: 1,
      });
      if (onCartChange) onCartChange(result);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="min-w-[260px] max-w-[260px] overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/shop/${product.handle}`} className="block">
        <div className="relative aspect-square sm:h-52 bg-neutral-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.altText || product.title}
              fill
              className="object-cover"
              sizes="260px"
            />
          ) : (
            <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.32),_transparent_45%),linear-gradient(135deg,_#faf5e8,_#f5efe2_55%,_#ebe1cc)] p-5">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-600">
                Aurum Bites
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <div>
          {product.vendor ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
              {product.vendor}
            </p>
          ) : null}
          <Link
            href={`/shop/${product.handle}`}
            className="mt-2 block text-lg font-semibold leading-tight text-neutral-950 hover:text-neutral-700"
          >
            {product.title}
          </Link>
          {product.weight ? (
            <p className="mt-1 text-sm text-neutral-500">{product.weight}</p>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
          <span className="self-start sm:self-auto rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
            {product.availableForSale ? product.price : "Out of Stock"}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/shop/${product.handle}`}
              className="rounded-full border border-neutral-300 p-2 text-neutral-700 transition hover:bg-neutral-50"
              title="Details"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </Link>
            {product.availableForSale && (
              <button
                onClick={handleAdd}
                disabled={adding}
                className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {adding ? "..." : isEnquiryOnly ? "Enquire" : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18l-2 11H5L3 9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9a4 4 0 018 0" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12v4m-2-2h4" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function RelatedProductsTabs({ 
  collectionProducts, 
  brandProducts, 
  collectionTitle, 
  brandTitle,
  isEnquiryOnly 
}) {
  const [activeTab, setActiveTab] = useState('collection');
  
  const hasCollection = collectionProducts && collectionProducts.length > 0;
  const hasBrand = brandProducts && brandProducts.length > 0;
  
  const effectiveTab = (!hasCollection && hasBrand) ? 'brand' : activeTab;
  const products = effectiveTab === 'collection' ? collectionProducts : brandProducts;

  if (!hasCollection && !hasBrand) return null;

  return (
    <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-8 border-b border-neutral-100 pb-2">
        {hasCollection && (
          <button 
            onClick={() => setActiveTab('collection')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all ${effectiveTab === 'collection' ? 'text-neutral-950 border-b-2 border-neutral-950' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            {collectionTitle}
          </button>
        )}
        {hasBrand && (
          <button 
            onClick={() => setActiveTab('brand')}
            className={`pb-2 text-sm font-bold uppercase tracking-widest transition-all ${effectiveTab === 'brand' ? 'text-neutral-950 border-b-2 border-neutral-950' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            {brandTitle}
          </button>
        )}
      </div>

      <div className="mt-8 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <DetailRelatedCard key={product.handle} product={product} isEnquiryOnly={isEnquiryOnly} />
        ))}
      </div>
    </section>
  );
}

export function RelatedProductRow({ title, subtitle, products }) {
  if (!products?.length) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">
            {subtitle}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <DetailRelatedCard key={product.handle} product={product} />
        ))}
      </div>
    </section>
  );
}
