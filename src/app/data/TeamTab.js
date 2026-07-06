"use client";

import { useState, useEffect } from "react";
import { deleteTeammate, addAllowedEmail, deleteAllowedEmail, logoutUser } from "./actions";

export default function TeamTab({ initialTeamMembers, initialAllowedEmails, currentUser }) {
  const [members, setMembers] = useState(initialTeamMembers || []);
  const [allowedEmails, setAllowedEmails] = useState(initialAllowedEmails || []);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;
    const result = await logoutUser();
    if (result.success) {
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.href = "/login";
    }
  };
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const registerLink = `${origin || "http://localhost:3000"}/register`;

  const handleDeleteMember = async (id, memberName) => {
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

  const handleAddEmail = async (e) => {
    e.preventDefault();
    const emailToTrim = newEmail.trim();
    if (!emailToTrim) return;

    setAdding(true);
    const result = await addAllowedEmail(emailToTrim);
    setAdding(false);

    if (result.error) {
      alert(result.error);
    } else if (result.success && result.data) {
      setAllowedEmails([result.data, ...allowedEmails]);
      setNewEmail("");
    }
  };

  const handleDeleteAllowedEmail = async (id, email) => {
    if (!confirm(`Are you sure you want to remove ${email} from the whitelist?`)) {
      return;
    }

    const result = await deleteAllowedEmail(id);
    if (result.error) {
      alert("Error: " + result.error);
    } else {
      setAllowedEmails(allowedEmails.filter(ae => ae.id !== id));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(registerLink);
    alert("Teammate registration link copied to clipboard!");
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Whitelist and Registered Members List */}
      <div className="space-y-8 lg:col-span-2">
        {/* Whitelisted Emails Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Allowed Registration Whitelist</h2>
            <span className="rounded-full bg-amber-50 border border-amber-200/50 px-3 py-1 text-xs font-semibold text-amber-700">
              {allowedEmails.length} {allowedEmails.length === 1 ? "email" : "emails"} allowed
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <form onSubmit={handleAddEmail} className="flex gap-2 mb-6">
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <button
                type="submit"
                disabled={adding}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition shrink-0 disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Email"}
              </button>
            </form>

            <div className="overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-neutral-100/80 text-neutral-500 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3">Whitelisted Email</th>
                      <th className="px-4 py-3">Date Added</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {allowedEmails.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-xs text-neutral-500">
                          No whitelisted emails yet. Anyone with the registration link might be blocked. Add emails above to authorize registration.
                        </td>
                      </tr>
                    ) : (
                      allowedEmails.map((ae) => (
                        <tr key={ae.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-neutral-800 text-xs">
                            {ae.email}
                          </td>
                          <td className="px-4 py-3 text-neutral-500 text-[11px]">
                            {new Date(ae.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteAllowedEmail(ae.id, ae.email)}
                              className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition cursor-pointer"
                            >
                              Remove Whitelist
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
        </div>

        {/* Registered Team Members Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Registered Team Members</h2>
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
                    members.map((m) => {
                      const isMe = currentUser && (m.email === currentUser.email || m.id === currentUser.id);
                      return (
                        <tr key={m.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-neutral-900 flex items-center gap-2">
                              {m.name || "N/A"}
                              {isMe && (
                                <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                  You
                                </span>
                              )}
                            </div>
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
                            {!isMe ? (
                              <button
                                onClick={() => handleDeleteMember(m.id, m.name || m.email)}
                                className="text-xs font-semibold text-red-600 hover:text-red-800 transition cursor-pointer"
                              >
                                Remove User
                              </button>
                            ) : (
                              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Logged In</span>
                            )}
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
      </div>

      {/* Invitation Info Panel */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900">Invite Teammates</h2>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition cursor-pointer shadow-sm"
          >
            Log Out
          </button>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <p className="text-xs text-neutral-600 leading-relaxed">
            Only users with whitelisted emails can complete registration. Add their email to the whitelist first, then share this registration link with them.
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
                className="rounded-xl bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-800 transition shrink-0 cursor-pointer"
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
