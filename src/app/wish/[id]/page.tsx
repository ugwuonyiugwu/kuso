import { db } from "@/db";
import { newMonthWishes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NewMonthWishClient } from "@/modules/Admin/create";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    id: string; // UUID string
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  // Query newMonthWishes table using string UUID directly
  const wish = await db.query.newMonthWishes.findFirst({
    where: eq(newMonthWishes.id, id),
  });

  if (!wish) {
    return {
      title: "New Month Wishes",
      description: "New Month Wishes",
    };
  }

  const recipientName = wish.name || "Friend";

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

  // Query newMonthWishes table using string UUID directly
  const wish = await db.query.newMonthWishes.findFirst({
    where: eq(newMonthWishes.id, id),
  });

  if (!wish) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#1a202c] flex flex-col items-center justify-center">
      <NewMonthWishClient 
        initialName={wish.name} 
        initialMessage={wish.message}
        initialId={wish.id}
      />
    </main>
  );
}