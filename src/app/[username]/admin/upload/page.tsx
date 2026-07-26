import { trpc, HydrateClient } from "@/trpc/server";
import { AdminUploadClient } from "@/modules/Admin/Upload";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function AdminUploadPage({ params }: PageProps) {
  const { username } = await params;

  void trpc.user.getUserByUsername.prefetch({ username });

  return (
    <HydrateClient>
      <AdminUploadClient username={username} />
    </HydrateClient>
  );
}