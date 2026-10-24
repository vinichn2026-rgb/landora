"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Edit,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Megaphone,
  X,
  Clock
} from "lucide-react";
import { ContentBannerItem } from "@/types";

export default function AdminContentPage() {
  const [contentList, setContentList] = useState<ContentBannerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentBannerItem | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (data.success) {
        setContentList(data.content || []);
      }
    } catch (err) {
      console.error("Failed to load content:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const openEditModal = (item: ContentBannerItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setCtaText(item.ctaText);
    setCtaLink(item.ctaLink);
    setIsModalOpen(true);
  };

  const handleSaveContent = async () => {
    if (!editingItem) return;
    if (!title.trim() || !subtitle.trim()) {
      alert("Please provide both title and subtitle.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editingItem.key,
          title: title.trim(),
          subtitle: subtitle.trim(),
          ctaText: ctaText.trim(),
          ctaLink: ctaLink.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionNotice(`Banner copy for "${editingItem.key}" updated.`);
        setIsModalOpen(false);
        fetchContent();
      } else {
        alert(data.error || "Failed to update content banner.");
      }
    } catch (err) {
      console.error("Failed to update content:", err);
      alert("Network error updating content banner.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionIcon = (key: string) => {
    switch (key) {
      case "hero_headline":
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case "post_property_banner":
        return <Layers className="w-5 h-5 text-blue-400" />;
      case "announcement_bar":
        return <Megaphone className="w-5 h-5 text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getFriendlyKeyName = (key: string) => {
    switch (key) {
      case "hero_headline":
        return "Homepage Hero Banner";
      case "post_property_banner":
        return "Post Property Promotional Card";
      case "announcement_bar":
        return "Top Platform Announcement Bar";
      default:
        return key;
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
            <FileText className="w-6 h-6 text-emerald-400" />
            Basic Content & Copy Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Edit homepage hero copy, marketing callouts, announcement alerts, and primary buttons.
          </p>
        </div>

        <button
          onClick={fetchContent}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Content Items Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin" />
          <p>Loading platform content modules...</p>
        </div>
      ) : contentList.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No content banners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {contentList.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                    {getSectionIcon(item.key)}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {getFriendlyKeyName(item.key)}
                    </h2>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Key: {item.key}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <span>CTA: {item.ctaText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Destination: {item.ctaLink}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      Updated{" "}
                      {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center md:self-center">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition"
                >
                  <Edit className="w-4 h-4 text-emerald-400" />
                  Edit Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Content Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">
                Edit {getFriendlyKeyName(editingItem.key)}
              </h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Main Headline / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Subtitle / Descriptive Copy
                </label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    CTA Link URL
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
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
                onClick={handleSaveContent}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50 transition"
              >
                {isSaving ? "Saving..." : "Save Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
