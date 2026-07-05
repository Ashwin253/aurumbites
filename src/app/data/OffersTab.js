"use client";

import { useState, useTransition } from "react";
import { addOffer, deleteOffer } from "./actions";

export default function OffersTab({ initialOffers, initialProducts, initialCategories, initialBrands }) {
  const [offers, setOffers] = useState(initialOffers || []);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("product"); // 'product', 'brand', 'category', 'volume'
  const [targetId, setTargetId] = useState("");
  const [discountType, setDiscountType] = useState("percent"); // 'percent', 'amount', 'volume_price'
  const [discountValue, setDiscountValue] = useState("");
  const [minQty, setMinQty] = useState("");

  const handleTypeChange = (newType) => {
    setType(newType);
    setTargetId("");
    // Default discount types based on offer type
    if (newType === "volume") {
      setDiscountType("volume_price");
    } else {
      setDiscountType("percent");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!description.trim()) {
      setErrorMsg("Please provide an offer description.");
      return;
    }
    if (!targetId) {
      setErrorMsg("Please select a target product, brand, or category.");
      return;
    }
    if (!discountValue || parseFloat(discountValue) <= 0) {
      setErrorMsg("Discount value must be greater than 0.");
      return;
    }
    if (type === "volume" && (!minQty || parseInt(minQty, 10) < 1)) {
      setErrorMsg("Minimum quantity must be 1 or greater for volume discounts.");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("code", code);
    formData.append("type", type);
    formData.append("target_id", targetId);
    formData.append("discount_type", discountType);
    formData.append("discount_value", discountValue);
    if (type === "volume") {
      formData.append("min_qty", minQty);
    }

    startTransition(async () => {
      const res = await addOffer(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.offer) {
        setOffers((prev) => [res.offer, ...prev]);
        // Reset form
        setDescription("");
        setCode("");
        setTargetId("");
        setDiscountValue("");
        setMinQty("");
      }
    });
  };

  const handleDeleteOffer = async (id) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;

    startTransition(async () => {
      const res = await deleteOffer(id);
      if (res.error) {
        alert(res.error);
      } else {
        setOffers((prev) => prev.filter((o) => o.id !== id));
      }
    });
  };

  // Helper to format discount text
  const formatDiscountDisplay = (offer) => {
    if (offer.discount_type === "percent") {
      return `${offer.discount_value}% OFF`;
    } else if (offer.discount_type === "amount") {
      return `₹${offer.discount_value} OFF`;
    } else if (offer.discount_type === "volume_price") {
      return `Special Price ₹${offer.discount_value} each (Min ${offer.min_qty} qty)`;
    }
    return `${offer.discount_value}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      
      {/* Offers List */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm flex flex-col min-w-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Active Offers & Promotions</h2>
          <p className="text-sm text-neutral-500 mt-1">Manage all discount codes, brand sales, and volume deals</p>
        </div>

        {offers.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 border-2 border-dashed border-neutral-200 rounded-2xl">
            <svg className="w-12 h-12 text-neutral-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <p className="text-neutral-500 font-medium text-sm">No active offers found</p>
            <p className="text-neutral-400 text-xs mt-1">Create one using the form on the right</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-500">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="pb-3">Offer</th>
                  <th className="pb-3">Applies To</th>
                  <th className="pb-3">Discount</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-4 pr-3">
                      <div className="font-semibold text-neutral-900">{offer.description}</div>
                      {offer.code && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 uppercase">
                            Code: {offer.code}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 pr-3 capitalize">
                      <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        {offer.type}
                      </span>
                      <div className="text-xs text-neutral-500 font-semibold mt-1 max-w-[150px] truncate">
                        {offer.target_id}
                      </div>
                    </td>
                    <td className="py-4 pr-3">
                      <span className="font-semibold text-emerald-600 whitespace-nowrap">
                        {formatDiscountDisplay(offer)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-700 font-medium transition disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Form */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm flex flex-col self-start">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Create New Offer</h2>
          <p className="text-xs text-neutral-500 mt-1">Configure parameters and launch instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Description *</label>
            <input
              type="text"
              placeholder="e.g. 15% off Summer Lattes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              required
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Promo Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. LATTE15"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition uppercase font-semibold"
            />
          </div>

          {/* Offer Type */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Offer Type *</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
            >
              <option value="product">Apply to Product</option>
              <option value="brand">Apply to Brand</option>
              <option value="category">Apply to Category</option>
              <option value="volume">Apply to Volume & Price</option>
            </select>
          </div>

          {/* Dynamic Target Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              Select Target {type === "product" || type === "volume" ? "Product" : type === "brand" ? "Brand" : "Category"} *
            </label>
            
            {type === "product" || type === "volume" ? (
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                required
              >
                <option value="">-- Select Product --</option>
                {initialProducts?.map((p) => (
                  <option key={p.id} value={p.handle}>{p.title}</option>
                ))}
              </select>
            ) : type === "brand" ? (
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                required
              >
                <option value="">-- Select Brand --</option>
                {initialBrands?.filter(b => b.title).map((b) => (
                  <option key={b.id} value={b.title}>{b.title}</option>
                ))}
              </select>
            ) : (
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                required
              >
                <option value="">-- Select Category --</option>
                {initialCategories?.filter(c => c.title).map((c) => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Discount Type */}
          {type !== "volume" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              >
                <option value="percent">Percentage (%)</option>
                <option value="amount">Flat Amount (₹)</option>
              </select>
            </div>
          )}

          {/* Volume Config */}
          {type === "volume" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">Minimum Buy Quantity *</label>
              <input
                type="number"
                min="2"
                placeholder="e.g. 3"
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
                required
              />
            </div>
          )}

          {/* Discount Value */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">
              {type === "volume" ? "Special Unit Price (₹) *" : discountType === "percent" ? "Percentage Off (%) *" : "Flat Amount Off (₹) *"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder={type === "volume" ? "e.g. 150.00" : discountType === "percent" ? "e.g. 15" : "e.g. 50"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 text-sm transition disabled:opacity-50 mt-2 shadow-sm cursor-pointer"
          >
            {isPending ? "Creating Offer..." : "Launch Offer"}
          </button>

        </form>
      </div>

    </div>
  );
}
