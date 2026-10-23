import PropertyPublishWizard from "@/components/seller/PropertyPublishWizard";

export const metadata = {
  title: "New Property Listing | Seller Hub - Landora",
  description: "Create and publish a new property listing on Landora marketplace.",
};

export default function NewSellerListingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <PropertyPublishWizard />
    </div>
  );
}
