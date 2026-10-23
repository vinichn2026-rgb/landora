import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full animate-pulse space-y-6">
        {/* Title skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="h-8 bg-slate-300 rounded w-3/4 max-w-xl" />
          <div className="h-4 bg-slate-200 rounded w-64" />
        </div>

        {/* Gallery + Sidebar skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-96 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded w-40" />
              <div className="grid grid-cols-4 gap-4">
                <div className="h-16 bg-slate-200 rounded-xl" />
                <div className="h-16 bg-slate-200 rounded-xl" />
                <div className="h-16 bg-slate-200 rounded-xl" />
                <div className="h-16 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="h-44 bg-slate-100 rounded-2xl" />
            <div className="h-80 bg-slate-100 rounded-2xl" />
          </div>
        </div>

        <div className="py-6 flex justify-center">
          <LoadingSpinner size="lg" text="Loading complete property details..." />
        </div>
      </main>

      <Footer />
    </div>
  );
}
