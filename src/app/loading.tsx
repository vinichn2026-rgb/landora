import Container from "@/components/ui/Container";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="h-16 bg-white border-b border-slate-100 flex items-center px-6 justify-between">
        <div className="w-28 h-6 bg-slate-200 rounded-lg"></div>
        <div className="hidden md:flex gap-4">
          <div className="w-16 h-4 bg-slate-200 rounded"></div>
          <div className="w-16 h-4 bg-slate-200 rounded"></div>
          <div className="w-16 h-4 bg-slate-200 rounded"></div>
        </div>
        <div className="w-20 h-8 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Main Skeleton */}
      <main className="flex-1 py-10">
        <Container className="space-y-8">
          <div className="space-y-3 max-w-xl mx-auto text-center">
            <div className="w-24 h-4 bg-emerald-100 rounded-full mx-auto"></div>
            <div className="w-72 h-8 bg-slate-200 rounded-xl mx-auto"></div>
            <div className="w-96 max-w-full h-4 bg-slate-100 rounded mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="h-48 bg-slate-200"></div>
                <div className="p-5 space-y-3">
                  <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
                  <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
                  <div className="pt-2 flex justify-between border-t border-slate-100">
                    <div className="w-20 h-5 bg-slate-200 rounded"></div>
                    <div className="w-16 h-4 bg-slate-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}
