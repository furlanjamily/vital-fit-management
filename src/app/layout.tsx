import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { HeroBackground } from "@/components/landing/hero/HeroBackground";
import { MobileBottomNav } from "@/components/landing/hero/MobileBottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VitalFit Management | Premium Fitness SaaS",
  description:
    "Template premium de landing page para gestao de academias com dashboard glassmorphism.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-dvh overflow-hidden scroll-smooth antialiased lg:h-full lg:overflow-auto`}
    >
      <body
        suppressHydrationWarning
        className="relative flex h-dvh flex-col gap-[var(--mobile-nav-content-gap)] overflow-hidden font-sans text-white lg:block lg:h-auto lg:min-h-full lg:gap-0 lg:overflow-x-hidden"
      >
        <HeroBackground />
        <div className="relative z-10 min-h-0 flex-1 overflow-hidden lg:h-auto lg:flex-none lg:overflow-visible">
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
