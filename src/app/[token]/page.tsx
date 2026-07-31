import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SendMessageClient } from "@/modules/Massage/SendMassage";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ token: string }>;
}

const siteUrl = "https://kuso-silk.vercel.app";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const imageUrl = `${siteUrl}/opengraph-image.png`;

  return {
    metadataBase: new URL(siteUrl),
    title: "Anonymous messages!",
    description: "Send me anonymous messages!",
    openGraph: {
      title: "Anonymous messages!",
      description: "Send me anonymous messages!",
      url: `${siteUrl}/${token}`,
      siteName: "KUSO",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: "Anonymous Messages",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Anonymous messages!",
      description: "Send me anonymous messages!",
      images: [imageUrl],
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