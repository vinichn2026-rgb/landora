import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostPropertyClient from "@/components/seller/PostPropertyClient";

export const metadata = {
  title: "Sell or Rent Your Property FREE | Landora",
  description: "List your plot, land parcel, house, or commercial property on Landora with 0% brokerage. Direct genuine buyer inquiries across Tamil Nadu.",
  alternates: {
    canonical: "/post-property",
  },
};

export default function PostPropertyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Header />
      <main className="flex-1 pt-2 sm:pt-4 pb-12">
        <PostPropertyClient />
      </main>
      <Footer />
    </div>
  );
}
