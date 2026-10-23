"use client";

import { useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon, Video, ShieldAlert, Check, Plus, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";

export default function MediaAndDocsPage() {
  const [highlights, setHighlights] = useState<string[]>([]);
  const [images, setImages] = useState([
    { id: 1, name: "land-front.jpg", tag: "Entrance" },
    { id: 2, name: "land-wide.jpg", tag: "" },
  ]);

  const highlightOptions = [
    "Borewell", 
    "Canal Water", 
    "Boundary Wall", 
    "Fencing", 
    "Clear Title", 
    "Electricity", 
    "Single Owner"
  ];

  const imageTags = ["Entrance", "Boundary", "Road view", "Drone shot"];

  const toggleHighlight = (option: string) => {
    if (highlights.includes(option)) {
      setHighlights(highlights.filter(h => h !== option));
    } else {
      setHighlights([...highlights, option]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Top Navigation / Progress */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
            <span>Step 2 of 2</span>
            <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden ml-2">
              <div className="h-full bg-green-600 w-full rounded-full"></div>
            </div>
          </div>
          <button className="text-sm font-medium text-neutral-500 hover:text-neutral-800 transition">Save Draft</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Media & Documents</h1>
          <p className="text-neutral-500">Upload photos to attract buyers and documents for fast verification.</p>
        </div>

        <div className="space-y-8">
          
          {/* 1. Document Upload Section */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-neutral-800">Ownership Proof</h2>
            </div>
            
            <div className="flex items-start gap-2 p-3 mb-6 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">
                <strong>Internal Verification Only</strong> — These documents are solely used by our legal team to verify your listing and will <strong>never</strong> be visible to the public.
              </p>
            </div>

            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-neutral-50 hover:border-blue-300 transition cursor-pointer">
              <UploadCloud className="w-10 h-10 text-neutral-400 mb-4" />
              <p className="font-semibold text-neutral-800 mb-1">Drag and drop documents here</p>
              <p className="text-sm text-neutral-500 mb-4">Supported: PDF, JPG, PNG (Max 10MB)</p>
              <button className="px-5 py-2.5 bg-white border border-neutral-300 rounded-lg font-medium text-neutral-700 shadow-sm hover:bg-neutral-50">
                Browse Files
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-3 text-center">
              Please upload clear copies of Patta, Chitta, Passbook, or 7/12 extract.
            </p>
          </section>

          {/* 2. Photo & Video Uploader */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-neutral-800">Property Media</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Image Upload Area */}
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 hover:border-green-300 transition cursor-pointer min-h-[200px]">
                <Plus className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="font-medium text-neutral-800">Add Photos</p>
                <p className="text-xs text-neutral-500 mt-1">High quality, landscape format</p>
              </div>

              {/* Video Upload Area */}
              <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-neutral-50 hover:border-green-300 transition cursor-pointer min-h-[200px]">
                <Video className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="font-medium text-neutral-800">Add Video</p>
                <p className="text-xs text-neutral-500 mt-1">MP4, MOV (Max 50MB)</p>
              </div>
            </div>

            {/* Uploaded Gallery */}
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-700 text-sm">Uploaded Photos (Drag to reorder)</h3>
              <div className="space-y-3">
                {images.map((img) => (
                  <div key={img.id} className="flex flex-col sm:flex-row gap-4 p-3 border border-neutral-200 rounded-xl items-center bg-neutral-50/50">
                    <div className="w-full sm:w-24 h-24 bg-neutral-200 rounded-lg flex items-center justify-center shrink-0">
                      <ImageIcon className="w-8 h-8 text-neutral-400" />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="font-medium text-sm text-neutral-800 mb-2">{img.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {imageTags.map(tag => (
                          <button
                            key={tag}
                            className={`px-3 py-1 text-xs rounded-full border transition ${
                              img.tag === tag 
                                ? "bg-green-100 border-green-300 text-green-800 font-medium" 
                                : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                            }`}
                            onClick={() => setImages(images.map(i => i.id === img.id ? { ...i, tag } : i))}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. Property Highlights Checklist */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-6">
              <Check className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-neutral-800">Property Highlights</h2>
            </div>
            
            <p className="text-sm text-neutral-500 mb-4">Select all features that apply to your property to help buyers find it.</p>
            
            <div className="flex flex-wrap gap-3">
              {highlightOptions.map((option) => {
                const isSelected = highlights.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleHighlight(option)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium border flex items-center gap-2 transition ${
                      isSelected 
                        ? "bg-green-600 border-green-600 text-white shadow-sm" 
                        : "bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                    {option}
                  </button>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/sell/list/property-details" className="px-6 py-3 font-medium text-neutral-600 hover:text-neutral-900 transition flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" /> Back
          </Link>
          <button className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-neutral-800 transition shadow-sm">
            Submit for Verification <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
