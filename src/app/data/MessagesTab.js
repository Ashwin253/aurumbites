"use client";

import { useState } from "react";
import { updateMessageStatus } from "./actions";

export default function MessagesTab({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || []);

  const handleUpdateStatus = async (id, status) => {
    const result = await updateMessageStatus(id, status);
    if (result.error) {
      alert("Error updating status: " + result.error);
    } else {
      setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Enquiries & Messages</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  No messages yet.
                </td>
              </tr>
            ) : (
              messages.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-600 align-top whitespace-nowrap">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-neutral-900">{m.name}</div>
                    <div className="text-neutral-500">{m.email}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="max-w-md whitespace-pre-wrap text-neutral-700">
                      {m.message}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      value={m.status || "new"}
                      onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                        m.status === "read" || m.status === "resolved" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="resolved">Resolved</option>
                    </select>
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
