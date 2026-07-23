import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SendMessageClient } from "@/modules/Massage/SendMassage";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
}

// 1. Generate Dynamic Metadata for Link Previews
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!targetUser) {
    return {
      title: "KUSO - Anonymous Messages",
    };
  }

  const appName = "kuso.link"; // Replace with your domain

  return {
    title: `Anonymous messages for @${username}!`,
    description: "Send me anonymous messages!",
    openGraph: {
      title: "Anonymous messages!",
      description: `Send anonymous messages to @${username}!`,
      url: `https://${appName}/${username}`,
      siteName: "KUSO",
      images: [
        {
          url: `https://${appName}/api/og?username=${username}`, // Dynamic image route we will create next
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
      description: `Send anonymous messages to @${username}!`,
      images: [`https://${appName}/api/og?username=${username}`],
    },
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
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