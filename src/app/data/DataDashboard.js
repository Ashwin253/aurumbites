"use client";

import { useState } from "react";
import InventoryTab from "./InventoryTab";
import MessagesTab from "./MessagesTab";
import OrdersTab from "./OrdersTab";
import TopListTab from "./TopListTab";

export default function DataDashboard({ initialProducts, initialMessages, initialCategories, initialBrands, initialOrders }) {
  const [activeTab, setActiveTab] = useState("inventory");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 border-b border-neutral-200">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
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
        </nav>
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
      </div>
    </div>
  );
}
