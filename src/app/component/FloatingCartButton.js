"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CartPanel } from "../shop/ShopUi";

function buildRedirectTarget(pathname, searchParams) {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function FloatingCartButton({
  cart,
  isConfigured,
  isEnquiryOnly,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => buildRedirectTarget(pathname || "/", searchParams),
    [pathname, searchParams]
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex h-14 items-center gap-3 rounded-full border border-white/70 bg-neutral-950/95 px-4 text-sm font-semibold text-white shadow-[0_20px_55px_rgba(15,23,42,0.28)] backdrop-blur transition hover:scale-[1.02] hover:bg-neutral-900"
        aria-label="Open cart"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 6M7 13l-1.2 2.4A1 1 0 0 0 6.7 17H19m0 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"
            />
          </svg>
        </span>
        <span className="hidden sm:inline">Cart</span>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-neutral-950">
          {cart.totalQuantity}
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]"
            aria-label="Close cart"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-[#f8f5ef] p-4 shadow-2xl md:inset-y-4 md:right-4 md:left-auto md:max-h-none md:w-[26rem] md:rounded-[2rem] md:border md:border-white/70 md:bg-white/95">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-neutral-300 md:hidden" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
                  Quick cart
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  Review saved products from anywhere on the site.
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
              className="border-none bg-transparent p-0 shadow-none"
            />
          </div>
        </>
      ) : null}
    </>
  );
}
