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
    // Query the messages table using the route token/slug to get the specific prompt row
    const [targetMessage] = await db
      .select()
      .from(messages)
      .where(eq(messages.slug, token))
      .limit(1);

    if (targetMessage?.promptContent) {
      dynamicTitle = targetMessage.promptContent;
    }
  } catch (error) {
    console.error("Error fetching metadata message prompt:", error);
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

  // Fetch the message and its associated user via an inner join
  const result = await db
    .select({
      message: messages,
      user: users,
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.slug, token))
    .limit(1);

  const data = result[0];

  if (!data) {
    notFound();
  }

  return (
    <SendMessageClient 
      username={data.user.username} 
      favoriteColor={data.user.favoriteColor || "pink"} 
      promptContent={data.message.promptContent}
    />
  );
}