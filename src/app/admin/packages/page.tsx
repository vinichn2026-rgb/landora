"use client";

import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle2,
  Edit,
  RefreshCw,
  Sparkles,
  Clock,
  Layers,
  X,
  AlertCircle
} from "lucide-react";
import { ListingPackageItem } from "@/types";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<ListingPackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<ListingPackageItem | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [durationDays, setDurationDays] = useState("45");
  const [listingLimit, setListingLimit] = useState("1");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [featuresStr, setFeaturesStr] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Failed to load packages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openEditModal = (pkg: ListingPackageItem) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setPrice(String(pkg.price));
    setDurationDays(String(pkg.durationDays));
    setListingLimit(String(pkg.listingLimit));
    setIsFeatured(pkg.isFeatured);
    setIsActive(pkg.isActive);
    setDescription(pkg.description);
    setFeaturesStr(pkg.features.join("\n"));
    setIsModalOpen(true);
  };

  const handleSavePackage = async () => {
    if (!editingPkg) return;
    if (!name.trim()) {
      alert("Please provide a package name.");
      return;
    }

    setIsSaving(true);
    try {
      const features = featuresStr
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        id: editingPkg.id,
        name: name.trim(),
        price: Number(price) || 0,
        durationDays: Number(durationDays) || 30,
        listingLimit: Number(listingLimit) || 1,
        isFeatured,
        isActive,
        description: description.trim(),
        features,
      };

      const res = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(`Package "${name}" updated successfully.`);
        setIsModalOpen(false);
        fetchPackages();
      } else {
        alert(data.error || "Failed to update package.");
      }
    } catch (err) {
      console.error("Failed to update package:", err);
      alert("Network error updating package.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePackageActive = async (pkg: ListingPackageItem) => {
    const nextState = !pkg.isActive;
    try {
      const res = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pkg.id,
          isActive: nextState,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(`Package "${pkg.name}" is now ${nextState ? "active" : "disabled"}.`);
        fetchPackages();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className="flex items-center justify-between p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs text-emerald-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            Listing Package Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure pricing tiers, listing quotas, duration validity, and premium seller features.
          </p>
        </div>

        <button
          onClick={fetchPackages}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
          <p>Loading package configurations...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <Package className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No packages found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl border transition ${
                pkg.isFeatured
                  ? "bg-gradient-to-b from-slate-900 to-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                      {pkg.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">ID: {pkg.id}</span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      pkg.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {pkg.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400">/ package</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{pkg.description}</p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Duration: <strong>{pkg.durationDays} days</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Quota: <strong>{pkg.listingLimit} listing{pkg.listingLimit > 1 ? "s" : ""}</strong></span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Included Features
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Configuration
                </button>
                <button
                  onClick={() => togglePackageActive(pkg)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                    pkg.isActive
                      ? "bg-slate-800/60 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border-slate-700 hover:border-rose-800/50"
                      : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/50"
                  }`}
                >
                  {pkg.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Package Modal */}
      {isModalOpen && editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">Edit Package: {editingPkg.name}</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Package Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Listing Limit</label>
                  <input
                    type="number"
                    value={listingLimit}
                    onChange={(e) => setListingLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Features List (One feature per line)
                </label>
                <textarea
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  rows={5}
                  placeholder="e.g. 1 Active Listing&#10;Direct Buyer Leads&#10;30 Days Validity"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span>Mark as Featured Plan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span>Package Active & Visible</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePackage}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 transition"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
