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

const siteUrl = "https://kuso-silk.vercel.app";
const imageUrl = `${siteUrl}/opengraph-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Anonymous messages!",
  description: "Anonymous Q&A and messages",
  openGraph: {
    title: "Anonymous messages!",
    description: "Send me anonymous messages!",
    url: siteUrl,
    siteName: "Kuso",
    images: [
      {
        url: imageUrl,
        width: 800,
        height: 800,
        alt: "Kuso Anonymous Messages",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Anonymous messages!",
    description: "Send me anonymous messages!",
    images: [imageUrl],
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