"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, ArrowRight, Trash2, Loader2, Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/context/AuthContext";
import { PropertyItem } from "@/types";

export default function SavedPropertiesPage() {
  const { user, toggleSaveProperty } = useAuth();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/saved-properties");
      const data = await res.json();
      if (data.success && data.properties) {
        setProperties(data.properties);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (propertyId: string) => {
    await toggleSaveProperty(propertyId);
    setProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header savedCount={properties.length} />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0c4a3e] mb-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
                Saved Properties & Shortlists ({properties.length})
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Keep track of plots, farmlands, and residences you are comparing for site visits.
              </p>
            </div>

            <Link
              href="/properties"
              className="text-xs font-bold text-[#0c4a3e] hover:underline flex items-center gap-1"
            >
              <span>Explore more properties</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0c4a3e]" />
              <p className="text-xs font-bold">Loading your saved shortlist...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#e2e8e4] space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Saved Properties Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Click the heart icon on any property card or detail page to add it to your shortlist for fast comparison.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 mt-2 bg-[#0c4a3e] hover:bg-[#072e27] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Compass className="w-4 h-4 text-[#c59b27]" />
                <span>Browse Property Listings</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <div key={p.id} className="relative group">
                  <PropertyCard property={p} />
                  <button
                    onClick={() => handleRemove(p.id)}
                    title="Remove from shortlist"
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-slate-600 hover:text-rose-600 shadow-md transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  );
}
