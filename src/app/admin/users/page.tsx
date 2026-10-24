"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX,
  Edit,
  Mail,
  Phone,
  Clock,
  KeyRound,
  LogIn,
  Laptop
} from "lucide-react";
import { UserItem, UserRole, LoginActivityItem } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loginActivities, setLoginActivities] = useState<LoginActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewTab, setViewTab] = useState<"users" | "logins">("users");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Role Edit Modal
  const [editingRoleUser, setEditingRoleUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("BUYER");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (searchQuery.trim()) params.append("query", searchQuery.trim());

      const [resUsers, resLogins] = await Promise.all([
        fetch(`/api/admin/users?${params.toString()}`),
        fetch("/api/admin/login-activity?limit=100")
      ]);

      const dataUsers = await resUsers.json();
      const dataLogins = await resLogins.json();

      if (dataUsers.success) {
        setUsers(dataUsers.users);
      }
      if (dataLogins.success) {
        setLoginActivities(dataLogins.activities || []);
      }
    } catch (err) {
      console.error("Failed to load admin users & login activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleSuspension = async (userId: string, currentSuspended: boolean) => {
    const actionName = currentSuspended ? "reactivate" : "suspend";
    if (!confirm(`Are you sure you want to ${actionName} this user account?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isSuspended: !currentSuspended,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        fetchUsers();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Action failed.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleSaveRole = async () => {
    if (!editingRoleUser) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingRoleUser.id,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setEditingRoleUser(null);
        fetchUsers();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Failed to update role.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>;
      case "SELLER":
        return <span className="bg-emerald-100 text-[#0c4a3e] text-[10px] font-bold px-2 py-0.5 rounded-full">SELLER</span>;
      case "AGENT":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">AGENT</span>;
      case "BUILDER":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">BUILDER</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">BUYER</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Account Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search accounts, manage role permissions, suspend bad actors, and monitor registered participants.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✓ {actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Top View Toggle Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setViewTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            viewTab === "users"
              ? "bg-[#0c4a3e] text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setViewTab("logins")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            viewTab === "logins"
              ? "bg-[#0c4a3e] text-white shadow-xs"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Recent Login History ({loginActivities.length})</span>
        </button>
      </div>

      {viewTab === "users" ? (
        <>
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "ALL", label: "All Users" },
                { id: "BUYER", label: "Buyers" },
                { id: "SELLER", label: "Sellers" },
                { id: "AGENT", label: "Agents" },
                { id: "BUILDER", label: "Builders" },
                { id: "ADMIN", label: "Admins" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    roleFilter === tab.id
                      ? "bg-[#0c4a3e] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
              />
            </form>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total registered: <strong>{users.length}</strong> accounts</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading user accounts...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">User Profile</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Assigned Role</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5">Last Login</th>
                      <th className="p-3.5">Joined Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#0c4a3e]/10 text-[#0c4a3e] font-bold text-xs flex items-center justify-center border border-[#0c4a3e]/20">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[10px] text-slate-400">ID: {u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                          {u.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phoneNumber}</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {getRoleBadge(u.role)}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {u.isSuspended ? (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {u.lastLoginAt ? (
                            <div className="flex items-center gap-1 text-emerald-800 font-semibold text-[11px]">
                              <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>
                                {new Date(u.lastLoginAt).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">No login recorded</span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingRoleUser(u);
                                setSelectedRole(u.role);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3 text-slate-500" />
                              <span>Role</span>
                            </button>

                            <button
                              onClick={() => handleToggleSuspension(u.id, Boolean(u.isSuspended))}
                              className={`px-2.5 py-1 rounded-lg border font-bold text-[11px] transition cursor-pointer ${
                                u.isSuspended
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }`}
                            >
                              {u.isSuspended ? "Reactivate" : "Suspend"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Login Activity Tab View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#0c4a3e]" />
              <span className="font-bold text-slate-900">Recorded Successful Login Events</span>
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                {loginActivities.length} Events
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Persisted in PostgreSQL database</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading login history...</div>
          ) : loginActivities.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No login events recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Account / User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Auth Method</th>
                    <th className="p-3.5">Client IP & Device</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loginActivities.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{a.userName || a.email.split("@")[0]}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{a.email}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {getRoleBadge((a.role as UserRole) || "BUYER")}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          a.eventType === "LOGIN_OTP"
                            ? "bg-emerald-100 text-emerald-800"
                            : a.eventType === "REGISTER_INITIAL"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {a.eventType === "LOGIN_OTP"
                            ? "Email OTP"
                            : a.eventType === "REGISTER_INITIAL"
                            ? "New Account Registered"
                            : "Password Login"}
                        </span>
                        {a.details && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{a.details}</div>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <div>{a.ipAddress || "127.0.0.1"}</div>
                        {a.userAgent && (
                          <div className="text-[9.5px] text-slate-400 truncate max-w-xs">{a.userAgent}</div>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-slate-600">
                        {new Date(a.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>SUCCESS</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Role Management Modal */}
      {editingRoleUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Account Role</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                User: <strong>{editingRoleUser.name}</strong> ({editingRoleUser.email})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Select New Authorised Role
              </label>
              <div className="space-y-2">
                {(["BUYER", "SELLER", "AGENT", "BUILDER", "ADMIN"] as UserRole[]).map(r => (
                  <label
                    key={r}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                      selectedRole === r ? "border-[#0c4a3e] bg-emerald-50 text-[#0c4a3e]" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{r}</span>
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={selectedRole === r}
                      onChange={() => setSelectedRole(r)}
                      className="accent-[#0c4a3e]"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingRoleUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleSaveRole}
                className="px-5 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isProcessing ? "Saving..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
