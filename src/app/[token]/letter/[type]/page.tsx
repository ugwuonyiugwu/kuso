import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { trpc, HydrateClient } from "@/trpc/server";
import { LetterPageClient } from "@/modules/Dashboard/Letter";

interface PageProps {
  params: Promise<{ 
    token: string; 
    type: string; 
  }>;
}

export default async function LetterDynamicPage({ params }: PageProps) {
  const { token, type } = await params;

  // Look up user securely by token
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.secretToken, token))
    .limit(1);

  if (!targetUser) {
    return notFound();
  }

  const formattedType = type.replace(/-/g, ' ');

  // Prefetch data
  void trpc.user.getUserByUsername.prefetch({ username: targetUser.username });

  return (
    <HydrateClient>
      <LetterPageClient 
        username={targetUser.username} 
        token={token} 
        letterType={type} 
        title={`${formattedType} letters`} 
      />
    </HydrateClient>
  );
}