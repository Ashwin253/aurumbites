"use client";

import { useState } from "react";
import InventoryTab from "./InventoryTab";
import MessagesTab from "./MessagesTab";
import OrdersTab from "./OrdersTab";
import TopListTab from "./TopListTab";
import OffersTab from "./OffersTab";
import TeamTab from "./TeamTab";
import CrmTab from "./CrmTab";

export default function DataDashboard({ 
  initialProducts, 
  initialMessages, 
  initialCategories, 
  initialBrands, 
  initialOrders, 
  initialOffers,
  initialTeamMembers,
  initialAllowedEmails,
  currentUser
}) {
  const [activeTab, setActiveTab] = useState("inventory");

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
            Catalog
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "crm"
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
            Not Found Page
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
          <button
            onClick={() => setActiveTab("team")}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition ${
              activeTab === "team"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
            }`}
          >
            Team
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
        {activeTab === "offers" && (
          <OffersTab 
            initialOffers={initialOffers} 
            initialProducts={initialProducts} 
            initialCategories={initialCategories}
            initialBrands={initialBrands}
          />
        )}
        {activeTab === "team" && (
          <TeamTab 
            initialTeamMembers={initialTeamMembers}
            initialAllowedEmails={initialAllowedEmails}
            currentUser={currentUser}
          />
        )}
        {activeTab === "crm" && (
          <CrmTab 
            initialProducts={initialProducts} 
            initialCategories={initialCategories}
            initialBrands={initialBrands}
            initialOrders={initialOrders}
          />
        )}
      </div>
    </div>
  );
}
