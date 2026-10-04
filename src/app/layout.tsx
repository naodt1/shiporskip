import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion";
import { appUrl } from "@/lib/config";
import "./globals.css";

const geist = localFont({ src: "../../assets/fonts/Geist-Variable.woff2", weight: "100 900", variable: "--font-geist", display: "swap" });
const geistMono = localFont({ src: "../../assets/fonts/GeistMono-Variable.woff2", weight: "100 900", variable: "--font-geist-mono", display: "swap" });

const description = "Too many side projects? Post 2–5 unfinished repos from GitHub, let other builders vote on the one you should finish, and ship the winner.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "ShipOrSkip · Let builders pick the side project you ship", template: "%s · ShipOrSkip" },
  description,
  applicationName: "ShipOrSkip",
  keywords: ["side projects", "indie hackers", "build in public", "GitHub", "community voting", "ship it", "unfinished projects", "maker community"],
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "ShipOrSkip", locale: "en_US", title: "ShipOrSkip", description, url: "/" },
  twitter: { card: "summary_large_image", title: "ShipOrSkip", description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fafaf8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
