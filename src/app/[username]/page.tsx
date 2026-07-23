import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SendMessageClient } from "@/modules/Massage/SendMassage";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  // Search the database for the user whose link was visited
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  // If the user doesn't exist in the database, show the 404 page
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