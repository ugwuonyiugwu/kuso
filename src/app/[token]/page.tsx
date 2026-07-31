import { Metadata } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

const siteUrl = "https://kuso-silk.vercel.app";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  let dynamicHeading = "Anonymous messages!";

  try {
    // Query the users table using secretToken (which matches your schema's secret_token column)
    const userRecord = await db.query.users.findFirst({
      where: eq(users.secretToken, token),
    });

    if (userRecord && userRecord.customPrompt) {
      dynamicHeading = userRecord.customPrompt;
    }
  } catch (error) {
    console.error("Error fetching dynamic heading:", error);
  }

  const imageUrl = `${siteUrl}/opengraph-image.png`;

  return {
    metadataBase: new URL(siteUrl),
    title: dynamicHeading,
    description: "Send me an anonymous message!",
    openGraph: {
      title: dynamicHeading,
      description: "Send me an anonymous message!",
      url: `${siteUrl}/${token}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: "KUSO Preview Card",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: dynamicHeading,
      description: "Send me an anonymous message!",
      images: [imageUrl],
    },
  };
}

export default async function SendMessagePage({ params }: PageProps) {
  const { token } = await params;

  return (
    <main>
      {/* Your page contents */}
    </main>
  );
}