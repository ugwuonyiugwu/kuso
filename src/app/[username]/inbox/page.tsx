import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InboxClient } from "@/modules/Massage/Inbox";
import { trpc, HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function InboxPage({ params }: PageProps) {
  const { username } = await params;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!targetUser) {
    return notFound();
  }

  // Prefetch the user's inbox messages on the server
  void trpc.message.getInbox.prefetch({ username: targetUser.username });

  return (
    <HydrateClient>
      <InboxClient username={targetUser.username} />
    </HydrateClient>
  );
}