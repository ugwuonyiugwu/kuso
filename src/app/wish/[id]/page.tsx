import { db } from "@/db";
import { frames } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NewMonthWishClient } from "@/modules/Admin/create";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    return {
      title: "New Month Wish",
      description: "Check out this new month message prepared for you!",
    };
  }

  // Fetch the specific wish data from Drizzle
  const wish = await db.query.frames.findFirst({
    where: eq(frames.id, numericId),
  });

  if (!wish) {
    return {
      title: "New Month Wish",
      description: "Check out this new month message prepared for you!",
    };
  }

  const recipientName = wish.title || "Friend";
  const messagePreview = wish.content ? wish.content.slice(0, 100) + "..." : "Happy new month!";

  // Points directly to your app/opengraph-image.png file route
  const imageUrl = "/opengraph-image.png";

  return {
    title: `New Month Wish for ${recipientName} ✨`,
    description: messagePreview,
    openGraph: {
      title: `New Month Wish for ${recipientName} ✨`,
      description: messagePreview,
      url: `/wish/${id}`,
      siteName: "KUSO",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "New Month Greeting Card",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `New Month Wish for ${recipientName} ✨`,
      description: messagePreview,
      images: [imageUrl],
    },
  };
}

export default async function WishPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    notFound();
  }

  const wish = await db.query.frames.findFirst({
    where: eq(frames.id, numericId),
  });

  if (!wish) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#1a202c] flex flex-col items-center justify-center">
      <NewMonthWishClient 
        initialName={wish.title || undefined} 
        initialMessage={wish.content || undefined}
        initialId={wish.id}
      />
    </main>
  );
}