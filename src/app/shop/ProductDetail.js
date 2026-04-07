"use client";

import { useState } from "react";
import Image from "next/image";
import { addToCartAction } from "./actions";

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
  const selected = variants[selectedIdx];
  const hasMultiple = variants.length > 1;
  const isDefault = variants.length === 1 && variants[0].title === "Default Title";

  return (
    <div className="space-y-4">
      {hasMultiple && (
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">
            {variants[0]?.selectedOptions?.[0]?.name || "Variant"}
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
                {isDefault ? "Default" : v.title}
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

      <form action={addToCartAction} className="flex flex-col gap-4 sm:flex-row">
        <input type="hidden" name="handle" value={handle} />
        <input type="hidden" name="variantId" value={selected.id} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
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
          disabled={!selected.availableForSale}
          className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {!selected.availableForSale
            ? "Unavailable"
            : isEnquiryOnly
            ? "Add to enquiry"
            : "Add to cart"}
        </button>
      </form>
    </div>
  );
}
