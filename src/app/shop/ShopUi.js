"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { addToCart, removeFromCart, decreaseCartQuantity } from "./actions";
import { useCartChange } from "./CartContext";
import {
  getSubscriptionManagementUrl,
  getSubscriptionUrl,
} from "../../lib/subscription";

function buildShopHref({
  collectionHandle = "all",
  brandHandle = "all",
  productTypeHandle = "all",
}) {
  const query = new URLSearchParams();

  if (collectionHandle) {
    query.set("collection", collectionHandle);
  }

  if (brandHandle) {
    query.set("brand", brandHandle);
  }

  if (productTypeHandle) {
    query.set("type", productTypeHandle);
  }

  return query.toString() ? `/shop?${query.toString()}` : "/shop";
}

function MobileBottomSheet({ isOpen, title, onClose, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  if (!mounted || !isOpen) {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] sm:hidden"
        aria-label={`Close ${title}`}
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-[91] max-h-[72vh] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:hidden">
        <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-neutral-300" />
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-900">{title}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700"
            >
              Close
            </button>
          </div>
        )}
        <div className="space-y-1">{children}</div>
      </div>
    </>,
    document.body
  );
}

export function StatusPanel({ configured, error, storeDomain, isEnquiryOnly }) {
  if (isEnquiryOnly) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">Enquiry mode is active</p>
        <p className="mt-2">
          The storefront is currently collecting requirements through the
          contact form instead of taking online orders.
        </p>
      </div>
    );
  }

  if (configured && !error) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
        {/* <p className="font-semibold">Live catalog connected</p>
        <p className="mt-2">
          Products on this page are loading live from{" "}
          <span className="font-medium">{storeDomain}</span>.
        </p> */}
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

export function ShopCatalog({
  initialCatalog,
  initialRedirectTo,
  storefrontMode,
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [redirectTo, setRedirectTo] = useState(initialRedirectTo);
  const [catalogError, setCatalogError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [gridCols, setGridCols] = useState(1);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Client-side search filters
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("q") || "");
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    window.history.replaceState({}, document.title, `${window.location.pathname}?${params.toString()}`);
  };

  const filteredProducts = (catalog?.products || []).filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.vendor?.toLowerCase().includes(query) ||
      p.productType?.toLowerCase().includes(query)
    );
  });

  const topSearchedProducts =
    catalog?.topSearchedProducts?.length > 0
      ? catalog.topSearchedProducts
      : (catalog?.products || []).filter((p) => p.is_top_searched).length > 0
        ? (catalog?.products || []).filter((p) => p.is_top_searched)
        : (catalog?.products || []).slice(0, 4);

  useEffect(() => {
    const syncGridCols = () => {
      setGridCols(window.innerWidth < 1024 ? 1 : 4);
    };

    syncGridCols();
    window.addEventListener("resize", syncGridCols);

    return () => {
      window.removeEventListener("resize", syncGridCols);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const cartStatus = params.get("cart");
    if (cartStatus === "success" && orderId) {
      startTransition(async () => {
        try {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "cashfree",
              cf_order_id: orderId
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            alert("Payment successful! Your order has been placed.");
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload();
          } else {
            alert(verifyData.error || "Payment verification failed.");
          }
        } catch (e) {
          console.error("Cashfree redirect verification error", e);
        }
      });
    }
  }, []);

  const handleFilterChange = ({
    collectionHandle = catalog.activeCollection.handle,
    brandHandle = catalog.activeBrand,
    productTypeHandle = catalog.activeProductType,
  }) => {
    const safeCollection = collectionHandle || "all";
    const safeBrand = brandHandle || "all";
    const safeType = productTypeHandle || "all";

    const nextRedirectTo = buildShopHref({
      collectionHandle: safeCollection,
      brandHandle: safeBrand,
      productTypeHandle: safeType,
    });

    setRedirectTo(nextRedirectTo);
    window.history.replaceState({}, "", nextRedirectTo);

    startTransition(async () => {
      try {
        const apiPath = `/api/shop/catalog?collection=${safeCollection}&brand=${safeBrand}&type=${safeType}`;
        const response = await fetch(apiPath, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to update the catalog.");
        }

        const nextCatalog = await response.json();
        setCatalog(nextCatalog);
        setCatalogError("");
      } catch (error) {
        setCatalogError(
          error instanceof Error
            ? error.message
            : "Unable to update the catalog."
        );
      }
    });
  };

  const filterRef = useRef(null);
  const [filterPinned, setFilterPinned] = useState(false);
  const [stickyExpanded, setStickyExpanded] = useState(false);

  useEffect(() => {
    const el = filterRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFilterPinned(!entry.isIntersecting);
        if (entry.isIntersecting) setStickyExpanded(false);
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isColAll = !catalog.activeCollection?.handle || catalog.activeCollection.handle === "all";
  const isBrandAll = !catalog.activeBrand || catalog.activeBrand === "all";
  
  const colTitle = isColAll ? "" : catalog.activeCollection?.title;
  const brandTitle = isBrandAll ? "" : (catalog.brands?.find((b) => b.handle === catalog.activeBrand)?.title || catalog.activeBrand);

  let sharePhrase = "Shop finest dairy products";
  let labelContext = "";

  if (!isColAll && !isBrandAll) {
    sharePhrase = `Shop finest ${colTitle} ${brandTitle} products`;
    labelContext = `${colTitle} ${brandTitle}`;
  } else if (!isColAll) {
    sharePhrase = `Shop finest ${colTitle} products`;
    labelContext = colTitle;
  } else if (!isBrandAll) {
    sharePhrase = `Shop finest ${brandTitle} products`;
    labelContext = brandTitle;
  }

  const shareButtonLabel = (isColAll && isBrandAll) ? "Share" : `Share ${labelContext}`;

  const shareAction = () => {
    const title = sharePhrase;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title, text: sharePhrase, url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${sharePhrase}\n${url}`);
    }
  };

  return (
    <>
      {/* Sticky compact filter bar — sits below the navbar */}
      {filterPinned && !stickyExpanded && (
        <div className="fixed inset-x-0 top-[70px] z-40 animate-[slideDown_0.25s_ease-out] border-b border-[#e9dfcf] bg-white/90 shadow-md backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStickyExpanded(true)}
                className="flex items-center gap-2 rounded-full border border-[#e6dcc8] bg-[#fcf8f1] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#9a7a3f] transition hover:border-[#c9b07a]"
              >
                <svg className="h-4 w-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button
                onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                className="flex items-center gap-2 group"
                aria-pressed={showOnlyAvailable}
              >
                <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showOnlyAvailable ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${showOnlyAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 group-hover:text-[#7a5a26] transition-colors">In Stock</span>
              </button>
              
              {(catalog.activeCollection.handle !== "all" || catalog.activeBrand !== "all" || catalog.activeProductType !== "all" || showOnlyAvailable) && (
                <button
                  onClick={() => {
                    setShowOnlyAvailable(false);
                    handleFilterChange({
                      collectionHandle: "all",
                      brandHandle: "all",
                      productTypeHandle: "all",
                    });
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={shareAction} className="rounded-full border border-[#e9dfcf] bg-white p-2 text-neutral-600 transition hover:text-[#7a5a26]" aria-label="Share">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="rounded-full border border-[#e9dfcf] bg-white p-2 text-neutral-600 transition hover:text-[#7a5a26]" aria-label="Back to top">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky expanded filter panel — below navbar */}
      {filterPinned && stickyExpanded && (
        <div className="fixed inset-x-0 top-[70px] z-40 max-h-[calc(80vh-70px)] overflow-y-auto border-b border-[#e9dfcf] bg-white/95 shadow-lg backdrop-blur-md animate-[slideDown_0.25s_ease-out]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a7a3f]">Filter selection</p>
              <button onClick={() => setStickyExpanded(false)} className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400">Close</button>
            </div>
            <div className="flex flex-col gap-4">
              <CollectionFilters
                collections={catalog.collections}
                activeHandle={catalog.activeCollection.handle}
                onSelectHandle={(handle) => {
                  handleFilterChange({
                    collectionHandle: handle,
                    brandHandle: catalog.activeBrand,
                    productTypeHandle: catalog.activeProductType,
                  });
                  setStickyExpanded(false);
                }}
              />
              <BrandFilters
                brands={catalog.brands}
                activeHandle={catalog.activeBrand}
                onSelectHandle={(handle) => {
                  handleFilterChange({
                    collectionHandle: catalog.activeCollection.handle,
                    brandHandle: handle,
                    productTypeHandle: catalog.activeProductType,
                  });
                  setStickyExpanded(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div ref={filterRef} className="rounded-[2rem] border border-[#e9dfcf] bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a7a3f]">
                  Filter selection
                </p>
              </div>

              <button
                onClick={shareAction}
                className="flex items-center gap-2 rounded-full border border-[#e9dfcf] bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 transition hover:bg-neutral-50 hover:text-[#7a5a26]"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {shareButtonLabel}
              </button>
            </div>

            <div>
              {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Brands
              </p> */}
              <CollectionFilters
                collections={catalog.collections}
                activeHandle={catalog.activeCollection.handle}
                brandHandle={catalog.activeBrand}
                productTypeHandle={catalog.activeProductType}
                onSelectHandle={(handle) =>
                  handleFilterChange({
                    collectionHandle: handle,
                    brandHandle: catalog.activeBrand,
                    productTypeHandle: catalog.activeProductType,
                  })
                }
              />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <BrandFilters
                  brands={catalog.brands}
                  activeHandle={catalog.activeBrand}
                  collectionHandle={catalog.activeCollection.handle}
                  productTypeHandle={catalog.activeProductType}
                  onSelectHandle={(handle) =>
                    handleFilterChange({
                      collectionHandle: catalog.activeCollection.handle,
                      brandHandle: handle,
                      productTypeHandle: catalog.activeProductType,
                    })
                  }
                />
              </div>
              <div className="hidden items-center gap-3 shrink-0 mt-4 justify-end lg:flex lg:mt-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Layout</span>
                <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGridCols(num)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                        gridCols === num 
                          ? "bg-neutral-950 text-white shadow-sm" 
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {catalog.offers && catalog.offers.length > 0 && (
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Special Shop Offers
              </h3>
              <span className="text-[10px] text-neutral-400 font-medium">Scroll to view all →</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none">
              {catalog.offers.map((offer) => (
                <div 
                  key={offer.id} 
                  className="snap-start shrink-0 w-72 bg-gradient-to-br from-amber-50/40 to-white border border-amber-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition duration-250 flex flex-col justify-between"
                >
                  <div className="flex gap-3">
                    <div className="rounded-2xl bg-amber-100 p-2 text-amber-800 shrink-0 h-10 w-10 flex items-center justify-center">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12.89 3a2 2 0 0 0-1.78 0L3.39 6.84a2 2 0 0 0-1.12 1.79v6.74a2 2 0 0 0 1.12 1.79l7.72 3.84a2 2 0 0 0 1.78 0l7.72-3.84a2 2 0 0 0 1.12-1.79V8.63a2 2 0 0 0-1.12-1.79L12.89 3zm-.89 2.11L18 8.11V10H6V8.11l6-3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 text-sm tracking-tight leading-tight">{offer.description}</h4>
                      <p className="text-[11px] text-neutral-500 capitalize mt-1">
                        Applied to {offer.type}: <span className="font-semibold text-neutral-700">{offer.target_id}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-amber-100/50 pt-3">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 rounded-full px-2.5 py-0.5 border border-amber-100">
                      {offer.discount_type === "percent" 
                        ? `${offer.discount_value}% OFF` 
                        : offer.discount_type === "amount" 
                        ? `₹${offer.discount_value} OFF` 
                        : `Special ₹${offer.discount_value}`}
                    </span>
                    {offer.code ? (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(offer.code);
                          alert(`Promo code "${offer.code}" copied!`);
                        }}
                        className="rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                        title="Click to copy code"
                      >
                        Copy Code: {offer.code}
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">No Code Req.</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {catalogError ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {catalogError}
            </div>
          ) : null}

          {filteredProducts.length === 0 ? (
            <div className="space-y-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#e6dcc8]/65 bg-white/40 p-5 mt-6 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-neutral-450 shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm text-neutral-700 font-medium">
                    No products match your search for <span className="font-semibold text-neutral-950">"{searchQuery}"</span>.
                  </p>
                </div>
                <button
                  onClick={() => handleSearchChange("")}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition shadow-sm shrink-0"
                >
                  Clear Search
                  <svg className="h-3.5 w-3.5 text-white/80" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Top Searched Products Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#e9dfcf] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#9a7a3f] flex items-center gap-2">
                    <svg className="h-4.5 w-4.5 text-[#9a7a3f] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.373-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                    Top Searched
                  </h3>
                </div>
                <ProductGrid
                  products={topSearchedProducts}
                  redirectTo={redirectTo}
                  isEnquiryOnly={storefrontMode.isEnquiryOnly}
                  gridCols={gridCols}
                  isPending={false}
                />
              </div>
            </div>
          ) : (
            <div className="relative mt-8">
              {isPending ? (
                <div className="pointer-events-none absolute inset-0 z-10 rounded-[2rem] bg-[#f7f1e5]/70 backdrop-blur-[2px]" />
              ) : null}

              <ProductGrid
                products={showOnlyAvailable ? filteredProducts.filter(p => p.availableForSale) : filteredProducts}
                redirectTo={redirectTo}
                isEnquiryOnly={storefrontMode.isEnquiryOnly}
                gridCols={gridCols}
                isPending={isPending}
              />
            </div>
          )}
      </div>
    </>
  );
}

export function CollectionFilters({
  collections = [],
  activeHandle,
  brandHandle = "all",
  productTypeHandle = "all",
  onSelectHandle,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeHandles = (activeHandle || "all").split(",").map(h => h.trim());
  const activeCollection = (collections || []).find((c) => activeHandles.includes(c.handle)) || collections?.[0] || { title: "All", handle: "all" };

  return (
    <div className="relative">
      {/* Mobile Trigger */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-full border border-[#e6dcc8] bg-[#fcf8f1] px-5 py-3 text-left text-sm font-medium text-neutral-700 transition hover:border-[#c9b07a]"
        >
          <span className="truncate pr-3">
            <span className="text-neutral-400 font-normal mr-1.5">Category:</span>
            {activeCollection.title}
          </span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>

        {isOpen && (
          <MobileBottomSheet
            isOpen={isOpen}
            title=""
            onClose={() => setIsOpen(false)}
          >
            {collections.map((collection) => {
              const isActive = activeHandles.includes(collection.handle) || (collection.handle === "all" && activeHandles.includes("all"));
              return (
                <button
                  type="button"
                  key={collection.id}
                  onClick={() => {
                    if (onSelectHandle) {
                      if (isActive && collection.handle !== "all") {
                        onSelectHandle("all");
                      } else {
                        onSelectHandle(collection.handle);
                      }
                    }
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span className="flex-1">{collection.title}</span>
                  {isActive && (
                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
              );
            })}
          </MobileBottomSheet>
        )}
      </div>

      {/* Desktop Grid */}
      <div className="hidden sm:flex sm:flex-wrap sm:gap-2 xl:flex-nowrap xl:overflow-x-auto xl:pb-1">
        {collections.map((collection) => {
          const isActive = activeHandles.includes(collection.handle) || (collection.handle === "all" && activeHandles.includes("all"));

          return (
            <button
              type="button"
              key={collection.id}
              onClick={() => {
                if (isActive && collection.handle !== "all") {
                  onSelectHandle?.("all");
                } else {
                  onSelectHandle?.(collection.handle);
                }
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-[1.2rem] border px-4 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500"
              }`}
            >
              <span className="whitespace-nowrap leading-5">{collection.title}</span>
              {isActive && collection.handle !== "all" && (
                <svg className="h-3.5 w-3.5 text-white/70 hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function ProductTypeFilters({
  productTypes = [],
  activeHandle,
  collectionHandle = "all",
  brandHandle = "all",
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!productTypes?.length) {
    return null;
  }

  const activeProductType = (productTypes || []).find((p) => p.handle === activeHandle) || productTypes?.[0] || { title: "All", handle: "all" };

  return (
    <div className="relative mt-4">
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-left text-sm font-medium text-neutral-700 transition hover:border-neutral-400 flex justify-between items-center"
        >
          <span>
            <span className="text-neutral-400 font-normal mr-1.5">Type:</span>
            {activeProductType.title}
          </span>
          <svg className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            <div className="py-1">
              {productTypes.map((productType) => {
                const query = new URLSearchParams();
                if (collectionHandle && collectionHandle !== "all") {
                  query.set("collection", collectionHandle);
                }
                if (brandHandle && brandHandle !== "all") {
                  query.set("brand", brandHandle);
                }
                if (productType.handle && productType.handle !== "all") {
                  query.set("type", productType.handle);
                }
                const href = query.toString() ? `/shop?${query.toString()}` : "/shop";
                return (
                  <Link
                    key={productType.handle}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {productType.title}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Links */}
      <div className="hidden sm:flex flex-wrap gap-3">
        {productTypes.map((productType) => {
          const isActive = productType.handle === activeHandle;
          const query = new URLSearchParams();

          if (collectionHandle && collectionHandle !== "all") {
            query.set("collection", collectionHandle);
          }

          if (brandHandle && brandHandle !== "all") {
            query.set("brand", brandHandle);
          }

          if (!isActive && productType.handle && productType.handle !== "all") {
            query.set("type", productType.handle);
          }

          const href = query.toString() ? `/shop?${query.toString()}` : "/shop";

          return (
            <Link
              key={productType.handle}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-amber-600 text-white"
                  : "border border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300"
              }`}
            >
              <span>{productType.title}</span>
              {isActive && productType.handle !== "all" && (
                <svg className="h-3.5 w-3.5 text-white/70 hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function BrandFilters({
  brands = [],
  activeHandle,
  collectionHandle = "all",
  productTypeHandle = "all",
  onSelectHandle,
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!brands?.length) {
    return null;
  }

  const activeBrand = (brands || []).find((b) => b.handle === activeHandle) || brands?.[0] || { title: "All", handle: "all" };

  return (
    <div className="relative mt-4">
      {/* Mobile Bottom Sheet */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-full border border-[#e6dcc8] bg-[#fcf8f1] px-5 py-3 text-left text-sm font-medium text-neutral-700 transition hover:border-[#c9b07a]"
        >
          <span className="truncate pr-3">
            <span className="text-neutral-400 font-normal mr-1.5">Brand:</span>
            {activeBrand.title}
          </span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        {isOpen && (
          <MobileBottomSheet
            isOpen={isOpen}
            title="Brands"
            onClose={() => setIsOpen(false)}
          >
            {brands.map((brand) => {
              const isActive = brand.handle === activeHandle;
              return (
                <button
                  type="button"
                  key={brand.handle}
                  onClick={() => {
                    if (isActive && brand.handle !== "all") {
                      onSelectHandle?.("all");
                    } else {
                      onSelectHandle?.(brand.handle);
                    }
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {brand.image && (
                      <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                        <Image src={brand.image} alt="" fill className="object-contain p-1" />
                      </div>
                    )}
                    <span>{brand.title}</span>
                  </div>
                  {isActive ? (
                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </MobileBottomSheet>
        )}
      </div>

      {/* Desktop Links */}
      <div className="hidden sm:flex flex-wrap gap-2 lg:flex-nowrap lg:overflow-x-auto lg:pb-1">
        {brands.map((brand) => {
          const isActive = brand.handle === activeHandle;
          return (
            <button
              type="button"
              key={brand.handle}
              onClick={() => {
                if (isActive && brand.handle !== "all") {
                  onSelectHandle?.("all");
                } else {
                  onSelectHandle?.(brand.handle);
                }
              }}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-1.5 pr-4 py-1.5 text-xs font-semibold tracking-[0.04em] transition sm:text-sm ${
                isActive
                  ? "bg-neutral-950 text-white shadow-[0_10px_30px_rgba(23,23,23,0.12)]"
                  : "border border-[#e6dcc8] bg-[#fcf8f1] text-neutral-700 hover:border-[#c9b07a] hover:text-[#7a5a26]"
              }`}
            >
              {brand.image ? (
                <span className="relative h-6 w-6 overflow-hidden rounded-full border border-neutral-200 bg-white">
                  <Image src={brand.image} alt="" fill className="object-contain p-0.5" />
                </span>
              ) : (
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-neutral-200'}`}>
                  {brand.title === "All" ? "*" : brand.title.slice(0,1)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                {brand.title}
                {isActive && brand.handle !== "all" && (
                  <svg className="h-3.5 w-3.5 text-white/70 hover:text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const BATCH_SIZE = 12;

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm animate-pulse">
      <div className="h-72 bg-neutral-200" />
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded-full bg-neutral-200" />
            <div className="h-5 w-40 rounded-full bg-neutral-200" />
          </div>
          <div className="h-7 w-16 rounded-full bg-neutral-200" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 flex-1 rounded-full bg-neutral-200" />
          <div className="h-12 flex-1 rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ products, redirectTo, isEnquiryOnly, gridCols, isPending }) {
  const rowSize = gridCols === 1 ? 2 : gridCols === 2 ? 2 : gridCols === 3 ? 3 : 4;
  const [visibleCount, setVisibleCount] = useState(rowSize);
  const [prevProductKey, setPrevProductKey] = useState("");
  const sentinelRef = useRef(null);

  const productKey = products.map((p) => p.id).join(",");

  if (productKey !== prevProductKey) {
    setPrevProductKey(productKey);
    setVisibleCount(rowSize);
  }

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + rowSize, products.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [products.length, visibleCount, rowSize]);

  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const skeletonCount = Math.min(rowSize, products.length - visibleCount);

  const gridClass = `grid gap-4 sm:gap-6 ${
    gridCols === 1 ? "grid-cols-1 lg:grid-cols-2" :
    gridCols === 2 ? "grid-cols-2 lg:grid-cols-2" :
    gridCols === 3 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3" :
    "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
  }`;

  if (products.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white/90 p-10 text-neutral-600">
        No products were found in this collection yet.
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={gridClass}>
        {Array.from({ length: rowSize }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={gridClass}>
        {visible.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            redirectTo={redirectTo}
            isEnquiryOnly={isEnquiryOnly}
            gridCols={gridCols}
            priority={index < 4}
          />
        ))}
      </div>
      {hasMore ? <div ref={sentinelRef} className="h-1" /> : (
        <div className="mt-8 text-center text-sm font-medium text-neutral-500 py-4">
           End of the List
        </div>
      )}
    </>
  );
}

function NotifyPopup({ productTitle, onClose }) {
  const [name, setName] = useState("");
  const [pincode, setPincode] = useState("");

  const CONTACT_NUMBERS = ["919654979085", "919654979085"]; // The "both" numbers

  const isValid = name.trim() && pincode.length === 6;

  const handleSend = (number) => {
    const msg = `Hi, I'm ${name.trim()} from pincode ${pincode}. I'm interested in ${productTitle} for bulk order. Please notify me when it's back in stock.`;
    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
    onClose();
  };

  const handleCall = (number) => {
    window.location.href = `tel:+${number}`;
  };

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[95] bg-black/45 backdrop-blur-[2px]"
        aria-label="Close notify popup"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-1/2 z-[96] max-w-sm mx-auto -translate-y-1/2 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl animate-[slideDown_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-neutral-900">Notify me for {productTitle}</p>
          <button type="button" onClick={onClose} className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:border-neutral-400">Close</button>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="Pincode (e.g. 110001)"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      <div className="mt-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-1">Choose contact</p>
        {CONTACT_NUMBERS.map((num, idx) => (
          <div key={`${num}-${idx}`} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSend(num)}
              disabled={!isValid}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#20bd5c] disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.88 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => handleCall(num)}
              className="rounded-full border border-neutral-300 p-2.5 text-neutral-600 transition hover:bg-neutral-50"
              aria-label="Call now"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      </div>
    </>,
    document.body
  );
}

export function ProductCard({ product, redirectTo, isEnquiryOnly, gridCols, priority = false }) {
  const onCartChange = useCartChange();
  const [adding, setAdding] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const isCompact = gridCols >= 3;
  const isList = gridCols === 1;
  const canShowDiscount = product.showDiscount && !product.askPrice;
  const subscriptionUrl = getSubscriptionUrl({
    handle: product.handle,
    variantId: product.variantId || "",
    quantity: 1,
  });
  const subscriptionManagementUrl = getSubscriptionManagementUrl();

  const handleAdd = async () => {
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
    <article className={`glossy-card overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-[#e6dcc8]/60 bg-white/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-[0_20px_50px_rgba(201,176,122,0.12)] hover:bg-white/60 hover:border-[#c9b07a]/40 ${isList ? 'flex flex-row items-stretch' : 'flex flex-col'}`}>
      <Link href={`/shop/${product.handle}`} className={`block ${isList ? 'w-2/5 shrink-0' : ''}`}>
        <div className={`relative bg-transparent h-full ${!isList && (isCompact ? 'aspect-square sm:aspect-auto sm:h-48' : 'aspect-square sm:aspect-auto sm:h-72')}`}>
          <div className="absolute top-4 left-4 z-10">
            {/* <span className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${isCompact ? 'text-[8px]' : 'text-[10px]'} ${
              product.availableForSale 
                ? "bg-emerald-500/90 text-white" 
                : "bg-amber-500/90 text-white"
            }`}>
              {product.availableForSale ? (isCompact ? "Live" : "Available") : "Sold"}
            </span> */}
          </div>

          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.altText}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-opacity duration-300"
            />
          ) : (
            <div className={`flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.32),_transparent_45%),linear-gradient(135deg,_#faf5e8,_#f5efe2_55%,_#ebe1cc)] ${isList ? 'p-3' : 'p-6'}`}>
              <span className={`font-medium uppercase tracking-[0.25em] text-neutral-600 ${isCompact || isList ? 'text-xs' : 'text-sm'}`}>
                Aurum
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className={`flex flex-col justify-between ${isList ? 'w-3/5 p-4 sm:p-5' : (isCompact ? 'p-3 sm:p-4 space-y-4' : 'p-6 space-y-4')}`}>
        <div className={`flex items-start justify-between gap-2 ${isList ? 'mb-4' : ''}`}>
          <div className="min-w-0">
            {product.vendor && !isCompact && !isList ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500 truncate">
                {product.vendor}
              </p>
            ) : null}
            <Link
              href={`/shop/${product.handle}`}
              className={`mt-1 block font-semibold text-neutral-950 hover:text-neutral-700 ${isCompact ? 'text-sm' : 'text-xl'}`}
            >
              {product.title}
            </Link>
            {product.variants && product.variants.length > 1 ? (
              <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600">
                {product.variants.length} options available
              </p>
            ) : (
              <>
                {!isList && product.packSize && !isCompact ? (
                  <p className="mt-1 text-xs font-medium text-neutral-500">
                    {product.packSize} {product.unitPrice ? `• ₹${product.unitPrice}/kg` : ''}
                  </p>
                ) : null}
                
                {isList ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
                    {product.productType && <span>{product.productType}</span>}
                    {product.productType && (product.packSize || product.price) && <span className="text-neutral-300">•</span>}
                    {product.packSize && <span>{product.packSize} {product.unitPrice ? `• ₹${product.unitPrice}/kg` : ''}</span>}
                    {product.packSize && product.price && <span className="text-neutral-300">•</span>}
                    {product.price && (
                      <div className="flex items-center gap-1.5">
                        {canShowDiscount && <span className="text-neutral-400 line-through text-[10px]">₹{product.originalPrice}</span>}
                        <span className="text-neutral-900 font-bold">{product.askPrice ? "Ask Price" : `₹${product.sellingPrice}`}</span>
                        {canShowDiscount && (
                           <span className="text-[10px] font-bold text-emerald-600 ml-1">
                             {product.discountPercent}% OFF
                           </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>
          {!(product.variants && product.variants.length > 1) && !isList && (
            <div className={`shrink-0 flex flex-col items-end gap-0.5`}>
              <div className={`flex items-center gap-1.5 rounded-full bg-neutral-100 px-2 py-0.5 font-medium whitespace-nowrap ${isCompact ? 'text-[10px]' : 'text-sm'}`}>
                {canShowDiscount && (
                  <span className="text-neutral-400 line-through">₹{product.originalPrice}</span>
                )}
                <span className="text-neutral-700">{product.askPrice ? "Ask Price" : `₹${product.sellingPrice}`}</span>
              </div>
              {canShowDiscount && !isCompact && (
                 <div className="text-[10px] font-bold text-emerald-600 px-2 uppercase tracking-wide">
                   {product.discountPercent}% OFF (Save ₹{product.savedAmount})
                 </div>
              )}
            </div>
          )}
        </div>

        <div className={`grid gap-2 w-full ${product.variants && product.variants.length > 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          <Link
            href={`/shop/${product.handle}`}
            className={`flex w-full items-center justify-center rounded-full border transition ${
              product.variants && product.variants.length > 1
                ? 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
            } ${isCompact ? 'p-2 sm:px-4 sm:py-2.5' : 'px-3 py-2.5 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm'}`}
            title={product.variants && product.variants.length > 1 ? "View options" : "Details"}
            aria-label={product.variants && product.variants.length > 1 ? "View options" : "Details"}
          >
            {product.variants && product.variants.length > 1 ? (
              <>
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h18m-6-6 6 6-6 6" />
                </svg>
                <span className="whitespace-nowrap">View options</span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Details</span>
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </Link>
          
          {!(product.variants && product.variants.length > 1) && (
            <div className="w-full">
              {product.availableForSale ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  className={`flex w-full items-center justify-center rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:opacity-60 ${isCompact ? 'p-2 sm:px-4 sm:py-2.5' : 'px-3 py-2.5 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm'}`}
                  aria-label={isEnquiryOnly ? "Proceed to enquire" : "Add to cart"}
                >
                  {adding
                    ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2Z" />
                        </svg>
                        <span className="sr-only">Adding to cart</span>
                      </>
                    )
                    : (
                      <div className="flex items-center justify-center gap-2" aria-label="Add to bucket">
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18l-2 11H5L3 9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9a4 4 0 018 0" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12v4m-2-2h4" />
                        </svg>
                        <span className="whitespace-nowrap">{isEnquiryOnly ? "Enquire" : "Add to cart"}</span>
                      </div>
                    )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowNotify(true)}
                    className={`flex w-full items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-[#20bd5c] shadow-sm ${isCompact ? 'p-2 sm:px-4 sm:py-2.5' : 'px-3 py-2.5 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm'}`}
                    aria-label="Notify me"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.88 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span className="whitespace-nowrap">Notify</span>
                  </button>
                  {showNotify ? (
                    <NotifyPopup 
                      productTitle={product.title} 
                      onClose={() => setShowNotify(false)} 
                    />
                  ) : null}
                </>
              )}
            </div>
          )}
          {subscriptionUrl ? (
            <a
              href={subscriptionUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex w-full items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-amber-950 transition hover:border-amber-400 hover:bg-amber-100 ${isCompact ? 'p-2 sm:px-4 sm:py-2.5' : 'px-3 py-2.5 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm'}`}
              title="Subscribe on Shopify"
              aria-label="Subscribe on Shopify"
            >
              <svg className="h-4 w-4 shrink-0 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v12H5.5L4 17.5V4z" />
              </svg>
              <span className="hidden whitespace-nowrap sm:inline">Subscribe</span>
            </a>
          ) : null}
          {subscriptionManagementUrl ? (
            <a
              href={subscriptionManagementUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex w-full items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50 ${isCompact ? 'p-2 sm:px-4 sm:py-2.5' : 'px-3 py-2.5 text-xs font-medium sm:px-4 sm:py-3 sm:text-sm'}`}
              title="Manage subscription"
              aria-label="Manage subscription"
            >
              <svg className="h-4 w-4 shrink-0 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6h10M4 6h2m4 6h10M4 12h2m4 6h10M4 18h2" />
              </svg>
              <span className="hidden whitespace-nowrap sm:inline">Manage</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function CartPanel({
  cart,
  isConfigured,
  redirectTo,
  className = "",
  isEnquiryOnly = false,
  onCartChange,
}) {
  const [isPending, startTransition] = useTransition();
  
  // Payment Gateway Hooks
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const loadScript = (src) => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayOnline = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setCheckoutError("");

    try {
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.lines.map((l) => ({
            productId: l.productId || l.id,
            variantId: l.merchandiseId,
            title: l.title,
            variantTitle: l.variantTitle,
            price: parseFloat(l.price?.replace(/[^\d.]/g, '') || 0),
            quantity: l.quantity
          })),
          customerName,
          customerEmail,
          customerPhone
        })
      });

      const res = await checkoutRes.json();
      if (!checkoutRes.ok) {
        setCheckoutError(res.error || "Failed to initiate checkout.");
        setCheckoutLoading(false);
        return;
      }

      if (res.provider === "razorpay") {
        const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!scriptLoaded) {
          setCheckoutError("Failed to load Razorpay library.");
          setCheckoutLoading(false);
          return;
        }

        const options = {
          key: res.key,
          amount: res.amount,
          currency: res.currency,
          name: "Aurum Bites",
          description: "Online Order Payment",
          order_id: res.orderId,
          handler: async function (paymentRes) {
            try {
              setCheckoutLoading(true);
              const verifyRes = await fetch("/api/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  provider: "razorpay",
                  razorpay_payment_id: paymentRes.razorpay_payment_id,
                  razorpay_order_id: paymentRes.razorpay_order_id,
                  razorpay_signature: paymentRes.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                alert("Payment successful! Your order has been placed.");
                window.location.reload();
              } else {
                setCheckoutError(verifyData.error || "Payment verification failed.");
              }
            } catch (err) {
              setCheckoutError("Error verifying payment.");
            } finally {
              setCheckoutLoading(false);
            }
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone
          },
          theme: {
            color: "#9a7a3f"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setCheckoutLoading(false);

      } else if (res.provider === "cashfree") {
        const scriptLoaded = await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
        if (!scriptLoaded) {
          setCheckoutError("Failed to load Cashfree library.");
          setCheckoutLoading(false);
          return;
        }

        const cashfree = window.Cashfree({
          mode: res.cfEnv === "production" ? "production" : "sandbox"
        });
        
        cashfree.checkout({
          paymentSessionId: res.paymentSessionId,
          returnUrl: `${window.location.origin}/shop?cart=success&orderId=${res.orderId}`
        });
      }

    } catch (error) {
      console.error("Pay online error:", error);
      setCheckoutError("An unexpected error occurred during payment processing.");
      setCheckoutLoading(false);
    }
  };

  const infoBoxClassName = "border-neutral-200 bg-neutral-50 text-neutral-700";
  const infoMessage = isEnquiryOnly
    ? "Review your items and place your order directly via WhatsApp."
    : "Provide details and pay securely online to finalize your purchase.";

  const handleAdd = (line) => {
    startTransition(async () => {
      const result = await addToCart({
        handle: line.productHandle,
        variantId: line.merchandiseId || "",
        quantity: 1,
      });
      if (onCartChange) onCartChange(result);
    });
  };

  const handleDecrease = (line) => {
    startTransition(async () => {
      const result = await decreaseCartQuantity({
        lineId: line.id,
        handle: line.productHandle,
        currentQuantity: line.quantity,
      });
      if (onCartChange) onCartChange(result);
    });
  };

  const handleRemove = (line) => {
    startTransition(async () => {
      const result = await removeFromCart({
        lineId: line.id,
        handle: line.productHandle,
      });
      if (onCartChange) onCartChange(result);
    });
  };

  return (
    <aside
      className={`rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm ${className}`.trim()}
    >
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
        All orders are processed through WhatsApp for the fastest support and delivery estimates.
      </p>

      <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${infoBoxClassName}`}>
        {infoMessage}
      </div>

      <div className={`mt-6 space-y-4 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        {cart.lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500">
            Add a product to start your enquiry.
          </div>
        ) : (
          cart.lines.map((line) => (
            <div
              key={line.id}
              className="rounded-2xl border border-neutral-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-950">{line.title}</p>
                  {line.variantTitle && line.variantTitle !== "Default Title" && line.variantTitle !== "Preview item" ? (
                    <p className="mt-0.5 text-xs text-neutral-500">{line.variantTitle}</p>
                  ) : null}
                  <p className="mt-1 text-sm text-neutral-700">{line.price}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(line)}
                  disabled={isPending}
                  className="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label={`Remove ${line.title}`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecrease(line)}
                  disabled={isPending}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold text-neutral-950">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdd(line)}
                  disabled={isPending}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        {cart.totalQuantity > 0 ? (
          isEnquiryOnly ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Share Order to WhatsApp</p>
              <button
                type="button"
                onClick={() => {
                  const items = cart.lines.map(line => `- ${line.title} x ${line.quantity} (${line.price || ''})`).join('%0A');
                  const msg = `Hi! I would like to order the following items:%0A%0A${items}%0A%0ATotal items: ${cart.totalQuantity}`;
                  window.open(`https://wa.me/919654979085?text=${msg}`, '_blank', 'noopener,noreferrer');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#20bd5c]"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.88 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Send to WhatsApp
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayOnline} className="space-y-4 pt-4 border-t border-neutral-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9a7a3f]">Checkout Details</p>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)} 
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    value={customerEmail} 
                    onChange={(e) => setCustomerEmail(e.target.value)} 
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    required 
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)} 
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 bg-white"
                  />
                </div>

                {checkoutError && (
                  <p className="text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg">{checkoutError}</p>
                )}

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {checkoutLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Proceed to Pay Online"
                  )}
                </button>
              </form>
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600">
              Add a product to get started.
            </div>
          )}
        </div>
    </aside>
  );
}

export function MobileCartWidget({ cart, isConfigured, redirectTo, isEnquiryOnly }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-3 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(23,23,23,0.24)] transition hover:bg-neutral-800"
        aria-label="Open cart"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18l-2 11H5L3 9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9a4 4 0 018 0" />
        </svg>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">
          {cart.totalQuantity}
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close cart"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-neutral-50 p-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-neutral-300" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  Quick cart
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Review items without leaving the page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
              >
                Close
              </button>
            </div>
            <CartPanel
              cart={cart}
              isConfigured={isConfigured}
              redirectTo={redirectTo}
              isEnquiryOnly={isEnquiryOnly}
              className="border-none shadow-none"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

const SUB_CATEGORY_DATA = [
  {
    title: "Dairy Spreads & Cream",
    collection: "cream,butter",
    items: [
      "Salted Butter",
      "Unsalted Butter",
      "Fresh Cream",
      "Sour Cream",
      "Cooking Cream",
      "Whipping Cream",
    ],
    images: ["/categories/saltedbutter.jpg", "/categories/freshcream.jpg", "/categories/whippingcream.png"],
  },
  {
    title: "Cheese",
    collection: "cheese--slice",
    items: [
      "Mozzarella",
      "Burrata",
      "Ricotta",
      "Mascarpone",
      "Scamorza",
      "Fiordilatte",
    ],
    images: ["/categories/mozerellacheese.jpg", "/categories/Mascarpone.png", "/categories/FreshCheese.png"],
  },
  {
     title: "Imported Cheese",
    collection: "cheese--slice",
    items: [
      "Blue Cheese",
      "Parmesan",
      "Cheddar Mild White",
      "Cheddar Mild Coloured",
      "Brie",
      "Camembert",
      "Soft Goat Cheese",
      "Edam Mild Ball",
      "Feta Cheese",
      "Emmental",
    ],
    images: ["/categories/CREAMCHEESE.png", "/categories/dlectacheese.webp", "/categories/BriePresident.png"],
  },
  {title: "Dry",
    collection: "dry",
    items: [
      "Fries",
      "Penne",
      "Spaghetti",
      "Farfalle",
      "Fusilli",
      "Pelati",
      "Olives",
      "Olive Oil",
    ],
    images: ["/products/fries.jpg", "/products/Farfalle.jpg", "/products/spaghetti.jpg"],
  },
];

export function Sublistcategory() {
 const [active, setActive] = useState(0);
  const [openMobile, setOpenMobile] = useState(null);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CATEGORY LIST */}
        <div className="space-y-4">
          {SUB_CATEGORY_DATA.map((cat, i) => {
            const isOpen = openMobile === i;

            return (
              <div key={cat.title}>
                {/* CATEGORY CARD */}
                <div
                  onMouseEnter={() => setActive(i)}
                  onClick={() =>
                    setOpenMobile(isOpen ? null : i)
                  }
                  className={`h-24 rounded-2xl border p-4 flex items-center justify-between
                    cursor-pointer transition-all
                    border-gray-200 bg-white text-gray-900
                    hover:shadow-lg
                    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:shadow-none
                    ${
                      active === i
                        ? "md:bg-[#0b1537] md:text-white md:border-[#0b1537]"
                        : ""
                    }`}
                >
                  <div>
                    <h3 className="text-lg font-semibold">
                      {cat.title}
                    </h3>
                  </div>

                  {/* PLUS / MINUS (MOBILE) */}
                  <span className="md:hidden text-2xl font-light">
                    {isOpen ? "−" : "+"}
                  </span>
                </div>

                {/* MOBILE DETAILS */}
                <div
                  className={`md:hidden overflow-hidden transition-all duration-300
                    ${isOpen ? "max-h-[700px] mt-4" : "max-h-0"}
                  `}
                >
                  <SubCategoryMobileDetails cat={cat} />
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP DETAILS */}
        <div className="hidden md:block md:col-span-2">
          <div className="min-h-[440px] rounded-3xl border p-8 shadow-lg
                          bg-white border-gray-200
                          dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-[#0b1537] dark:text-[#fde4bc]">
                {SUB_CATEGORY_DATA[active].title}
              </h2>
              <Link 
                href={`/shop?collection=${SUB_CATEGORY_DATA[active].collection}&brand=all&type=all`}
                className="group flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                View All
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <p className="text-md mb-8 text-gray-500 dark:text-gray-400">
                Explore our a wide variety of {SUB_CATEGORY_DATA[active].title.toLowerCase()}
            </p>

            {/* ITEMS */}
            <div className="flex flex-wrap gap-3 mb-8">
              {SUB_CATEGORY_DATA[active].items.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 text-sm rounded-full
                             border border-gray-200 bg-white text-gray-700
                             hover:bg-gray-50 hover:border-gray-300
                             dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700
                             transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* IMAGE STRIP */}
            <div className="grid grid-cols-3 gap-4">
              {SUB_CATEGORY_DATA[active].images.map((img, idx) => (
                <div
                  key={idx}
                  className="h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800"
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubCategoryMobileDetails({ cat }) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm
                    bg-white border-gray-200
                    dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xl font-bold text-[#0b1537] dark:text-[#fde4bc]">
          {cat.title}
        </h4>
        <Link 
          href={`/shop?collection=${cat.collection}&brand=all&type=all`}
          className="text-xs font-bold text-amber-600 uppercase tracking-wider"
        >
          View All
        </Link>
      </div>
      <p className="text-sm mb-4 text-gray-500 dark:text-gray-400">
        Explore our a wide variety of {cat.title.toLowerCase()}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {cat.items.map((item) => (
          <span
            key={item}
            className="px-3 py-1.5 text-xs rounded-full
                       border border-gray-200 bg-white text-gray-700
                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cat.images.map((img, i) => (
          <div
            key={i}
            className="h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800"
          >
            <img
              src={img}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              alt=""
            />
          </div>
        ))}
      </div>
    </div>
  );
}
