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
      title: "KUSO - Anonymous Messages",
    };
  }

  const appName = "kuso.link"; // Replace with your domain
  const displayName = targetUser.username || "User";

  return {
    title: `Anonymous messages for @${displayName}!`,
    description: "Send me anonymous messages!",
    openGraph: {
      title: "Anonymous messages!",
      description: `Send anonymous messages to @${displayName}!`,
      url: `https://${appName}/${token}`,
      siteName: "KUSO",
      images: [
        {
          url: `https://${appName}/api/og?token=${token}`,
          width: 1200,
          height: 630,
          alt: "Anonymous Messages",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Anonymous messages!",
      description: `Send anonymous messages to @${displayName}!`,
      images: [`https://${appName}/api/og?token=${token}`],
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