import type { Metadata } from "next";
import localFont from "next/font/local";
/* import "./globals.css";
import { Navbar } from "@/components/layout/Navbar"; */
import "./globals-mundial.css";
import { NavbarMundial as Navbar } from "@/components/layout/NavbarMundial";
import { Providers } from "@/components/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://localhost"),
  title: {
    default: "Tataniela Mundial 2026 — Predicciones y puntos",
    template: "%s · Tataniela Mundial 2026",
  },
  description:
    "Predicciones deportivas Liga MX sin dinero real. Teléfono único, puntos por aciertos y ranking global.",
  openGraph: {
    title: "Tataniela Mundial 26",
    description: "Predicciones, tabla y ranking en tiempo casi real.",
    type: "website",
    locale: "es_MX",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 font-[family-name:var(--font-geist-sans)] antialiased text-zinc-50`}
      >
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.08),_transparent_45%)]" />
            <Navbar />
            <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
