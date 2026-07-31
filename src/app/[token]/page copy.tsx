import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SendMessageClient } from "@/modules/Massage/SendMassage";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

// 1. Generate Dynamic Metadata for Link Previews
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.secretToken, token))
    .limit(1);

  if (!targetUser) {
    return {
      title: "Anonymous messages!",
      description: "Send me anonymous messages!",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kuso-silk.vercel.app";
  const displayName = targetUser.username || "User";

  return {
    title: "Anonymous messages!",
    description: `Send anonymous messages to @${displayName}!`,
    openGraph: {
      title: "Anonymous messages!",
      description: `Send anonymous messages to @${displayName}!`,
      url: `${siteUrl}/${token}`,
      siteName: "KUSO",
      images: [
        {
          url: `${siteUrl}/opengraph-image.png`, // Absolute URL to your square image file
          width: 800,
          height: 800,
          alt: "Anonymous Messages",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary", // Forces the square thumbnail to stay on the left side
      title: "Anonymous messages!",
      description: `Send anonymous messages to @${displayName}!`,
      images: [`${siteUrl}/opengraph-image.png`],
    },
  };
}

export default async function SendMessagePage({ params }: PageProps) {
  const { token } = await params;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.secretToken, token))
    .limit(1);

  if (!targetUser) {
    notFound();
  }

  return (
    <SendMessageClient 
      username={targetUser.username} 
      favoriteColor={targetUser.favoriteColor || "pink"} 
    />
  );
}