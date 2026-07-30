import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InboxClient } from "@/modules/Massage/Inbox";
import { trpc, HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function InboxPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const token = resolvedParams.token || resolvedSearch.token;

  if (!token) {
    return notFound();
  }

  // Look up user securely by token
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.secretToken, token))
    .limit(1);

  if (!targetUser) {
    return notFound();
  }

  // Prefetch the user's inbox messages on the server using their username
  void trpc.message.getInbox.prefetch({ username: targetUser.username });

  return (
    <HydrateClient>
      <InboxClient token={token} />
    </HydrateClient>
  );
}