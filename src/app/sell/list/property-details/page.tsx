"use client";

import { useState } from "react";
import { MapPin, Navigation, IndianRupee, Ruler, Trees, Route, Check, ChevronRight, Info } from "lucide-react";

export default function PropertyDetailsPage() {
  const [area, setArea] = useState<string>("");
  const [unit, setUnit] = useState<string>("Acres");
  const [totalPrice, setTotalPrice] = useState<string>("");
  const [negotiable, setNegotiable] = useState<boolean>(true);
  const [roadType, setRoadType] = useState<string>("");

  const landTypes = ["Agricultural", "Residential Layout", "Commercial", "Industrial"];
  const roadTypes = ["Tar / BT", "Concrete / CC", "Mud / Kachha"];
  const units = ["Acres", "Guntas", "Cents", "Sq. Yards"];

  // Helper to calculate price per unit
  const calculatePerUnit = () => {
    const numPrice = Number(totalPrice);
    const numArea = Number(area);
    if (!totalPrice || !area || isNaN(numPrice) || isNaN(numArea) || numArea <= 0) return null;
    
    const val = numPrice / numArea;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const perUnitPrice = calculatePerUnit();

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Top Navigation / Progress */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
            <span>Step 1 of 4</span>
            <div className="w-32 h-1.5 bg-neutral-100 rounded-full overflow-hidden ml-2">
              <div className="h-full bg-green-600 w-1/4 rounded-full"></div>
            </div>
          </div>
          <button className="text-sm font-medium text-neutral-500 hover:text-neutral-800 transition">Save Draft</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Property Details</h1>
          <p className="text-neutral-500">Tell us where your land is located and its basic specifications.</p>
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* 1. Location details */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-neutral-800">Location Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">State</label>
                <select className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 bg-white">
                  <option value="">Select State</option>
                  <option value="TN">Tamil Nadu</option>
                  <option value="TG">Telangana</option>
                  <option value="KA">Karnataka</option>
                  <option value="AP">Andhra Pradesh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">District</label>
                <input type="text" placeholder="e.g. Madurai" className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Mandal / Taluk</label>
                <input type="text" placeholder="e.g. Melur" className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Village Name</label>
                <input type="text" placeholder="e.g. Navinipatti" className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Survey Number (Optional)</label>
                <input type="text" placeholder="e.g. 142/2A" className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
              </div>
            </div>

            <button type="button" className="w-full py-4 border-2 border-dashed border-green-300 bg-green-50 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-100 transition">
              <Navigation className="w-5 h-5" /> Drop Pin on Map for Exact Location
            </button>
          </section>

          {/* 2. Extent & Land Specs */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-6">
              <Trees className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-neutral-800">Extent & Specifications</h2>
            </div>
            
            <div className="space-y-6">
              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Total Area</label>
                <div className="flex gap-3">
                  <input 
                    type="number" 
                    placeholder="e.g. 5.5" 
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="flex-1 p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" 
                  />
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-1/3 p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 bg-neutral-50 font-medium"
                  >
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Land Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Land Type</label>
                <select className="w-full p-3.5 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 bg-white">
                  <option value="">Select Land Type</option>
                  {landTypes.map(lt => <option key={lt} value={lt}>{lt}</option>)}
                </select>
              </div>

              {/* Road specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-neutral-400" /> Road Approach Width
                  </label>
                  <div className="relative">
                    <input type="number" placeholder="e.g. 30" className="w-full p-3.5 pr-16 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
                    <span className="absolute right-4 top-3.5 text-neutral-500 font-medium">Feet</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1">
                    <Route className="w-4 h-4 text-neutral-400" /> Road Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roadTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRoadType(type)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition ${
                          roadType === type 
                            ? "bg-green-50 border-green-600 text-green-700" 
                            : "bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Pricing */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-6">
              <IndianRupee className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-neutral-800">Pricing Details</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Total Asking Price</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-4 w-5 h-5 text-neutral-500" />
                  <input 
                    type="number" 
                    placeholder="e.g. 5000000" 
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full p-3.5 pl-11 border border-neutral-300 rounded-xl outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 text-lg font-semibold tracking-wide" 
                  />
                </div>
                {perUnitPrice && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 animate-in fade-in">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                      Based on your inputs, this comes out to <strong>{perUnitPrice}</strong> per {unit.toLowerCase().replace(/s$/, '')}.
                    </p>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-50 transition">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center transition ${negotiable ? 'bg-green-600' : 'bg-neutral-200 border border-neutral-300'}`}>
                  {negotiable && <Check className="w-4 h-4 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={negotiable} 
                  onChange={() => setNegotiable(!negotiable)} 
                />
                <div>
                  <p className="font-medium text-neutral-800">Price is Negotiable</p>
                  <p className="text-sm text-neutral-500">Allow buyers to make counter offers.</p>
                </div>
              </label>
            </div>
          </section>
        </form>
      </main>

      {/* Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button className="px-6 py-3 font-medium text-neutral-600 hover:text-neutral-900 transition">
            Cancel
          </button>
          <button className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-green-700 transition shadow-sm shadow-green-200">
            Continue to Media <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
