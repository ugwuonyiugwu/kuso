import { db } from "@/db";
import { frames } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NewMonthWishClient } from "@/modules/Admin/create";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WishPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    notFound();
  }

  // Fetch the saved wish from the frames table
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