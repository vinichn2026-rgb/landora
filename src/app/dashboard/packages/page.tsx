import Link from "next/link";
import { Check, Star, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { APP_NAME } from "@/lib/constants";

export default function PackagesPage() {
  const plans = [
    {
      name: "Individual Owner",
      price: "₹0",
      period: "Free forever",
      desc: "For landowners selling 1 personal residential plot or home.",
      features: [
        "1 Active Property Listing",
        "Listed for 45 Days",
        "Up to 5 Photos",
        "Direct Buyer Enquiries via SMS/Email",
        "Basic Visibility in Search Results",
      ],
      popular: false,
      cta: "Post Free Listing",
      href: "/post-property",
    },
    {
      name: "Promoter Silver",
      price: "₹1,999",
      period: "per month",
      desc: "For layout developers with 5-10 plots or local real estate promoters.",
      features: [
        "Up to 10 Active Listings",
        "Featured Badge on Listing Cards",
        "Priority Ranking in City Searches",
        "Up to 15 Photos & Video Tour Link",
        "Seller Hub Lead Analytics",
        "WhatsApp Instant Lead Forwarding",
      ],
      popular: true,
      cta: "Select Silver Plan",
      href: "/post-property",
    },
    {
      name: "Developer Gold",
      price: "₹4,999",
      period: "per month",
      desc: "For townships, large gated communities, and multi-acre layout projects.",
      features: [
        "Unlimited Active Plot Listings",
        "Homepage Featured Carousel Slot",
        "Verified Project Microsite & Master Layout Map",
        "Dedicated Account & Moderation Manager",
        "Digital Brochure Download Capture",
        "Razorpay Invoice & GST Compliance",
      ],
      popular: false,
      cta: "Select Gold Plan",
      href: "/contact",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-14">
        <Container className="space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
              Transparent Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#132a24] tracking-tight mt-2">
              Listing Packages for Owners & Promoters
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Choose the right plan to showcase your land, residential layouts, and commercial properties to active buyers across Tamil Nadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border p-6 sm:p-8 flex flex-col justify-between shadow-xs transition ${
                  plan.popular
                    ? "border-[#0c4a3e] ring-2 ring-[#0c4a3e]/10 relative shadow-md"
                    : "border-[#e2e8e4]"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0c4a3e] text-[#dfb33d] text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-black text-[#132a24]">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>

                  <div className="mt-4 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-3xl font-black text-[#132a24]">{plan.price}</span>
                    <span className="text-xs text-slate-500 ml-1.5 font-medium">{plan.period}</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0c4a3e] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center block transition ${
                    plan.popular
                      ? "bg-[#0c4a3e] hover:bg-[#072e27] text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
