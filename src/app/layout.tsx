import type { Metadata } from "next";
import { Archivo, Fraunces, Martian_Mono } from "next/font/google";
import { site } from "@/content/site";
import { CartProvider } from "@/context/CartContext";
import Footer from "@/components/Footer";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const code = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Licensed importation of rare drugs, specialised injections and diagnostic reagents from Europe and the United States into Cameroon, with full MINSANTE documentation and validated cold chain.",
  openGraph: {
    type: "website",
    locale: "fr_CM",
    siteName: site.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${code.variable}`}>
      <body className="flex flex-col min-h-screen bg-sterile text-manifest-900">
        <CartProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}