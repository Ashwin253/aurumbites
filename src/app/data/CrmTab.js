"use client";

import React, { useState, useMemo } from "react";
import { updateProductVariants, addOfflineOrder } from "./actions";

export default function CrmTab({ initialProducts = [], initialCategories = [], initialBrands = [], initialOrders = [] }) {
  const [activeSubTab, setActiveSubTab] = useState("catalog"); // "catalog" | "orders"
  const [products, setProducts] = useState(initialProducts);
  const [categories] = useState(initialCategories);
  const [brands] = useState(initialBrands);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Expanded product ID for the inline variants editor dropdown
  const [expandedProductId, setExpandedProductId] = useState(null);
  
  // Inline editing state for variants
  const [editingVariants, setEditingVariants] = useState([]);
  const [savingProductId, setSavingProductId] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Offline orders state (filtered offline orders)
  const offlineOrders = useMemo(() => {
    return initialOrders.filter(o => o.payment_provider === "Offline / CRM" || o.payment_provider?.toLowerCase().includes("offline"));
  }, [initialOrders]);

  // CRM manual order logging modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isLoggingOrder, setIsLoggingOrder] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedItems, setSelectedItems] = useState([
    { productId: "", variantId: "", quantity: 1 }
  ]);

  // Dropdown lists
  const brandList = useMemo(() => {
    const list = new Set();
    products.forEach(p => p.vendor && list.add(p.vendor));
    return Array.from(list).sort();
  }, [products]);

  const categoryList = useMemo(() => {
    const list = new Set();
    products.forEach(p => p.productType && list.add(p.productType));
    return Array.from(list).sort();
  }, [products]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.productType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = brandFilter ? p.vendor === brandFilter : true;
      const matchesCategory = categoryFilter ? p.productType === categoryFilter : true;
      return matchesSearch && matchesBrand && matchesCategory && !p.is_archived;
    });
  }, [products, searchTerm, brandFilter, categoryFilter]);

  // Expand and load variants into editing state
  const handleToggleExpand = (product) => {
    if (expandedProductId === product.id) {
      setExpandedProductId(null);
      setEditingVariants([]);
    } else {
      setExpandedProductId(product.id);
      setEditingVariants(JSON.parse(JSON.stringify(product.variants || []))); // deep clone
      setSaveError("");
      setSaveSuccess("");
    }
  };

  // Handle inline variant fields update
  const handleVariantChange = (index, field, value) => {
    const updated = [...editingVariants];
    if (field === "stock") {
      updated[index].stock = value === "" ? null : parseInt(value, 10);
    } else if (field === "price") {
      updated[index].price = { ...updated[index].price, amount: parseFloat(value) || 0 };
    } else if (field === "callForInventory") {
      updated[index].callForInventory = !!value;
    }
    setEditingVariants(updated);
  };

  // Save variant stock/prices to Supabase
  const handleSaveVariants = async (productId) => {
    setSavingProductId(productId);
    setSaveError("");
    setSaveSuccess("");

    // Update availability flags based on stock rules before saving
    const finalVariants = editingVariants.map(v => ({
      ...v,
      availableForSale: v.callForInventory || v.stock === null || isNaN(v.stock) || v.stock > 0
    }));

    const result = await updateProductVariants(productId, finalVariants);
    setSavingProductId(null);

    if (result.success) {
      setSaveSuccess("Variants updated successfully!");
      // Update local products list state
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, variants: finalVariants } : p
      ));
      // Auto close after 1.5s
      setTimeout(() => {
        setExpandedProductId(null);
        setEditingVariants([]);
        setSaveSuccess("");
      }, 1500);
    } else {
      setSaveError(result.error || "Failed to update variants.");
    }
  };

  // Add line item to offline order builder
  const handleAddLineItem = () => {
    setSelectedItems([...selectedItems, { productId: "", variantId: "", quantity: 1 }]);
  };

  // Remove line item from offline order builder
  const handleRemoveLineItem = (index) => {
    if (selectedItems.length === 1) return;
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  // Update line item in offline order builder
  const handleLineItemChange = (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    if (field === "productId") {
      // Auto-select first variant of that product
      const product = products.find(p => p.id === value);
      updated[index].variantId = product?.variants?.[0]?.id || "";
    }
    setSelectedItems(updated);
  };

  // Calculate order total
  const calculatedTotal = useMemo(() => {
    let sum = 0;
    selectedItems.forEach(item => {
      if (!item.productId || !item.variantId) return;
      const product = products.find(p => p.id === item.productId);
      const variant = product?.variants?.find(v => v.id === item.variantId);
      if (variant?.price?.amount) {
        sum += variant.price.amount * item.quantity;
      }
    });
    return sum;
  }, [selectedItems, products]);

  // Submit offline order
  const handleLogOfflineOrderSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.some(i => !i.productId || !i.variantId || i.quantity <= 0)) {
      alert("Please fill in all product, variant, and quantity selections.");
      return;
    }

    setIsLoggingOrder(true);

    const itemsToLog = selectedItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      const variant = product.variants.find(v => v.id === item.variantId);
      return {
        product_id: product.id,
        title: product.title,
        variant_id: variant.id,
        variantTitle: variant.title || "Default",
        price: variant.price?.amount || 0,
        quantity: item.quantity
      };
    });

    const result = await addOfflineOrder({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      items: itemsToLog,
      total_amount: calculatedTotal
    });

    setIsLoggingOrder(false);

    if (result.success) {
      alert("Offline order logged successfully and stock deducted!");
      
      // Update local stock levels state
      setProducts(prev => prev.map(p => {
        let matched = false;
        const updatedVariants = p.variants?.map(v => {
          const orderedItem = itemsToLog.find(i => i.product_id === p.id && i.variant_id === v.id);
          if (orderedItem && v.stock !== null) {
            v.stock = Math.max(0, v.stock - orderedItem.quantity);
            v.availableForSale = v.callForInventory || v.stock > 0;
            matched = true;
          }
          return v;
        });
        return matched ? { ...p, variants: updatedVariants } : p;
      }));

      // Reset modal state
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setSelectedItems([{ productId: "", variantId: "", quantity: 1 }]);
      setShowOrderModal(false);
      
      // Redirect to orders sub-tab
      setActiveSubTab("orders");
      window.location.reload(); // Refresh to reload new orders list
    } else {
      alert("Error: " + result.error);
    }
  };

  // Open modal and pre-fill a single variant order shortcut
  const handleQuickSaleShortcut = (product, variant) => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setSelectedItems([{ productId: product.id, variantId: variant.id, quantity: 1 }]);
    setShowOrderModal(true);
  };

  // CSV Exporter helper
  const handleExportCSV = (type) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === "inventory") {
      csvContent += "Product Title,Brand,Category,Variant Title,Price,Current Stock,Total Value,Archived\n";
      products.forEach(p => {
        const variantsList = p.variants || [];
        variantsList.forEach(v => {
          const stockVal = v.stock === null ? "Unlimited" : v.stock;
          const totalVal = v.stock === null ? "N/A" : (v.stock * (v.price?.amount || 0));
          const row = [
            `"${p.title?.replace(/"/g, '""')}"`,
            `"${(p.vendor || "").replace(/"/g, '""')}"`,
            `"${(p.productType || "").replace(/"/g, '""')}"`,
            `"${(v.title || "Default").replace(/"/g, '""')}"`,
            v.price?.amount || 0,
            stockVal,
            totalVal,
            p.is_archived ? "Yes" : "No"
          ].join(",");
          csvContent += row + "\n";
        });
      });
    } else {
      csvContent += "Order ID,Customer Name,Email,Phone,Items Ordered,Total Amount,Payment Date\n";
      offlineOrders.forEach(o => {
        const itemsStr = o.order_items?.map(i => `${i.title} (${i.variantTitle || "Default"}) x${i.quantity}`).join(" | ");
        const row = [
          o.payment_id || o.id,
          `"${(o.customer_name || "Guest").replace(/"/g, '""')}"`,
          o.customer_email || "",
          o.customer_phone || "",
          `"${itemsStr.replace(/"/g, '""')}"`,
          o.total_amount || 0,
          new Date(o.created_at).toLocaleDateString()
        ].join(",");
        csvContent += row + "\n";
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Subtab selection headers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex gap-2 p-1 bg-neutral-150 rounded-xl w-fit">
          <button
            onClick={() => setActiveSubTab("catalog")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeSubTab === "catalog" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
          >
            Stock Levels & Variants
          </button>
          <button
            onClick={() => setActiveSubTab("orders")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${activeSubTab === "orders" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"}`}
          >
            Offline CRM Sales ({offlineOrders.length})
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeSubTab === "catalog" ? (
            <button
              onClick={() => handleExportCSV("inventory")}
              className="rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Stock Excel
            </button>
          ) : (
            <>
              <button
                onClick={() => handleExportCSV("sales")}
                className="rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-bold text-neutral-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CRM Sales
              </button>
              <button
                onClick={() => setShowOrderModal(true)}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                + Log Offline Sale
              </button>
            </>
          )}
        </div>
      </div>

      {/* FILTER PANEL FOR CATALOG */}
      {activeSubTab === "catalog" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 pl-8 text-xs outline-none focus:ring-1 focus:ring-emerald-650 transition shadow-sm"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {brandList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-500">Brand:</span>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="rounded-xl border border-neutral-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-650"
                >
                  <option value="">All Brands</option>
                  {brandList.map((b, idx) => (
                    <option key={idx} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {categoryList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-500">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-neutral-300 bg-white px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-650"
                >
                  <option value="">All Categories</option>
                  {categoryList.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {(searchTerm || brandFilter || categoryFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setBrandFilter("");
                  setCategoryFilter("");
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* STOCK CATALOG TABLE */}
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3.5 w-16">Image</th>
                    <th className="px-4 py-3.5">Product Title</th>
                    <th className="px-4 py-3.5">Brand</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Variants Count</th>
                    <th className="px-4 py-3.5 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No products found.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isExpanded = expandedProductId === p.id;
                      const variants = p.variants || [];
                      
                      return (
                        <React.Fragment key={p.id}>
                          <tr className={`hover:bg-neutral-50/50 transition-colors ${isExpanded ? "bg-neutral-50/80 font-medium" : ""}`}>
                            <td className="px-4 py-3">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover border bg-neutral-50" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center text-[10px] text-neutral-400 font-bold">No Image</div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-neutral-900">{p.title}</td>
                            <td className="px-4 py-3 text-neutral-600">{p.vendor || "—"}</td>
                            <td className="px-4 py-3 text-neutral-600">{p.productType || "—"}</td>
                            <td className="px-4 py-3 text-neutral-600 font-semibold">{variants.length} Variant(s)</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleToggleExpand(p)}
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold border transition cursor-pointer shadow-sm ${
                                  isExpanded 
                                    ? "bg-amber-600 border-amber-600 text-white" 
                                    : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                                }`}
                              >
                                {isExpanded ? "Close" : "Manage Stock"}
                              </button>
                            </td>
                          </tr>

                          {/* EXPANDABLE QUICK VARIANTS DRAWER */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="bg-neutral-50/50 border-y border-neutral-200 px-6 py-4">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Modify Product Variants</h4>
                                    {saveSuccess && <span className="text-xs font-bold text-emerald-600 animate-pulse">{saveSuccess}</span>}
                                    {saveError && <span className="text-xs font-bold text-red-600">{saveError}</span>}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {editingVariants.map((v, idx) => (
                                      <div key={v.id || idx} className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3 shadow-sm">
                                        <div className="flex justify-between items-center border-b pb-2">
                                          <span className="font-bold text-neutral-900 text-xs">{v.title || "Default"} ({v.unit || "g"})</span>
                                          <button
                                            type="button"
                                            onClick={() => handleQuickSaleShortcut(p, v)}
                                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 cursor-pointer"
                                            title="Record a quick manual sale of this variant"
                                          >
                                            + Log Sale
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[10px] font-semibold text-neutral-500 uppercase">Price (INR)</label>
                                            <input
                                              type="number"
                                              value={v.price?.amount || 0}
                                              onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                                              disabled={savingProductId === p.id}
                                              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[10px] font-semibold text-neutral-500 uppercase">Stock Qty</label>
                                            <input
                                              type="number"
                                              placeholder="Unlimited"
                                              value={v.stock === null || v.stock === undefined ? "" : v.stock}
                                              onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                                              disabled={savingProductId === p.id}
                                              className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1.5">
                                          <input
                                            type="checkbox"
                                            id={`inv-chk-${p.id}-${idx}`}
                                            checked={!!v.callForInventory}
                                            onChange={(e) => handleVariantChange(idx, "callForInventory", e.target.checked)}
                                            disabled={savingProductId === p.id}
                                            className="h-3.5 w-3.5 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
                                          />
                                          <label htmlFor={`inv-chk-${p.id}-${idx}`} className="text-[10px] font-bold text-neutral-600 cursor-pointer select-none">
                                            Call For Inventory (Show even if 0 stock)
                                          </label>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex justify-end gap-2 pt-2">
                                    <button
                                      onClick={() => handleToggleExpand(p)}
                                      className="rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-700 transition cursor-pointer"
                                    >
                                      Discard
                                    </button>
                                    <button
                                      onClick={() => handleSaveVariants(p.id)}
                                      disabled={savingProductId === p.id}
                                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                      {savingProductId === p.id ? "Saving..." : "Save Stock & Price"}
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CRM OFFLINE SALES LOG SUBTAB */}
      {activeSubTab === "orders" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4">Reference ID</th>
                    <th className="px-6 py-4">Customer Name & Contact</th>
                    <th className="px-6 py-4">Items Sold</th>
                    <th className="px-6 py-4">Total Value</th>
                    <th className="px-6 py-4">Date logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {offlineOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-neutral-550">
                        No offline CRM sales logged yet.
                      </td>
                    </tr>
                  ) : (
                    offlineOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-neutral-900">{o.payment_id || `OFF-${o.id}`}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-neutral-900">{o.customer_name || "Offline Guest"}</div>
                          <div className="text-neutral-500 text-[10px] space-y-0.5 mt-0.5">
                            {o.customer_email && <div>{o.customer_email}</div>}
                            {o.customer_phone && <div>{o.customer_phone}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-sm">
                          <div className="flex flex-wrap gap-1.5">
                            {o.order_items?.map((item, idx) => (
                              <span key={idx} className="inline-flex items-center rounded-lg bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-700 border">
                                {item.title} ({item.variantTitle || "Default"}) <strong className="ml-1 text-neutral-900">x{item.quantity}</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-neutral-900">₹{parseFloat(o.total_amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-neutral-500 text-xs">
                          {new Date(o.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* OFFLINE SALES LOG POPUP MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b p-6 bg-neutral-50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                Log Offline Sale (Stock Deduction)
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="text-neutral-400 hover:text-neutral-600 font-bold transition text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleLogOfflineOrderSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Customer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-600 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="Customer Email (Optional)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-600 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="Customer Phone (Optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-600 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Items logging */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Order Items</h4>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    + Add Product
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedItems.map((item, idx) => {
                    const productObj = products.find(p => p.id === item.productId);
                    const variantsList = productObj?.variants || [];
                    
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row items-end gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 shadow-sm">
                        {/* Select Product */}
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Select Product</label>
                          <select
                            required
                            value={item.productId}
                            onChange={(e) => handleLineItemChange(idx, "productId", e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-600 shadow-sm"
                          >
                            <option value="">-- Choose Product --</option>
                            {products.filter(p => !p.is_archived).map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </div>

                        {/* Select Variant */}
                        <div className="w-full sm:w-40">
                          <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Weight / Variant</label>
                          <select
                            required
                            value={item.variantId}
                            disabled={!item.productId}
                            onChange={(e) => handleLineItemChange(idx, "variantId", e.target.value)}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50 shadow-sm"
                          >
                            <option value="">-- Choose Variant --</option>
                            {variantsList.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.title || "Default"} (₹{v.price?.amount || 0}) {v.stock !== null ? `[Stock: ${v.stock}]` : "[Stock: ∞]"}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="w-full sm:w-20">
                          <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Qty</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(idx, "quantity", parseInt(e.target.value, 10) || 1)}
                            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-emerald-600 shadow-sm"
                          />
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-red-500 hover:text-red-700 pb-2 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
                          title="Remove item"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Calculation Panel */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <span className="text-xs font-bold text-emerald-800">Total Calculated Order Value:</span>
                <span className="text-lg font-black text-emerald-900">₹{calculatedTotal.toLocaleString()}</span>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 px-5 py-2.5 text-xs font-semibold text-neutral-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingOrder}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isLoggingOrder ? "Logging Sale..." : "Log & Deduct Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
