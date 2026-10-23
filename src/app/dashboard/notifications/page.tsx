"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ArrowLeft, Check, CheckCheck, Loader2, Sparkles, TrendingDown, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/notifications");
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleMarkSingleRead = async (notificationId: string) => {
    try {
      await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const getIcon = (type: string) => {
    if (type === "PRICE_DROP") return <TrendingDown className="w-5 h-5 text-emerald-600" />;
    if (type === "NEW_ENQUIRY" || type === "ENQUIRY_UPDATE") return <MessageSquare className="w-5 h-5 text-sky-600" />;
    return <Sparkles className="w-5 h-5 text-[#c59b27]" />;
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-3xl space-y-6">
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
                Notifications & Alerts ({notifications.length})
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Updates on shortlisted properties, price revisions, and seller responses.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0c4a3e]" />
              <p className="text-xs font-bold">Loading alerts...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#e2e8e4] space-y-3">
              <Bell className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Notifications</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                You&apos;re completely up to date! Price drops on your shortlisted properties and direct enquiry responses will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition flex items-start gap-3.5 ${
                    notif.isRead
                      ? "bg-white border-[#e2e8e4]"
                      : "bg-emerald-50/40 border-emerald-200 shadow-2xs"
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shrink-0 shadow-2xs">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkSingleRead(notif.id)}
                        className="text-[11px] font-bold text-[#0c4a3e] hover:underline pt-1 inline-block cursor-pointer"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
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
