// src/app/[username]/letter/[letterType]/edit/[frameId]/page.tsx
import { trpc, HydrateClient } from "@/trpc/server";
import { EditFrameClient } from "@/modules/Dashboard/EditFrameClient";

interface PageProps {
  params: Promise<{
    username: string;
    letterType: string;
    frameId: string;
  }>;
}

export default async function EditFramePage({ params }: PageProps) {
  const { username, letterType, frameId } = await params;
  const parsedFrameId = Number(frameId);

  // Prefetch user data and frame details on the server
  void trpc.user.getUserByUsername.prefetch({ username });
  void trpc.frame.getById.prefetch({ id: parsedFrameId });

  return (
    <HydrateClient>
      <EditFrameClient 
        username={username} 
        letterType={letterType} 
        frameId={frameId} 
      />
    </HydrateClient>
  );
}