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
  title: "Anonymous messages!",
  description: "Anonymous Q&A and messages",
  openGraph: {
    title: "Anonymous messages!",
    description: "Send me anonymous messages!",
    url: "https://kuso-silk.vercel.app",
    siteName: "Kuso",
    images: [
      {
        url: "/api/og",
        width: 800,
        height: 800, // Changed to square dimensions for the left-side thumbnail
        alt: "Kuso Anonymous Messages",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary", // Changed from "summary_large_image" to "summary" to force the image on the left
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