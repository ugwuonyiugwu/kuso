import { trpc, HydrateClient } from "@/trpc/server";
import { MessageDetailClient } from "@/modules/Massage/MessageDetail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function MessageDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
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