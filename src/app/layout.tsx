import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://landora.in"),
  title: {
    default: `${APP_NAME} | ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: "Landora - India's premium marketplace for verified residential plots, agricultural farmlands, independent homes, and commercial spaces across Tamil Nadu. Transparent titles, 0% brokerage.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: "Discover DTCP & CMDA approved residential plots, agricultural farmlands, and commercial properties across Coimbatore, Chennai, and Tamil Nadu.",
    url: "https://landora.in",
    siteName: APP_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_TAGLINE}`,
    description: "Discover DTCP & CMDA approved plots and farmland across Tamil Nadu.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfbfa] text-[#132a24]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
