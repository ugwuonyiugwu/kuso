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

  let dynamicTitle = "Anonymous messages!";
  let dynamicDescription = "Send me an anonymous message!";

  try {
    // Query the users table using secretToken since your dashboard updates users.customPrompt
    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.secretToken, token))
      .limit(1);

    if (userRecord?.customPrompt) {
      dynamicTitle = userRecord.customPrompt;
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
      card: "summary", // Forces the square image to lock on the left side
      title: dynamicTitle,
      description: dynamicDescription,
      images: [imageUrl],
    },
  };
}

export default async function SendMessagePage({ params }: PageProps) {
  const { token } = await params;

  // Fetch user data securely by token
  const result = await db
    .select({
      user: users,
    })
    .from(users)
    .where(eq(users.secretToken, token))
    .limit(1);

  const data = result[0];

  if (!data) {
    notFound();
  }

  return (
    <SendMessageClient 
      username={data.user.username} 
      favoriteColor={data.user.favoriteColor || "pink"} 
      promptContent={data.user.customPrompt || "Anonymous messages!"}
    />
  );
}