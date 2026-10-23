import PropertyPublishWizard from "@/components/seller/PropertyPublishWizard";

export const metadata = {
  title: "Post Property FREE | Landora - Indian Land & Real Estate Marketplace",
  description: "Publish your plot, agricultural land, villa, or commercial property on Landora. Direct buyer enquiries across Tamil Nadu and Coimbatore.",
};

export default function PostPropertyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <PropertyPublishWizard />
    </div>
  );
}
