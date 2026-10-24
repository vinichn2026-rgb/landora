"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderLock,
  Building2,
  Users,
  MessageCircle,
  AlertTriangle,
  MapPin,
  Package,
  CreditCard,
  FileEdit,
  History,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BrandLogo from "@/components/BrandLogo";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Access Control Guard
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-xs text-emerald-400 font-mono">
        Authenticating administrative session...
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <meta name="robots" content="noindex, nofollow" />
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-black text-white">Administrator Access Required</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              You must be authenticated with an <strong>ADMIN</strong> account to access the Landora administration desk and moderation operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href="/login"
              className="flex-1 py-2.5 px-4 bg-[#0c4a3e] hover:bg-[#072e27] text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: FolderLock },
    { href: "/admin/properties", label: "Properties & Moderation", icon: Building2 },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/enquiries", label: "Platform Enquiries", icon: MessageCircle },
    { href: "/admin/reports", label: "Reported Listings", icon: AlertTriangle },
    { href: "/admin/locations", label: "Location Hubs", icon: MapPin },
    { href: "/admin/content", label: "Homepage & Content", icon: FileEdit },
    { href: "/admin/packages", label: "Listing Packages", icon: Package },
    { href: "/admin/payments", label: "Payments & Gateway", icon: CreditCard },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <meta name="robots" content="noindex, nofollow" />
      
      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <span className="text-emerald-400 font-black text-lg tracking-tight">LANDORA</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                ADMIN DESK
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <span>View Marketplace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <div className="w-7 h-7 rounded-full bg-[#0c4a3e] text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/30">
                A
              </div>
              <span className="text-xs font-bold text-slate-200 hidden md:inline truncate max-w-[120px]">
                {user.name}
              </span>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition ml-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static pt-14 lg:pt-0 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Navigation Modules</div>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#0c4a3e] text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-slate-500"}`} />
                  <span className="flex-1">{link.label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-emerald-300" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Platform Live</span>
            </div>
            <div>PostgreSQL / Next.js 16.3</div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
