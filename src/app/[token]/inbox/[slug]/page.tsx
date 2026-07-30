import { trpc, HydrateClient } from "@/trpc/server";
import { MessageDetailClient } from "@/modules/Massage/MessageDetail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    token: string;
    slug: string;
  }>;
}

export default async function MessageDetailPage({ params }: PageProps) {
  const { token, slug } = await params;

  if (!token || !slug) {
    return notFound();
  }

  // Prefetch the message data on the server
  void trpc.message.getMessageBySlug.prefetch({ slug });

  return (
    <HydrateClient>
      <MessageDetailClient slug={slug} token={token} />
    </HydrateClient>
  );
}