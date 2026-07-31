import { trpc, HydrateClient } from "@/trpc/server";
import { EditFrameClient } from "@/modules/Dashboard/EditFrameClient";

interface PageProps {
  params: Promise<{
    token: string;
    letterType: string;
    frameId: string;
  }>;
}

export default async function EditFramePage({ params }: PageProps) {
  const { token, letterType, frameId } = await params;
  const parsedFrameId = Number(frameId);

  // Prefetch frame details on the server
  void trpc.frame.getById.prefetch({ id: parsedFrameId });

  return (
    <HydrateClient>
      <EditFrameClient 
        token={token}
        letterType={letterType} 
        frameId={frameId} 
      />
    </HydrateClient>
  );
}