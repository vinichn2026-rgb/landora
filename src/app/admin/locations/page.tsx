"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  PlusCircle,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Building2,
  X
} from "lucide-react";
import { LocationItem } from "@/types";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [city, setCity] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [localitiesStr, setLocalitiesStr] = useState("");
  const [count, setCount] = useState("0");
  const [isSaving, setIsSaving] = useState(false);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/locations");
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations);
      }
    } catch (err) {
      console.error("Failed to load locations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openAddModal = () => {
    setEditingLocation(null);
    setCity("");
    setState("Tamil Nadu");
    setLocalitiesStr("");
    setCount("100");
    setIsModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingLocation(loc);
    setCity(loc.city);
    setState(loc.state);
    setLocalitiesStr(loc.popularLocalities.join(", "));
    setCount(String(loc.count));
    setIsModalOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!city.trim() || !state.trim()) {
      alert("Please provide both city and state.");
      return;
    }

    setIsSaving(true);
    try {
      const popularLocalities = localitiesStr
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      const endpoint = "/api/admin/locations";
      const method = editingLocation ? "PUT" : "POST";
      const payload = {
        ...(editingLocation ? { id: editingLocation.id } : {}),
        city: city.trim(),
        state: state.trim(),
        popularLocalities,
        count: Number(count) || 0,
        isActive: true,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setIsModalOpen(false);
        fetchLocations();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Save failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLocation = async (id: string, cityName: string) => {
    if (!confirm(`Are you sure you want to delete "${cityName}" from the location registry? This action will be logged in the audit trail.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/locations?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Location ${cityName} deleted.`);
        fetchLocations();
        setTimeout(() => setActionNotice(null), 4000);
      } else {
        alert(data.error || "Delete failed.");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Location Hubs & Localities</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure popular focus cities, state groupings, and top search localities across Tamil Nadu & South India.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Add Focus Hub</span>
          </button>
          <button
            onClick={fetchLocations}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
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

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#0c4a3e]" />
                    <span>{loc.city}</span>
                  </h3>
                  <span className="text-xs text-slate-400">{loc.state}</span>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  {loc.count.toLocaleString()} properties
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Popular Localities ({loc.popularLocalities?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {loc.popularLocalities?.map(locName => (
                    <span key={locName} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded">
                      {locName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(loc)}
                className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDeleteLocation(loc.id, loc.city)}
                className="px-3 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingLocation ? "Edit Location Hub" : "Add New Location Hub"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City Name *</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Coimbatore, Salem, Erode"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State *</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Popular Localities (Comma separated)
                </label>
                <textarea
                  rows={3}
                  value={localitiesStr}
                  onChange={e => setLocalitiesStr(e.target.value)}
                  placeholder="Peelamedu, Saravanampatti, RS Puram, Gandhipuram"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estimated Listing Inventory Count</label>
                <input
                  type="number"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0c4a3e]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSaving}
                onClick={handleSaveLocation}
                className="px-5 py-2 rounded-xl bg-[#0c4a3e] hover:bg-[#072e27] text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Location"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
