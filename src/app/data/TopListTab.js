"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { toggleTopProduct } from "./actions";

export default function TopListTab({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (productId, currentVal) => {
    const newVal = !currentVal;
    setUpdatingId(productId);
    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        const res = await toggleTopProduct(productId, newVal);
        if (res.success) {
          // Update local state
          setProducts(prev => prev.map(p => 
            p.id === productId ? { ...p, is_top_searched: newVal } : p
          ));
          setSuccessMsg(`Updated top-searched status successfully.`);
          // Clear toast after 3s
          setTimeout(() => setSuccessMsg(""), 3000);
        } else {
          setErrorMsg(res.error || "Failed to update status.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("An unexpected error occurred.");
      } finally {
        setUpdatingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Not Found Page Listings</h2>
          <p className="text-xs text-neutral-500 mt-1">Configure which products display on the storefront when a search query returns no matches.</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full border border-neutral-300 bg-white px-4 py-2 pl-9 text-xs outline-none focus:border-neutral-950 transition-all shadow-sm"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-450" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 animate-fade-in flex items-center gap-2">
          <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-semibold text-red-800 animate-fade-in flex items-center gap-2">
          <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-500 border-collapse">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Brand</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-center">Show on Not Found Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-sm text-neutral-450">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isTop = !!p.is_top_searched;
                  const isUpdating = updatingId === p.id;
                  
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50 transition">
                      <td className="px-4 py-3.5 font-medium text-neutral-900">
                        <div className="flex items-center gap-3">
                          {p.images && p.images[0] ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                              <Image src={p.images[0]} alt="" fill className="object-cover" />
                            </div>
                          ) : p.image_url ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                              <Image src={p.image_url} alt="" fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400">
                              No image
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-neutral-950 text-sm block">{p.title}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">{p.handle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 font-medium">{p.vendor || "-"}</td>
                      <td className="px-4 py-3.5 text-neutral-600 font-medium">{p.productType || "-"}</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggle(p.id, isTop)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                              isTop ? "bg-[#9a7a3f]" : "bg-neutral-200"
                            } ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isTop ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
