import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InboxClient } from "@/modules/Massage/Inbox";

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

  return <InboxClient username={targetUser.username} />;
}