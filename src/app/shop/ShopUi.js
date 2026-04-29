"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, ValidationError } from "@formspree/react";
import { createPortal } from "react-dom";
import { addToCart, removeFromCart, decreaseCartQuantity } from "./actions";
import { useCartChange } from "./CartContext";

const FILTER_LOGO_MAP = {
  president: "/brands/president.jpg",
  cremeitalia: "/brands/cremeitalia.jpg",
  "modern dairies": "/brands/moderndary.png",
  moderndairy: "/brands/moderndary.png",
  "pasta zara": "/brands/pastazara.jpg",
  pastazara: "/brands/pastazara.jpg",
  "dairy craft": "/brands/dairycraft.jpg",
  dlecta: "/brands/dlecta.jpg",
  amul: "/brands/amul.jpg",
  mccain: "/brands/mccain.jpg",
  // Prabhat: "/brands/prabhat.png",
  prabhat: "/brands/prabhat.png",
  "elle & vire": "/brands/elleandvire.jpeg",
  rich: "/brands/richs.jpeg",
  Fries: "/products/fries.jpg",
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
  const CONTACT_NUMBERS = ["919654979085", "919654979085"]; // Both support numbers

  const cartSummary = buildCartSummary(cart);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    phone: "",
    pincode: "",
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

          <div>
            <label
              htmlFor="cart-order-pincode"
              className="block text-sm font-medium text-neutral-700"
            >
              Pincode
            </label>
            <input
              id="cart-order-pincode"
              name="pincode_preview"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="e.g. 110001"
              value={contactDetails.pincode}
              onChange={(event) =>
                setContactDetails((current) => ({
                  ...current,
                  pincode: event.target.value.replace(/\D/g, "").slice(0, 6),
                }))
              }
              className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!contactDetails.name.trim() || !contactDetails.phone.trim() || contactDetails.pincode.length !== 6}
            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input type="hidden" name="name" value={contactDetails.name} />
          <input type="hidden" name="phone" value={contactDetails.phone} />
          <input type="hidden" name="pincode" value={contactDetails.pincode} />
          <input type="hidden" name="cart_summary" value={cartSummary} />
          <input type="hidden" name="order_total" value={cart.subtotal || ""} />
          <input type="hidden" name="total_items" value={String(cart.totalQuantity)} />

          <div className="rounded-2xl border border-amber-200 bg-white p-4 text-sm text-neutral-700">
            <p className="font-medium text-neutral-900">{contactDetails.name}</p>
            <p className="mt-1">{contactDetails.phone}</p>
            <p className="mt-1 text-neutral-500">Pincode: {contactDetails.pincode}</p>
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

        <div className="mt-6 pt-6 border-t border-amber-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-900/60 text-center">Or connect directly</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {CONTACT_NUMBERS.map((num, idx) => (
              <div key={`direct-${idx}`} className="flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-amber-900/40">#{idx + 1}</span>
                <a 
                  href={`tel:+${num}`}
                  className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
                  title="Call now"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
                <a 
                  href={`https://wa.me/${num}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-[#25D366] hover:text-[#20bd5c] transition-colors"
                  title="Chat on WhatsApp"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.88 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
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
  const [gridCols, setGridCols] = useState(4);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setGridCols(1);
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
                <button
                  onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
                  className="flex items-center gap-3 group"
                  aria-pressed={showOnlyAvailable}
                >
                  <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${showOnlyAvailable ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${showOnlyAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 group-hover:text-neutral-900 transition-colors">In Stock Only</span>
                </button>
                
                {/* {(catalog.activeCollection.handle !== "all" || catalog.activeBrand !== "all" || catalog.activeProductType !== "all" || showOnlyAvailable) && (
                  <button
                    onClick={() => {
                      setShowOnlyAvailable(false);
                      handleFilterChange({
                        collectionHandle: "all",
                        brandHandle: "all",
                        productTypeHandle: "all",
                      });
                    }}
                    className="ml-2 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition"
                  >
                    Clear All
                  </button>
                )} */}
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
              <div className="flex items-center gap-3 shrink-0 mt-4 lg:mt-0 justify-end">
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

          {catalogError ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {catalogError}
            </div>
          ) : null}

          <div className="relative mt-8">
            {isPending ? (
              <div className="pointer-events-none absolute inset-0 z-10 rounded-[2rem] bg-[#f7f1e5]/70 backdrop-blur-[2px]" />
            ) : null}

            <ProductGrid
              products={showOnlyAvailable ? catalog.products.filter(p => p.availableForSale) : catalog.products}
              redirectTo={redirectTo}
              isEnquiryOnly={storefrontMode.isEnquiryOnly}
              gridCols={gridCols}
              isPending={isPending}
            />
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
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [prevProductKey, setPrevProductKey] = useState("");
  const sentinelRef = useRef(null);

  const productKey = products.map((p) => p.id).join(",");

  if (productKey !== prevProductKey) {
    setPrevProductKey(productKey);
    setVisibleCount(BATCH_SIZE);
  }

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, products.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [products.length, visibleCount]);

  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;
  const skeletonCount = Math.min(BATCH_SIZE, products.length - visibleCount);

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
        {Array.from({ length: BATCH_SIZE }).map((_, i) => (
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
    <article className={`glossy-card overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-neutral-200 bg-white shadow-sm transition hover:shadow-xl ${isList ? 'flex flex-row items-stretch' : 'flex flex-col'}`}>
      <Link href={`/shop/${product.handle}`} className={`block ${isList ? 'w-2/5 shrink-0' : ''}`}>
        <div className={`relative bg-neutral-100 h-full ${!isList && (isCompact ? 'aspect-square sm:aspect-auto sm:h-48' : 'aspect-square sm:aspect-auto sm:h-72')}`}>
          <div className="absolute top-4 left-4 z-10">
            <span className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${isCompact ? 'text-[8px]' : 'text-[10px]'} ${
              product.availableForSale 
                ? "bg-emerald-500/90 text-white" 
                : "bg-amber-500/90 text-white"
            }`}>
              {product.availableForSale ? (isCompact ? "Live" : "Available") : "Sold"}
            </span>
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
                {!isList && product.weight && !isCompact ? (
                  <p className="mt-1 text-xs font-medium text-neutral-500">
                    {product.weight}
                  </p>
                ) : null}
                
                {isList ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
                    {product.productType && <span>{product.productType}</span>}
                    {product.productType && (product.weight || product.price) && <span className="text-neutral-300">•</span>}
                    {product.weight && <span>{product.weight}</span>}
                    {product.weight && product.price && <span className="text-neutral-300">•</span>}
                    {product.price && (
                      <div className="flex items-center gap-1.5">
                        {product.compareAtPrice && <span className="text-neutral-400 line-through text-[10px]">{product.compareAtPrice}</span>}
                        <span className="text-neutral-900 font-bold">{product.price}</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </>
            )}
          </div>
          {!(product.variants && product.variants.length > 1) && !isList && (
            <div className={`shrink-0 flex items-center gap-1.5 rounded-full bg-neutral-100 px-2 py-0.5 font-medium whitespace-nowrap ${isCompact ? 'text-[10px]' : 'text-sm'}`}>
              {product.availableForSale ? (
                <>
                  {product.compareAtPrice && (
                    <span className="text-neutral-400 line-through">{product.compareAtPrice}</span>
                  )}
                  <span className="text-neutral-700">{product.price}</span>
                </>
              ) : (
                <span className="text-neutral-700">Sold</span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/shop/${product.handle}`}
            className={`flex-1 rounded-full border flex items-center justify-center transition ${
              product.variants && product.variants.length > 1
                ? 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
            } ${isCompact ? 'p-2 lg:px-4 lg:py-2' : 'px-4 py-3 text-sm font-medium'}`}
            title={product.variants && product.variants.length > 1 ? "View options" : "Details"}
          >
            {product.variants && product.variants.length > 1 ? (
              <span className={isCompact ? 'text-[10px] sm:text-xs font-semibold' : ''}>View options</span>
            ) : (
              isCompact ? (
                <span className="hidden lg:inline text-xs font-semibold">Details</span>
              ) : "Details"
            )}
          </Link>
          
          {!(product.variants && product.variants.length > 1) && (
            <div className={isCompact ? 'flex-shrink-0' : 'flex-1'}>
              {product.availableForSale ? (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding}
                  className={`rounded-full bg-neutral-950 text-white transition hover:bg-neutral-800 disabled:opacity-60 flex items-center justify-center ${isCompact ? 'p-2 w-10 h-10' : 'w-full px-4 py-3 text-sm font-medium'}`}
                >
                  {adding
                    ? (isCompact ? "..." : "Adding…")
                    : isEnquiryOnly
                    ? "Proceed to enquire"
                    : (
                      <div className="flex items-center justify-center" aria-label="Add to bucket">
                        <svg className={isCompact ? "h-4 w-4" : "h-5 w-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9h18l-2 11H5L3 9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9a4 4 0 018 0" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 12v4m-2-2h4" />
                        </svg>
                      </div>
                    )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowNotify(true)}
                    className={`flex items-center justify-center rounded-full bg-[#25D366] text-white transition hover:bg-[#20bd5c] shadow-sm ${isCompact ? 'p-2 w-10 h-10' : 'w-full gap-2 px-4 py-3 text-sm font-medium'}`}
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.88 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    {!isCompact && "Notify"}
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
        {shouldUseLargeOrderForm ? (
          <LargeOrderCartForm cart={cart} />
        ) : !isEnquiryOnly && isConfigured && cart.checkoutUrl && cart.totalQuantity > 0 ? (
          <a
            href={cart.checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Continue to checkout
          </a>
        ) : cart.totalQuantity === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600">
            Add a product to get started.
          </div>
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
    brand: "cream",
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
    brand: "cheese",
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
    brand: "cheese",
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
    brand: "dry",
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
                href={`/shop?collection=all&brand=${SUB_CATEGORY_DATA[active].brand}&type=all`}
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
          href={`/shop?collection=all&brand=${cat.brand}&type=all`}
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
