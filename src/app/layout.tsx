import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

/**
 * Playfair Display — the serif heading font.
 * Gives editorial warmth and authority, like a local publication.
 * Used for H1, H2, feature titles.
 */
const playfairDisplay = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * DM Sans — the body/UI font.
 * Clean geometric sans-serif, highly legible at small sizes.
 * Used for body text, labels, nav, cards, everything interactive.
 */
const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "My Long Island — Your Island. One Tap Away.",
  description:
    "The hyper-local dashboard for Long Island, NY. Real-time news, weather, LIRR, events, and everything happening in your town.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "My LI",
  },
};

export const viewport: Viewport = {
  themeColor: "#062A3A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
