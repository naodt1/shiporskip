import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionProvider } from "@/components/motion";
import { appUrl } from "@/lib/config";
import "./globals.css";

// Libertinus Serif (OFL), the open successor of Linux Libertine, for headings.
const libertinus = localFont({
  src: [
    { path: "../../assets/fonts/LibertinusSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/LibertinusSerif-Italic.woff2", weight: "400", style: "italic" },
    { path: "../../assets/fonts/LibertinusSerif-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-libertinus",
  display: "swap",
});

const description = "Builders vote. You ship. Post 2–5 unfinished side projects from GitHub, get votes and reasons in 3 days, and finish the one people actually want.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "ShipOrSkip · Builders vote. You ship.", template: "%s · ShipOrSkip" },
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
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={libertinus.variable}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
