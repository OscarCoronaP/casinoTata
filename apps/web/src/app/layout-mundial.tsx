import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals-mundial.css";
import { NavbarMundial } from "@/components/layout/NavbarMundial";
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
    default: "Quiniela Mundial 2026 — Predicciones y puntos",
    template: "%s · Quiniela Mundial 2026",
  },
  description:
    "Predicciones del Mundial 2026. Pronóstica, acumula puntos y compite en el ranking global.",
  openGraph: {
    title: "Quiniela Mundial 2026",
    description: "Predicciones, tabla y ranking del Mundial Estados Unidos · México · Canadá.",
    type: "website",
    locale: "es_MX",
  },
  robots: { index: true, follow: true },
};

export default function RootLayoutMundial({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          min-h-screen
          font-[family-name:var(--font-geist-sans)]
          antialiased
          wc-bg-gradient
        `}
        style={{ color: "var(--foreground)" }}
      >
        <Providers>
          <div className="relative min-h-screen">
            {/* Textura de campo muy sutil — líneas diagonales tenues */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(255,255,255,0.4) 40px, rgba(255,255,255,0.4) 41px)",
              }}
            />

            <NavbarMundial />

            <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
