import { trpc, HydrateClient } from "@/trpc/server";
import { LetterPageClient } from "@/modules/Dashboard/Letter";

interface PageProps {
  params: Promise<{ 
    username: string; 
    type: string; 
  }>;
}

export default async function LetterDynamicPage({ params }: PageProps) {
  const { username, type } = await params;

  // 1. Validate or format the letter type if needed (e.g., birthday, new-month, new-year)
  const formattedType = type.replace(/-/g, ' ');

  // 2. Prefetch user data and letter contents on the server
  void trpc.user.getUserByUsername.prefetch({ username });
  return (
    <HydrateClient>
      <LetterPageClient 
        username={username} 
        letterType={type} 
        title={`${formattedType} letters`} 
      />
    </HydrateClient>
  );
}