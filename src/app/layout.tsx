import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TRPCProvider } from "@/trpc/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kuso-silk.vercel.app"),
  title: "Send me anonymous messages!",
  description: "Anonymous Q&A and messages",
  openGraph: {
    title: "Anonymous messages!",
    description: "Send me anonymous messages!",
    url: "https://kuso-silk.vercel.app",
    siteName: "Kuso",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Kuso Anonymous Messages",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anonymous messages!",
    description: "Send me anonymous messages!",
    images: ["/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <TRPCProvider>
           {children}
          </TRPCProvider>
          <Toaster richColors position="top-center" />
        </body>
      </html>
  );
}