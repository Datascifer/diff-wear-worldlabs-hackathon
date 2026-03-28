import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PushInit } from "@/components/push-init";

export const metadata: Metadata = {
  title: "Diiff — Faith, Fitness & Community",
  description:
    "A faith-centered wellness platform for young people ages 16–25 in New York City.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0a0012",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
      style={
        {
          "--font-playfair": "'Playfair Display', Georgia, serif",
          "--font-dm-sans": "'DM Sans', system-ui, sans-serif",
          "--font-space-mono": "'Space Mono', monospace",
        } as React.CSSProperties
      }
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ backgroundColor: "#0a0012", color: "white", margin: 0 }}>
        <PushInit />
        {children}
      </body>
    </html>
  );
}
