"use client";

import { useState } from "react";

export default function OrdersTab({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Paid Checkout Orders</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer Details</th>
              <th className="px-4 py-3 font-medium">Purchased Items</th>
              <th className="px-4 py-3 font-medium">Total Amount</th>
              <th className="px-4 py-3 font-medium">Payment Transaction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No online orders received yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-600 align-top whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString()}
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-neutral-900">{o.customer_name}</div>
                    <div className="text-neutral-500 text-xs">{o.customer_email}</div>
                    {o.customer_phone && (
                      <div className="text-neutral-500 text-xs font-mono mt-0.5">{o.customer_phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="space-y-1.5">
                      {Array.isArray(o.order_items) ? (
                        o.order_items.map((item, idx) => (
                          <div key={idx} className="text-xs text-neutral-700 bg-neutral-50 border border-neutral-200/50 rounded-lg p-2 flex items-center justify-between gap-4">
                            <div>
                              <span className="font-semibold text-neutral-900">{item.quantity}x</span> {item.title}
                              <span className="text-[10px] text-neutral-400 block font-normal">{item.variantTitle || "Default"}</span>
                            </div>
                            <span className="text-neutral-500">₹{item.price}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-neutral-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top font-semibold text-neutral-900 whitespace-nowrap">
                    ₹{o.total_amount}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      o.payment_provider === "razorpay" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {o.payment_provider}
                    </span>
                    <div className="text-[10px] text-neutral-400 font-mono mt-1 break-all select-all">
                      ID: {o.payment_id}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
