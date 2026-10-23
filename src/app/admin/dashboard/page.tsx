"use client";

import Link from "next/link";
import { FolderLock, ShieldCheck, CheckCircle2, AlertTriangle, Users, Building, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { PropertyStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const { properties } = PropertyStore.getAll({});

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-10">
        <Container className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0c4a3e] mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Marketplace</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-[#132a24] tracking-tight">
                Administration Portal
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Moderation queue, user management, and listing verification overview.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-100 text-[#0c4a3e] font-bold px-3 py-1 rounded-full border border-emerald-300">
                System Status: Operational
              </span>
            </div>
          </div>

          {/* Key Admin KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Listings</span>
              <p className="text-2xl font-black text-[#132a24] mt-1">{properties.length}</p>
              <span className="text-[10px] text-emerald-600 font-bold">All active in database</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Review</span>
              <p className="text-2xl font-black text-amber-600 mt-1">0</p>
              <span className="text-[10px] text-slate-400">Queue is clear</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Reported Listings</span>
              <p className="text-2xl font-black text-slate-700 mt-1">0</p>
              <span className="text-[10px] text-slate-400">No unresolved flags</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e2e8e4] shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Promoters</span>
              <p className="text-2xl font-black text-[#0c4a3e] mt-1">14</p>
              <span className="text-[10px] text-emerald-600 font-bold">DTCP / RERA checked</span>
            </div>
          </div>

          {/* Properties Moderation Table */}
          <div className="bg-white rounded-2xl border border-[#e2e8e4] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#132a24]">Current Active Database Listings</h2>
              <span className="text-xs text-slate-500 font-medium">Demo Store Mode</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Property</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                        {prop.title}
                      </td>
                      <td className="p-4">{prop.locality}, {prop.city}</td>
                      <td className="p-4">{prop.propertyType.replace("_", " ")}</td>
                      <td className="p-4 font-mono font-bold text-[#0c4a3e]">
                        ₹{prop.price.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                          {prop.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/properties/${prop.slug}`}
                          className="text-[#0c4a3e] font-bold hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
