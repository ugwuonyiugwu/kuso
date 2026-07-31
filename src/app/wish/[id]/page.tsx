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
      title: "New Month Wishes",
      description: "New Month Wishes",
    };
  }

  const wish = await db.query.frames.findFirst({
    where: eq(frames.id, numericId),
  });

  if (!wish) {
    return {
      title: "New Month Wishes",
      description: "New Month Wishes",
    };
  }

  const recipientName = wish.title || "Friend";

  return {
    title: `New Month Wishes`,
    description: `New Month Wish for ${recipientName}`,
    openGraph: {
      title: "New Month Wishes",
      description: `New Month Wish for ${recipientName}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "New Month Wishes",
      description: `New Month Wish for ${recipientName}`,
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