"use client";

import { useState } from "react";
import InventoryTab from "./InventoryTab";
import MessagesTab from "./MessagesTab";
import OrdersTab from "./OrdersTab";
import TopListTab from "./TopListTab";
import OffersTab from "./OffersTab";

export default function DataDashboard({ initialProducts, initialMessages, initialCategories, initialBrands, initialOrders, initialOffers }) {
  const [activeTab, setActiveTab] = useState("inventory");

  const handleCopyRegisterLink = () => {
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/register`;
      navigator.clipboard.writeText(link);
      alert("Teammate registration link copied to clipboard!");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 border-b border-neutral-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 sm:pb-0">
        <nav className="-mb-px flex gap-6 overflow-x-auto pb-1" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "inventory"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "messages"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            }`}
          >
            Messages & Enquiries
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "orders"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            }`}
          >
            Paid Orders
          </button>
          <button
            onClick={() => setActiveTab("toplist")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "toplist"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            }`}
          >
            Top List
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "offers"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            }`}
          >
            Offers
          </button>
        </nav>

        <button
          onClick={handleCopyRegisterLink}
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-700 transition cursor-pointer self-start sm:self-auto shadow-sm shrink-0"
        >
          <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Register Link
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "inventory" && (
          <InventoryTab 
            initialProducts={initialProducts} 
            initialCategories={initialCategories}
            initialBrands={initialBrands}
          />
        )}
        {activeTab === "messages" && (
          <MessagesTab initialMessages={initialMessages} />
        )}
        {activeTab === "orders" && (
          <OrdersTab initialOrders={initialOrders} />
        )}
        {activeTab === "toplist" && (
          <TopListTab initialProducts={initialProducts} />
        )}
        {activeTab === "offers" && (
          <OffersTab 
            initialOffers={initialOffers} 
            initialProducts={initialProducts} 
            initialCategories={initialCategories}
            initialBrands={initialBrands}
          />
        )}
      </div>
    </div>
  );
}
