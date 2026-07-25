import { trpc, HydrateClient } from "@/trpc/server";
import { MessageDetailClient } from "@/modules/Massage/MessageDetail";

interface PageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export default async function MessageDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Prefetch the message data on the server
  void trpc.message.getMessageBySlug.prefetch({ slug });

  return (
    <HydrateClient>
      <MessageDetailClient slug={slug} />
    </HydrateClient>
  );
}