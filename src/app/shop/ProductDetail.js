"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { addToCart } from "./actions";
import { CartProvider, useCartChange } from "./CartContext";
import { MobileCartWidget, CartPanel } from "./ShopUi";
import {
  getSubscriptionManagementUrl,
  getSubscriptionUrl,
} from "../../lib/subscription";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      } else if (event.key === "ArrowLeft" && images.length > 1) {
        setActive((i) => (i - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight" && images.length > 1) {
        setActive((i) => (i + 1) % images.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.32),_transparent_45%),linear-gradient(135deg,_#faf5e8,_#f5efe2_55%,_#ebe1cc)] p-8" />
    );
  }

  const activeImage = images[active];

  return (
    <div>
      <div className="relative h-[28rem] bg-neutral-100">
        <Image
          src={activeImage.url}
          alt={activeImage.altText}
          fill
          className="object-contain object-center"
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
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute right-3 bottom-3 rounded-full bg-black/40 p-2.5 text-white backdrop-blur transition hover:bg-black/60"
          aria-label="Enlarge image"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
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
              <Image src={img.url} alt={img.altText} fill className="object-contain object-center" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close enlarged image"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Previous image"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActive((i) => (i + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Next image"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          ) : null}

          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.altText}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function VariantSelector({
  variants,
  handle,
  redirectTo,
  isEnquiryOnly,
  sellingPlanGroups = [],
  offers = [],
  brandName,
  categoryName,
}) {
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const firstAvailable = variants.findIndex((v) => v.availableForSale);
    return firstAvailable >= 0 ? firstAvailable : 0;
  });
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [purchaseType, setPurchaseType] = useState("one-time");
  const [selectedPlan, setSelectedPlan] = useState("");
  const onCartChange = useCartChange();
  const selected = variants[selectedIdx];
  const hasMultiple = variants.length > 1;
  const subscriptionUrl = getSubscriptionUrl({
    handle,
    variantId: selected?.id,
    quantity: qty,
  });
  const subscriptionManagementUrl = getSubscriptionManagementUrl();

  // Adjust quantity if it exceeds the selected variant's stock
  useEffect(() => {
    if (selected?.stock !== undefined && selected?.stock !== null && selected?.stock !== "") {
      const maxVal = parseInt(selected.stock, 10);
      if (qty > maxVal) {
        setQty(Math.max(1, maxVal));
      }
    }
  }, [selectedIdx, selected, qty]);

  const isCallForInventory = !!selected?.callForInventory;
  const isOutOfStock = !isCallForInventory && (!selected?.availableForSale || (selected?.stock !== undefined && selected?.stock !== null && selected?.stock !== "" && parseInt(selected.stock) === 0));
  const isLowStock = !isCallForInventory && selected?.stock !== undefined && selected?.stock !== null && selected?.stock !== "" && parseInt(selected.stock) > 0 && parseInt(selected.stock) <= 5;
  const availablePlans = sellingPlanGroups.flatMap((group) =>
    (group.sellingPlans || []).map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      groupName: group.name,
    }))
  );

  const handleAdd = async () => {
    setAdding(true);
    try {
      const result = await addToCart({
        handle,
        variantId: selected.id,
        quantity: qty,
        sellingPlanId:
          purchaseType === "subscription" ? selectedPlan || "" : "",
      });
      if (onCartChange) onCartChange(result);
    } finally {
      setAdding(false);
    }
  };

  // Calculate discounts based on active offers
  const applicableOffers = offers.filter((o) => {
    if (o.type === "product" && o.target_id === handle) return true;
    if (o.type === "brand" && brandName && o.target_id?.toLowerCase() === brandName.toLowerCase()) return true;
    if (o.type === "category" && categoryName && o.target_id?.toLowerCase() === categoryName.toLowerCase()) return true;
    if (o.type === "volume" && o.target_id === handle) return true;
    return false;
  });

  return (
    <div className="space-y-4">
      {hasMultiple ? (
        <div>
          <label htmlFor="variant-weight-select" className="mb-2 block text-sm font-medium text-neutral-700">
            Weight
          </label>
          <select
            id="variant-weight-select"
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 focus:ring-2 focus:ring-neutral-900"
          >
            {variants.map((v, i) => (
              <option key={v.id} value={i} disabled={!v.availableForSale}>
                {cleanVariantLabel(v.title || v.weight, "Default")}
                {!v.availableForSale ? " (Out of stock)" : ""}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-neutral-500">
            {variants.length} variant{variants.length === 1 ? "" : "s"} available
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-3">
          {selected.askPrice ? (
            <span className="font-semibold text-neutral-950">Ask Price</span>
          ) : (
            <div className="flex items-center gap-2">
              {selected.compareAtAmount && selected.compareAtAmount > selected.amount ? (
                <span className="text-neutral-400 line-through text-sm">₹{selected.compareAtAmount}</span>
              ) : null}
              
              <span className="font-semibold text-neutral-950 text-lg">
                ₹{selected.amount}
              </span>

              {selected.compareAtAmount && selected.compareAtAmount > selected.amount ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  {Math.round(((selected.compareAtAmount - selected.amount) / selected.compareAtAmount) * 100)}% OFF
                </span>
              ) : null}
            </div>
          )}
          
          {!selected.askPrice && selected.compareAtAmount && selected.compareAtAmount > selected.amount ? (
            <p className="mt-0.5 text-xs text-emerald-600 font-medium">
              You save ₹{(selected.compareAtAmount - selected.amount).toFixed(0)}
            </p>
          ) : null}
        </div>
        {!hasMultiple && selected.weight ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-5 py-3">
            <span className="text-neutral-500">Weight </span>
            <span className="font-semibold text-neutral-950">{selected.weight}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3 rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-700 shrink-0">
          <span>Qty</span>
          <input
            type="number"
            min="1"
            max={selected?.stock !== null && selected?.stock !== undefined && selected?.stock !== "" ? parseInt(selected.stock, 10) : undefined}
            value={qty}
            onChange={(e) => {
              const maxVal = selected?.stock !== null && selected?.stock !== undefined && selected?.stock !== "" ? parseInt(selected.stock, 10) : 9999;
              setQty(Math.max(1, Math.min(maxVal, Number(e.target.value) || 1)));
            }}
            className="w-16 bg-transparent outline-none"
          />
        </label>
        {!isCallForInventory ? (
          selected?.stock !== undefined && selected?.stock !== null && selected?.stock !== "" ? (
            <div className={`rounded-full border px-4 py-2.5 text-sm font-semibold shrink-0 ${
              isOutOfStock
                ? "border-red-200 bg-red-50/70 text-red-700"
                : isLowStock
                ? "border-amber-200 bg-amber-50/70 text-amber-700"
                : "border-emerald-200 bg-emerald-50/70 text-emerald-700"
            }`}>
              {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${selected.stock} left!` : `In Stock (${selected.stock})`}
            </div>
          ) : (
            <div className="rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-sm font-semibold text-emerald-700 shrink-0">
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </div>
          )
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={isOutOfStock || adding}
        className="w-full rounded-full bg-neutral-950 px-8 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18l-2 11H5L3 9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9a4 4 0 018 0" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12v4m-2-2h4" />
        </svg>
        <span>
          {adding
            ? "Adding…"
            : isOutOfStock
            ? "Out of Stock"
            : isCallForInventory
            ? "Enquire Availability"
            : "Add to cart"}
        </span>
      </button>

      {applicableOffers.length > 0 && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/20 p-5 mt-4">
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wider mb-3">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Available Offers
          </h4>
          <div className="space-y-3 divide-y divide-amber-100/50">
            {applicableOffers.map((o, idx) => {
              let discountDetail = "";
              if (selected) {
                if (o.type === 'volume') {
                  const unitSavings = Math.round(selected.amount - o.discount_value);
                  discountDetail = `Get units at ₹${o.discount_value} each (Save ₹${unitSavings}/unit) when you buy ${o.min_qty} or more`;
                } else if (o.discount_type === 'percent') {
                  const priceAfterDiscount = Math.round(selected.amount * (1 - o.discount_value / 100));
                  discountDetail = `Save ${o.discount_value}% (Pay ₹${priceAfterDiscount} at checkout)`;
                } else if (o.discount_type === 'amount') {
                  const priceAfterDiscount = Math.max(0, Math.round(selected.amount - o.discount_value));
                  discountDetail = `Save ₹${o.discount_value} (Pay ₹${priceAfterDiscount} at checkout)`;
                }
              }

              return (
                <div key={o.id} className={`flex items-start justify-between gap-3 text-xs ${idx > 0 ? "pt-2.5" : ""}`}>
                  <div>
                    <p className="font-semibold text-neutral-900">{o.description}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{discountDetail}</p>
                  </div>
                  {o.code && (
                    <span className="shrink-0 rounded bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                      {o.code}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function DetailRelatedCard({ product, isEnquiryOnly }) {
  const onCartChange = useCartChange();
  const [adding, setAdding] = useState(false);
  const subscriptionUrl = getSubscriptionUrl({
    handle: product.handle,
    variantId: product.variantId || "",
    quantity: 1,
  });

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
      <Link href={`/product/${product.handle}`} className="block">
        <div className="relative aspect-square sm:h-52 bg-neutral-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.altText || product.title}
              fill
              className="object-contain object-center"
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
            href={`/product/${product.handle}`}
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
              href={`/product/${product.handle}`}
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

function FaqAccordion({ rows }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
      {rows.map((row, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="bg-white">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-neutral-50"
            >
              <span className="text-sm font-medium text-neutral-900">{row.question}</span>
              <svg
                className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && row.answer?.trim() ? (
              <div className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {row.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function getNutritionTabLabel(title) {
  const normalized = (title || "").trim();
  if (!normalized || /^nutrition(\s+facts?)?$/i.test(normalized)) {
    return "Nutrition";
  }
  return normalized;
}

export function ProductInfoTabs({ description, nutrition, ingredients, faq }) {
  const hasDescription = !!(description && description.replace(/<[^>]*>/g, "").trim());
  const hasNutrition = !!(nutrition?.rows?.length > 0);
  const nutritionLabel = getNutritionTabLabel(nutrition?.title);
  const hasIngredients = !!(ingredients && ingredients.trim());
  const faqRows = (faq?.rows || []).filter((row) => row.question?.trim());
  const hasFaq = faqRows.length > 0;

  const [activeTab, setActiveTab] = useState(
    hasDescription ? "description" : hasNutrition ? "nutrition" : hasIngredients ? "ingredients" : "faq"
  );

  if (!hasDescription && !hasNutrition && !hasIngredients && !hasFaq) return null;

  const tabs = [];
  if (hasDescription) tabs.push({ id: "description", label: "Description" });
  if (hasNutrition) tabs.push({ id: "nutrition", label: nutritionLabel });
  if (hasIngredients) tabs.push({ id: "ingredients", label: "Ingredients" });
  if (hasFaq) tabs.push({ id: "faq", label: faq?.title || "FAQ" });

  const showTabs = tabs.length > 1;

  return (
    <div className="mt-6 min-w-0 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      {showTabs && (
        <div className="mb-5 grid grid-cols-2 gap-x-2 gap-y-1 border-b border-neutral-100 sm:flex sm:flex-wrap sm:gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-[11px] font-bold uppercase tracking-wide transition-all border-b-2 -mb-px sm:text-sm sm:tracking-widest ${
                activeTab === tab.id ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {(!showTabs && hasDescription) || (showTabs && activeTab === "description") ? (
        <div>
          {!showTabs && <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">Description</p>}
          <div
            className="prose prose-sm max-w-none text-neutral-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      ) : null}

      {(!showTabs && hasNutrition) || (showTabs && activeTab === "nutrition") ? (
        <div>
          {!showTabs && (
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              {nutritionLabel}
            </p>
          )}
          {nutrition?.servingSize && (
            <p className="mb-3 text-sm text-neutral-500">Serving size: {nutrition.servingSize}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  {nutrition.columns?.map((col, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {nutrition.rows?.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                    {row.map((cell, j) => (
                      <td key={j} className={`px-4 py-2.5 text-neutral-700 ${j === 0 ? "font-medium" : ""}`}>
                        {cell.value}{cell.unit ? ` ${cell.unit}` : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {(!showTabs && hasIngredients) || (showTabs && activeTab === "ingredients") ? (
        <div>
          {!showTabs && (
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              Ingredients
            </p>
          )}
          <div className="text-sm text-neutral-700 whitespace-pre-line leading-relaxed">
            {ingredients}
          </div>
        </div>
      ) : null}

      {(!showTabs && hasFaq) || (showTabs && activeTab === "faq") ? (
        <div>
          {!showTabs && (
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-500">
              {faq?.title || "FAQ"}
            </p>
          )}
          <FaqAccordion rows={faqRows} />
        </div>
      ) : null}
    </div>
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
