"use client";

import { useState, useEffect } from "react";
import { deleteTeammate } from "./actions";

export default function TeamTab({ initialTeamMembers }) {
  const [members, setMembers] = useState(initialTeamMembers || []);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const registerLink = `${origin || "http://localhost:3000"}/register`;

  const handleDelete = async (id, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName || "this teammate"} from the team?`)) {
      return;
    }

    const result = await deleteTeammate(id);
    if (result.error) {
      alert("Error: " + result.error);
    } else {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registerLink);
    alert("Teammate registration link copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* List of Team Members */}
      <div className="space-y-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Team Members</h2>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4">Name & Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-neutral-500">
                      No team members registered yet.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-neutral-900">{m.name || "N/A"}</div>
                        <div className="text-xs text-neutral-500">{m.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          m.role === "Admin" 
                            ? "bg-amber-50 text-amber-700 border border-amber-200/50" 
                            : "bg-neutral-100 text-neutral-800"
                        }`}>
                          {m.role || "Member"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 text-xs">
                        {new Date(m.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(m.id, m.name || m.email)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Share Registration Link Card */}
      <div className="space-y-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-neutral-900">Add Teammates</h2>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Share this registration link with your teammates. They can use it to create their account and gain access to the administration portal.
          </p>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Registration Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={registerLink}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="rounded-xl bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-800 transition shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
