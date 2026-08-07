import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AudioProvider } from "@/context/AudioContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Chemical Business Reports | Global & African Chemical Industry Intelligence",
    template: "%s | Chemical Business Reports"
  },
  description: "Chemical Business Reports provides authoritative chemical industry news, market reports, supply chain insights, executive profile interviews, and petrochemical market analytics.",
  keywords: [
    "chemical business report",
    "chemical business reports",
    "chemical industry news",
    "chemical market reports",
    "chemical market intelligence",
    "African chemical business",
    "industrial chemical supply chain",
    "petrochemical analytics",
    "chemical manufacturing news",
    "chemical business insights",
    "chemical trade report",
    "global chemical market analysis"
  ],
  authors: [{ name: "Chemical Business Reports Editorial Team" }],
  creator: "Chemical Business Reports",
  publisher: "Coslab Media",
  metadataBase: new URL("https://chemicalbusinessreports.com"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Chemical Business Reports | Global Chemical Industry News & Analytics",
    description: "Authoritative chemical market reports, industry insights, and trade intelligence.",
    url: "https://chemicalbusinessreports.com",
    siteName: "Chemical Business Reports",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Chemical Business Reports",
    description: "Authoritative chemical market reports and industrial news."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Chemical Business Reports",
    "url": "https://chemicalbusinessreports.com",
    "logo": "https://chemicalbusinessreports.com/favicon.ico",
    "sameAs": [],
    "description": "Chemical Business Reports provides authoritative chemical industry news, market reports, supply chain insights, and chemical business analytics."
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AudioProvider>
          {children}
        </AudioProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
