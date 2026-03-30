"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, ValidationError } from "@formspree/react";
import { createPortal } from "react-dom";
import { addToCartAction, removeFromCartAction } from "./actions";

const FILTER_LOGO_MAP = {
  president: "/brands/president.jpg",
  cremeitalia: "/brands/cremeitalia.jpg",
  "modern dairy": "/brands/moderndairy.jpg",
  moderndairy: "/brands/moderndairy.jpg",
  "pasta zara": "/brands/pastazara.jpg",
  pastazara: "/brands/pastazara.jpg",
  "dairy craft": "/brands/dairycraft.png",
  dlecta: "/brands/dlecta.jpg",
  amul: "/brands/amul.jpg",
  Prabhat: "/brands/prabhatdairy.png",
};

function getFilterLogo(item) {
  const handleKey = (item.handle || "").toLowerCase();
  const titleKey = (item.title || "").toLowerCase();

  return FILTER_LOGO_MAP[handleKey] || FILTER_LOGO_MAP[titleKey] || null;
}

function buildShopHref({
  collectionHandle = "all",
  brandHandle = "all",
  productTypeHandle = "all",
}) {
  const query = new URLSearchParams();

  if (collectionHandle && collectionHandle !== "all") {
    query.set("collection", collectionHandle);
  }

  if (brandHandle && brandHandle !== "all") {
    query.set("brand", brandHandle);
  }

  if (productTypeHandle && productTypeHandle !== "all") {
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
        <div className="space-y-1">{children}</div>
      </div>
    </>,
    document.body
  );
}

function isLargeOrder(cart) {
  return (
    cart.totalQuantity > 5 ||
    (cart.subtotalAmount !== null && cart.subtotalAmount > 2000)
  );
}

function buildCartSummary(cart) {
  if (!cart?.lines?.length) {
    return "";
  }

  const itemLines = cart.lines.map((line) => {
    const variantSuffix =
      line.variantTitle &&
      line.variantTitle !== "Default Title" &&
      line.variantTitle !== "Preview item"
        ? ` (${line.variantTitle})`
        : "";

    return `- ${line.title}${variantSuffix} x ${line.quantity}${line.price ? ` - ${line.price}` : ""}`;
  });

  return [
    "Large order request from cart",
    `Total items: ${cart.totalQuantity}`,
    cart.subtotal ? `Cart value: ${cart.subtotal}` : null,
    "Requested products:",
    ...itemLines,
  ]
    .filter(Boolean)
    .join("\n");
}

function LargeOrderCartForm({ cart }) {
  const [state, handleSubmit] = useForm("meeogqqd");
  const [step, setStep] = useState(1);
  const cartSummary = buildCartSummary(cart);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    phone: "",
  });

  if (state.succeeded) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-semibold">Request sent</p>
        <p className="mt-2">
          We received your cart details and will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-950">
            Large order support
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Orders above Rs 2000 or more than 5 items are handled manually so
            we can confirm availability and delivery with you.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
          Step {step} of 2
        </span>
      </div>

      {step === 1 ? (
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="cart-order-name"
              className="block text-sm font-medium text-neutral-700"
            >
              Name
            </label>
            <input
              id="cart-order-name"
              name="name_preview"
              type="text"
              required
              value={contactDetails.name}
              onChange={(event) =>
                setContactDetails((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label
              htmlFor="cart-order-phone"
              className="block text-sm font-medium text-neutral-700"
            >
              Phone number
            </label>
            <input
              id="cart-order-phone"
              name="phone_preview"
              type="tel"
              required
              value={contactDetails.phone}
              onChange={(event) =>
                setContactDetails((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!contactDetails.name.trim() || !contactDetails.phone.trim()}
            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input type="hidden" name="name" value={contactDetails.name} />
          <input type="hidden" name="phone" value={contactDetails.phone} />
          <input type="hidden" name="cart_summary" value={cartSummary} />
          <input type="hidden" name="order_total" value={cart.subtotal || ""} />
          <input type="hidden" name="total_items" value={String(cart.totalQuantity)} />

          <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm text-neutral-700">
            <p className="font-medium text-neutral-900">{contactDetails.name}</p>
            <p className="mt-1">{contactDetails.phone}</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-4">
            <p className="text-sm font-medium text-neutral-900">Cart summary</p>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-neutral-700">
              {cartSummary}
            </pre>
          </div>

          <ValidationError
            prefix="Phone"
            field="phone"
            errors={state.errors}
          />

          <div className="rounded-2xl border border-dashed border-amber-300 px-4 py-3 text-sm text-amber-950">
            Your cart will be submitted along with your contact details.
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
            >
              Edit details
            </button>
            <button
              type="submit"
              disabled={state.submitting}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {state.submitting ? "Sending..." : "Proceed to enquire"}
            </button>
          </div>
        </form>
      )}
    </div>
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
  const [gridCols, setGridCols] = useState(3);

  const handleFilterChange = ({
    collectionHandle = catalog.activeCollection.handle,
    brandHandle = catalog.activeBrand,
    productTypeHandle = catalog.activeProductType,
  }) => {
    const nextRedirectTo = buildShopHref({
      collectionHandle,
      brandHandle,
      productTypeHandle,
    });

    setRedirectTo(nextRedirectTo);
    window.history.replaceState({}, "", nextRedirectTo);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/shop/catalog${nextRedirectTo.replace("/shop", "")}`, {
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

  const shareAction = () => {
    if (navigator.share) {
      navigator.share({ title: "Aurum Bites - Shop", url: window.location.href }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      {/* Sticky compact filter bar — sits below the navbar */}
      {filterPinned && !stickyExpanded && (
        <div className="fixed inset-x-0 top-[70px] z-40 animate-[slideDown_0.25s_ease-out] border-b border-[#e9dfcf] bg-white/90 shadow-md backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <button
              onClick={() => setStickyExpanded(true)}
              className="flex items-center gap-2 rounded-full border border-[#e6dcc8] bg-[#fcf8f1] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#9a7a3f] transition hover:border-[#c9b07a]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filters
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </button>
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
                onSelectHandle={(handle) => { handleFilterChange({ collectionHandle: handle, brandHandle: "all", productTypeHandle: catalog.activeProductType }); setStickyExpanded(false); }}
              />
              <BrandFilters
                brands={catalog.brands}
                activeHandle={catalog.activeBrand}
                onSelectHandle={(handle) => { handleFilterChange({ collectionHandle: catalog.activeCollection.handle, brandHandle: handle, productTypeHandle: catalog.activeProductType }); setStickyExpanded(false); }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <div ref={filterRef} className="rounded-[2rem] border border-[#e9dfcf] bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <div>
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
                Share
              </button>
            </div>

            <div>
              {/* <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Collections
              </p> */}
              <CollectionFilters
                collections={catalog.collections}
                activeHandle={catalog.activeCollection.handle}
                brandHandle={catalog.activeBrand}
                productTypeHandle={catalog.activeProductType}
                onSelectHandle={(handle) =>
                  handleFilterChange({
                    collectionHandle: handle,
                    brandHandle: "all",
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
              <div className="hidden lg:flex items-center gap-3 shrink-0 mt-4">
                {/* <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Layout</span> */}
                <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGridCols(num)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                        gridCols === num 
                          ? "bg-neutral-950 text-white shadow-sm" 
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      {num} COL
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
          </div>
        </div>

          {catalogError ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {catalogError}
            </div>
          ) : null}

          <div className="relative mt-8">
            {isPending ? (
              <div className="pointer-events-none absolute inset-0 z-10 rounded-[2rem] bg-[#f7f1e5]/70 backdrop-blur-[2px]" />
            ) : null}

            <div
              className={`grid gap-6 grid-cols-1 sm:grid-cols-2 ${
                gridCols === 2 ? "lg:grid-cols-2" : 
                gridCols === 3 ? "lg:grid-cols-3" : 
                "lg:grid-cols-4"
              } ${isPending ? "opacity-60" : ""}`}
              style={{ contentVisibility: "auto", containIntrinsicSize: "900px" }}
            >
              {catalog.products.length > 0 ? (
                catalog.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    redirectTo={redirectTo}
                    isEnquiryOnly={storefrontMode.isEnquiryOnly}
                  />
                ))
              ) : (
                <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white/90 p-10 text-neutral-600">
                  No products were found in this collection yet.
                </div>
              )}
            </div>
          </div>
      </div>
    </>
  );
}

export function CollectionFilters({
  collections,
  activeHandle,
  brandHandle = "all",
  productTypeHandle = "all",
  onSelectHandle,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCollection = collections.find((c) => c.handle === activeHandle) || collections[0];

  return (
    <div className="relative">
      {/* Mobile Trigger */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-full border border-[#e6dcc8] bg-[#fcf8f1] px-5 py-3 text-left text-sm font-medium text-neutral-700 transition hover:border-[#c9b07a]"
        >
          <span className="truncate pr-3">{activeCollection.title}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>

        {isOpen && (
          <MobileBottomSheet
            isOpen={isOpen}
            title="Collections"
            onClose={() => setIsOpen(false)}
          >
                {collections.map((collection) => {
                  const isActive = collection.handle === activeHandle;
                  const logo = getFilterLogo(collection);
                  return (
                    <button
                      type="button"
                      key={collection.id}
                      onClick={() => {
                        if (onSelectHandle) {
                          onSelectHandle(collection.handle);
                        }
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-2 rounded-2xl p-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-neutral-950 text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {logo ? (
                        <span className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border ${
                          isActive ? "border-white/20 bg-white" : "border-neutral-200 bg-neutral-50"
                        }`}>
                          <Image src={logo} alt="" fill className="object-contain p-1" />
                        </span>
                      ) : (
                        <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                          isActive ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-500"
                        }`}>
                          {collection.title === "All Brand" ? "All" : collection.title.slice(0, 1)}
                        </span>
                      )}
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
          const isActive = collection.handle === activeHandle;
          const logo = getFilterLogo(collection);

          return (
            <button
              type="button"
              key={collection.id}
              onClick={() => onSelectHandle?.(collection.handle)}
              className={`flex shrink-0 items-center gap-3 rounded-[1.2rem] border px-3.5 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? "border-neutral-950 bg-neutral-950 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-500"
              }`}
            >
              {logo ? (
                <span
                  className={`relative h-9 w-9 overflow-hidden rounded-xl border ${
                    isActive ? "border-white/20 bg-white" : "border-neutral-200 bg-neutral-50"
                  }`}
                >
                  <Image
                    src={logo}
                    alt={`${collection.title} logo`}
                    fill
                    className="object-contain p-1"
                  />
                </span>
              ) : (
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                    isActive ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {collection.title === "All Brand" ? "All" : collection.title.slice(0, 1)}
                </span>
              )}
              <span className="whitespace-nowrap leading-5">{collection.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function ProductTypeFilters({
  productTypes,
  activeHandle,
  collectionHandle = "all",
  brandHandle = "all",
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!productTypes?.length) {
    return null;
  }

  const activeProductType = productTypes.find((p) => p.handle === activeHandle) || productTypes[0];

  return (
    <div className="relative mt-4">
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-full border border-neutral-300 bg-white px-5 py-3 text-left text-sm font-medium text-neutral-700 transition hover:border-neutral-400 flex justify-between items-center"
        >
          <span>{activeProductType.title}</span>
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

          if (productType.handle && productType.handle !== "all") {
            query.set("type", productType.handle);
          }

          const href = query.toString() ? `/shop?${query.toString()}` : "/shop";

          return (
            <Link
              key={productType.handle}
              href={href}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-amber-600 text-white"
                  : "border border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300"
              }`}
            >
              {productType.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function BrandFilters({
  brands,
  activeHandle,
  collectionHandle = "all",
  productTypeHandle = "all",
  onSelectHandle,
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!brands?.length) {
    return null;
  }

  const activeBrand = brands.find((b) => b.handle === activeHandle) || brands[0];

  return (
    <div className="relative mt-4">
      {/* Mobile Bottom Sheet */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-full border border-[#e6dcc8] bg-[#fcf8f1] px-5 py-3 text-left text-sm font-medium text-neutral-700 transition hover:border-[#c9b07a]"
        >
          <span className="truncate pr-3">{activeBrand.title}</span>
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
                      onSelectHandle?.(brand.handle);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-neutral-950 text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <span>{brand.title}</span>
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
              onClick={() => onSelectHandle?.(brand.handle)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.04em] transition sm:text-sm ${
                isActive
                  ? "bg-neutral-950 text-white shadow-[0_10px_30px_rgba(23,23,23,0.12)]"
                  : "border border-[#e6dcc8] bg-[#fcf8f1] text-neutral-700 hover:border-[#c9b07a] hover:text-[#7a5a26]"
              }`}
            >
              {brand.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductCard({ product, redirectTo, isEnquiryOnly }) {
  return (
    <article className="glossy-card overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm transition hover:shadow-xl">
      <Link href={`/shop/${product.handle}`} className="block">
        <div className="relative h-72 bg-neutral-100">
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
            {product.vendor ? (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {product.vendor}
              </p>
            ) : null}
            <Link
              href={`/shop/${product.handle}`}
              className="mt-1 block text-xl font-semibold text-neutral-950 hover:text-neutral-700"
            >
              {product.title}
            </Link>
            {product.weight ? (
              <p className="mt-1 text-sm font-medium text-neutral-500">
                {product.weight}
              </p>
            ) : null}
            {/* <p className="mt-1 text-sm text-neutral-500">{product.featured}</p> */}
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
            {product.availableForSale ? product.price : "Out of Stock"}
          </span>
        </div>

        {/* <p className="min-h-16 text-sm leading-6 text-neutral-600">
          {product.description || "Product details will appear here."}
        </p> */}

        {/* <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-sm">
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
        </div> */}

        <div className="flex gap-3">
          <Link
            href={`/shop/${product.handle}`}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-700 transition hover:border-neutral-400"
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
                  className="w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  {isEnquiryOnly ? "Proceed to enquire" : "Add to cart"}
                </button>
              </form>
            ) : (
              <a
                href={`https://wa.me/919654979085?text=${encodeURIComponent(`Hi, I'm interested in ${product.title} for bulk quick order. Please notify me when it's back in stock.`)}`}
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

export function CartPanel({
  cart,
  isConfigured,
  redirectTo,
  className = "",
  isEnquiryOnly = false,
}) {
  const shouldUseLargeOrderForm = !isEnquiryOnly && isLargeOrder(cart);
  const infoBoxClassName = shouldUseLargeOrderForm
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : !isEnquiryOnly && isConfigured
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-neutral-200 bg-neutral-50 text-neutral-700";
  const infoMessage = isEnquiryOnly
    ? "Online checkout is currently disabled, so all orders are being collected as enquiries."
    : shouldUseLargeOrderForm
    ? "This cart is above the fast-checkout limit. Please share your name and phone number, then proceed to enquire."
    : isConfigured
    ? "This cart is eligible for Shopify checkout. Use Continue to checkout to complete the order online."
    : "Shopify checkout is not available yet because the store connection is still using preview mode.";

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
        {isEnquiryOnly
          ? "These selected items will be shared through the enquiry form instead of online checkout."
          : shouldUseLargeOrderForm
          ? "This cart qualifies for manual confirmation, so checkout is replaced with a quick request form."
          : isConfigured
          ? "Cart lines are synced with your store, and checkout will continue there."
          : "Preview mode stores cart items locally until the store connection is complete."}
      </p>

      <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${infoBoxClassName}`}>
        {infoMessage}
      </div>

      <div className="mt-6 space-y-4">
        {cart.lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500">
            Add a product to start your enquiry.
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
        {shouldUseLargeOrderForm ? (
          <LargeOrderCartForm cart={cart} />
        ) : !isEnquiryOnly && isConfigured && cart.checkoutUrl ? (
          <a
            href={cart.checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Continue to checkout
          </a>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600">
            Add more items to continue.
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
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-3 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(23,23,23,0.24)] transition hover:bg-neutral-800"
        aria-label="Open cart"
      >
        <span>Cart</span>
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
    images: ["/img/fries.jpg", "/img/penne.jpg", "/img/spaghetti.jpg"],
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
            <h2 className="text-3xl font-bold mb-2 text-[#0b1537] dark:text-[#fde4bc]">
              {SUB_CATEGORY_DATA[active].title}
            </h2>
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
      <h4 className="text-xl font-bold mb-1 text-[#0b1537] dark:text-[#fde4bc]">
        {cat.title}
      </h4>
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
