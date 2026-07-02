"use client";

import { ProductCard } from "../shop/ShopUi";

export default function NotFoundProducts({ products = [], isEnquiryOnly = false }) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between border-b border-[#e9dfcf] pb-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#9a7a3f]">
          <svg
            className="h-4.5 w-4.5 shrink-0 text-[#9a7a3f]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.373-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z"
            />
          </svg>
          Top Searched
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            redirectTo="/shop"
            isEnquiryOnly={isEnquiryOnly}
            gridCols={4}
            priority={index < 4}
          />
        ))}
      </div>
    </div>
  );
}