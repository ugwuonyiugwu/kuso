import { db } from "@/db";
import { messages, users } from "@/db/schema";
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

  let dynamicTitle = "Anonymous messages!";
  let dynamicDescription = "Send me an anonymous message!";

  try {
    // 1. First, check if the parameter is a message slug (created via updatePrompt)
    const [targetMessage] = await db
      .select({
        promptContent: messages.promptContent,
      })
      .from(messages)
      .where(eq(messages.slug, token))
      .limit(1);

    if (targetMessage?.promptContent) {
      dynamicTitle = targetMessage.promptContent;
    } else {
      // 2. Otherwise, fall back to checking if it's a base user secret token
      const [userRecord] = await db
        .select({
          customPrompt: users.customPrompt,
        })
        .from(users)
        .where(eq(users.secretToken, token))
        .limit(1);

      if (userRecord?.customPrompt) {
        dynamicTitle = userRecord.customPrompt;
      }
    }
  } catch (error) {
    console.error("Error fetching metadata custom prompt:", error);
  }

  return {
    metadataBase: new URL(siteUrl),
    title: dynamicTitle,
    description: dynamicDescription,
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
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
      title: dynamicTitle,
      description: dynamicDescription,
      images: [imageUrl],
    },
  };
}

export default async function SendMessagePage({ params }: PageProps) {
  const { token } = await params;

  // Try fetching as a message slug first, joining with the user
  let result = await db
    .select({
      messagePrompt: messages.promptContent,
      user: users,
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.slug, token))
    .limit(1);

  let username = "";
  let favoriteColor = "pink";
  let promptContent = "Anonymous messages!";

  if (result.length > 0) {
    username = result[0].user.username;
    favoriteColor = result[0].user.favoriteColor || "pink";
    promptContent = result[0].messagePrompt;
  } else {
    // Fall back to looking up directly by user secretToken if no message slug matches
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.secretToken, token))
      .limit(1);

    if (!userRecord) {
      notFound();
    }

    username = userRecord.username;
    favoriteColor = userRecord.favoriteColor || "pink";
    promptContent = userRecord.customPrompt;
  }

  return (
    <SendMessageClient 
      username={username} 
      favoriteColor={favoriteColor} 
      promptContent={promptContent}
    />
  );
}